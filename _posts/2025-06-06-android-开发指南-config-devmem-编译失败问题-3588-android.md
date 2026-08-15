---
title: "CONFIG_DEVMEM 编译失败问题 —— 3588 Android"
date: 2025-06-06
last_modified_at: 2025-06-06
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/config-devmem-编译失败问题-3588-android/
toc: true
---

## 问题
首次编译3588 Android SDK时出现编译错误，日志如下：
```sh
'out/target/product/rk3588_RB/system_ext/etc/vintf/manifest.xml': OK
checkvintf I 06-05 16:06:03  8701  8701 HostFileSystem.cpp:54] List 'out/target/product/rk3588_RB/product/etc/vintf/': NAME_NOT_FOUND
checkvintf I 06-05 16:06:03  8701  8701 check_vintf.cpp:384] All HALs in device manifest are declared in FCM <= level 6
checkvintf E 06-05 16:06:03  8701  8701 check_vintf.cpp:620] files are incompatible: Runtime info and framework compatibility matrix are incompatible: No compatible kernel requirement found (kernel FCM version = 6).
checkvintf E 06-05 16:06:03  8701  8701 check_vintf.cpp:620] For kernel requirements at matrix level 6, For config CONFIG_DEVMEM, value = y but required n
checkvintf E 06-05 16:06:03  8701  8701 check_vintf.cpp:620] : Success
INCOMPATIBLE
16:06:06 ninja failed with: exit status 1
ninja: build stopped: subcommand failed.

#### failed to build some targets (07:25 (mm:ss)) ####

Build android failed!

```

## 问题分析
- 日志中check_vintf.cpp工具明确指出CONFIG_DEVMEM选项应该设置为n而不是y。
- 查看内核的defconfig，发现根本没有设置这个选项，那就很奇怪了，最简单的操作是直接禁用这个选项，但是这个选项的的作用是访问物理地址而不是虚拟地址，禁用可能不便于调试，所以还是要看能不能绕过检测。
### 为何CONFIG_DEVMEM没有在defconfig中使能，但是最终.config中是使能状态
- 寻找这个选项
    ```sh
    find . -type f -name "*Kconfig*" | xargs grep -li "DEVMEM"
    ```

- 输出如下
    ```sh
    ./lib/Kconfig.debug
    ./security/Kconfig
    ./drivers/char/Kconfig
    ./arch/s390/Kconfig
    ./arch/x86/Kconfig
    ./arch/powerpc/Kconfig
    ./arch/arm64/Kconfig
    ./arch/arm/Kconfig
    ```
- 在`kernel-5.10/drivers/char/Kconfig`中，有对这个选项的定义
    ```sh
    config DEVMEM
        bool "/dev/mem virtual device support"
        default y
        help
        Say Y here if you want to support the /dev/mem device.
        The /dev/mem device is used to access areas of physical
        memory.
        When in doubt, say "Y".
    ```
可以看到，如果没有显式设置，系统将默认启用这个选项。

### 如何绕过VINTF兼容性检测
上文提到，CONFIG_DEVMEM选项最好还是开着，方便访问物理内存，但是VINTF检测又会在选项开启的情况下导致编译失败，那么有没有方式绕过这种检测呢？
- 参考文章
[https://blog.csdn.net/layuetian2011/article/details/134449829](https://blog.csdn.net/layuetian2011/article/details/134449829)
[https://blog.csdn.net/nb124667390/article/details/130814584](https://blog.csdn.net/nb124667390/article/details/130814584)

- 参考文章中提到了一些很难理解的修改，比如：
![alt text](/assets/images/android-开发指南/config-devmem-编译失败问题-3588-android/PixPin_2025-06-06_14-53-20.png)
- 可以看到，文章中说明要将`# CONFIG_DEVMEM is not set`这一行删除，但前面的'#'号不就是注释掉这一行的意思吗？这样的删除有何意义？
- 最开始笔者认为是作者的笔误，但是其他文章也明确提到了这一点，并且在亲自尝试后发现，这一行确实需要完全删除才能编译通过！真是奇怪！

### 删除掉`# CONFIG_DEVMEM is not set`的原理
最重要的是下面这篇文章：
[https://android.googlesource.com/kernel/configs/+/bf200243937a80c3ab1f6664d0e7b3615ce25065/README.md](https://android.googlesource.com/kernel/configs/+/bf200243937a80c3ab1f6664d0e7b3615ce25065/README.md)

文章中提到了几个重要的点：
1. **android-base.config 是定义 Android 必需内核配置的片段文件**
   - 原文：Kernel configuration settings that must be present for Android to function are located in the base config fragment, android-base.config.
2. ​**​android-base.config 是构建最终 .config 的输入片段之一 (合并过程)**
    ![alt text](/assets/images/android-开发指南/config-devmem-编译失败问题-3588-android/PixPin_2025-06-06_15-09-17.png)
3. ​**​android-base.config 是生成 FCM (框架兼容性矩阵) 中内核配置要求的来源**
    ![alt text](/assets/images/android-开发指南/config-devmem-编译失败问题-3588-android/PixPin_2025-06-06_15-10-53.png)
4. **修改 android-base.config 是允许的操作 (移除行)**
    ![alt text](/assets/images/android-开发指南/config-devmem-编译失败问题-3588-android/PixPin_2025-06-06_15-12-02.png)

**由文章可知：FCM中内核配置要求的来源之一是`​android-base.config`，类似于`# CONFIG_DEVMEM is not set`这样的注释行，会让FCM的内核配置要求生成有关`CONFIG_DEVMEM`选项检查的内容，而内核中默认使能了`CONFIG_DEVMEM`，就会导致检测不通过；而完全删除和`CONFIG_DEVMEM`有关的内容，可以避免生成`CONFIG_DEVMEM`选项检查的相关内容，从而绕过`VINTF`检测。**

## 解决方式
```diff
diff --git a/kernel/configs/s/android-5.10/android-base.config b/kernel/configs/s/android-5.10/android-base.config
index d6e1f5a3a8..d7078da1bd 100755
--- a/kernel/configs/s/android-5.10/android-base.config
+++ b/kernel/configs/s/android-5.10/android-base.config
@@ -2,7 +2,6 @@
 # CONFIG_ANDROID_LOW_MEMORY_KILLER is not set
 # CONFIG_ANDROID_PARANOID_NETWORK is not set
 # CONFIG_BPFILTER is not set
-# CONFIG_DEVMEM is not set
 # CONFIG_FHANDLE is not set
 # CONFIG_FW_CACHE is not set
 # CONFIG_IP6_NF_NAT is not set
```

这个文件的位置我也验证了很久，因为实际上有多个android-base.config，如果你尝试在这个文件中更改不生效，可以试试看下面的位置：
```sh
./mkcombinedroot/configs/android-13.config

./kernel-5.10/kernel/configs/android-base.config

./kernel/configs/s/android-5.10/android-base.config

./kernel/configs/android-5.10/android-base.config
```
