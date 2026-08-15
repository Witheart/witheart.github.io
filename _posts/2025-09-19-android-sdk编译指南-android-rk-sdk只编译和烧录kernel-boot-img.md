---
title: "Android RK SDK只编译和烧录kernel(boot.img)"
date: 2025-09-19
last_modified_at: 2025-09-19
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/android-rk-sdk只编译和烧录kernel-boot-img/
toc: true
---

在Android开发时，编译Android层耗时很长。而有时一些改动只涉及内核，能否只编译更新内核，而不编译Android部分？例如设备树的修改、内核的驱动适配。

注意：不同SDK有时候该boot.img可以生效，有时候无法生效，比较坑，推荐还是编译烧录完整的镜像。

# Android下 boot.img 与 kernel 下 boot.img 的差异
- Android 下的 `boot.img` 包含：
  - ramdisk  
  - kernel  
  - DTB  
  - resource.img  

  这个 `boot.img` 才是最终烧录到 boot 分区的镜像。

- 而 `kernel/boot.img` 是不完整的，仅包含：
  - kernel  
  - resource.img  

- `-K` 选项并不能编译出最终的 `boot.img`，因为 ramdisk 是依赖 Android 编译的。

# 如何只编译kernel得到最终要烧录的boot.img
- 上文得知，最终的boot.img中应该包含ramdisk，所以前提是编译过一次完整的镜像，以便生成这个ramdisk。
- 使用下面的命令只编译kernel，得到最终烧录的boot.img
```bash
source build/envsetup.sh

lunch

./build.sh -CK
```

# 编译产物位置
- 最终要烧录的boot.img位于
`out\target\product\<具体版型>\`
或者
`rockdev\`

- 使用md5校验，使用./build.sh脚本编译后，这两个boot.img是一样的。而如果使用make编译，则这两个文件不一定一样，可能只有out中的更新了。

- 而kernel\下的boot.img不是完整的，不能用于烧录

# 烧录方式
![alt text](/assets/images/android-sdk编译指南/android-rk-sdk只编译和烧录kernel-boot-img/PixPin_2025-09-19_11-17-54.png)
