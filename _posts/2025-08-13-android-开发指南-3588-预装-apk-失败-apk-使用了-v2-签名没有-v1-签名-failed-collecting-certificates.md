---
title: "3588 预装 APK 失败 —— APK 使用了 v2 签名没有 v1 签名（Failed collecting certificates）"
date: 2025-08-13
last_modified_at: 2025-08-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3588-预装-apk-失败-apk-使用了-v2-签名没有-v1-签名-failed-collecting-certificates/
toc: true
---

概要：本文记录了在 RK3588 平台预装 Termux 应用失败的排查与解决过程。通过分析 logcat 报错信息，发现 APK 使用了 v2 签名但缺失 v1 签名，导致系统无法识别签名并预装失败。最终通过使用 PRESIGNED 和 LOCAL_REPLACE_PREBUILT_APK_INSTALLED 保留原始 APK，成功解决问题。同时详细介绍了 v2 签名原理及相关构建机制影响。


## 1. 问题描述

在以下路径中放置了 termux.apk 及其他 APK 用于预装：

```
device/rockchip/rk3588/rk3588_RB/preinstall_del
```

编译过程中未报错。每个 APK 都通过编译脚本自动生成对应的 Android.mk，并提取 lib。只需将 APK 放入 preinstall_del 中，编译时会自动处理。

烧录系统后发现，其他应用均预装成功，唯独 termux 预装失败。

---

## 2. 解决过程

### 2.1 编译日志检查

查看编译记录，warning 信息一致：

```
[ 22% 66/296] including device/rockchip/rk3588/Android.mk ...
device/rockchip/rk3588/rk3588_RB/preinstall_del/ComAssistant/Android.mk:19: warning: MY_APP_LIB_PATH=out/target/product/rk3588_RB/odm/bundled_uninstall_back-app/ComAssistant/lib/arm
device/rockchip/rk3588/rk3588_RB/preinstall_del/pressure/Android.mk:19: warning: MY_APP_LIB_PATH=out/target/product/rk3588_RB/odm/bundled_uninstall_back-app/pressure/lib/arm
device/rockchip/rk3588/rk3588_RB/preinstall_del/termux/Android.mk:21: warning: MY_APP_LIB_PATH=out/target/product/rk3588_RB/odm/bundled_uninstall_back-app/termux/lib/arm64
```

Android.mk 中应用应被放置于：

```makefile
LOCAL_MODULE_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app
```

### 2.2 系统终端验证

进入系统终端，验证文件是否复制成功：

```bash
console:/ # ls /odm/bundled_uninstall_back-app
ComAssistant  pressure  termux

console:/odm/bundled_uninstall_back-app/termux # ls
lib  termux.apk
```

### 2.3 查看 logcat 报错

```bash
logcat | grep -i termux
```

输出如下：

```
08-13 01:04:25.454   607   607 I PackageManager: New shared user com.termux: id=10079
08-13 01:04:25.454   607   607 I PackageManager: /odm/bundled_uninstall_back-app/termux changed; collecting certs
08-13 01:04:25.455   607   607 W PackageManager: Failed to scan /odm/bundled_uninstall_back-app/termux: Failed collecting certificates for /odm/bundled_uninstall_back-app/termux/termux.apk
08-13 01:04:25.455   607   607 W PackageManager: Deleting invalid package at /odm/bundled_uninstall_back-app/termux
08-13 01:04:25.456   503   514 E installd: Invalid path /odm/bundled_uninstall_back-app/termux: No such process
08-13 01:04:25.456   607   607 W PackageManager: com.android.server.pm.Installer$InstallerException: android.os.ServiceSpecificException: Invalid path /odm/bundled_uninstall_back-app/termux (code 3)
```

关键报错：

```
Failed collecting certificates for termux.apk
```

系统无法验证 APK 签名。

### 2.4 使用 apksigner 验证签名

发现预装成功的 APK 使用了 v1 签名，termux 使用 v2 签名，且缺少 v1 和其他签名。

推测是签名方式导致预装失败。

---

## 3. 解决方式

参考文章[https://blog.csdn.net/amecb897421536/article/details/141902811](https://blog.csdn.net/amecb897421536/article/details/141902811)
在 Android.mk 中添加以下配置：

```makefile
LOCAL_REPLACE_PREBUILT_APK_INSTALLED := $(LOCAL_PATH)/Weixin.apk
```

---

## 4. 原理解析

以下原理为推测。

### 4.1 v2 签名的特性

- v2/v3/v4 签名信息存储于 APK Signing Block 中，对 APK 的大部分内容进行完整性校验。
- 与 v1 的基于 JAR Entry 不同，v2 对 APK 字节级内容敏感，任何改动都会导致签名失效。

### 4.2 问题根源：构建/预置流程修改了 APK

- AOSP 的传统预置方式可能对 prebuilt APK 做处理，如：
  - 解压/重打包提取 native libs
  - 改名或重签名
  - 生成新的 package.apk

这些改动会破坏 v2 签名块，导致 PMS 无法识别。

### 4.3 PRESIGNED 的作用

```makefile
LOCAL_CERTIFICATE := PRESIGNED
```

- 告诉构建系统：该 APK 已签名，禁止使用平台密钥重签名。
- 但 PRESIGNED 无法防止其他构建处理，如重打包等。

### 4.4 LOCAL_REPLACE_PREBUILT_APK_INSTALLED 的必要性

```makefile
LOCAL_REPLACE_PREBUILT_APK_INSTALLED := $(LOCAL_PATH)/Weixin.apk
```

- 指示构建系统直接使用原始 APK 文件替换构建产物，确保 APK 字节与原始版本完全一致。
- 与 PRESIGNED 配合使用，能避免一切会破坏签名的改动。
- 成功保留 v2 签名块，PMS 校验通过，预装成功。

### 4.5 方案二：手动拷贝原始 APK

- 使用 Makefile 中的 $(shell cp ...) 或在 board.mk 中复制原始 APK 到系统镜像路径。
- 可保留 v2 签名，但需注意以下事项：
  - 文件权限设置正确
  - SELinux 上下文配置
  - native libs 放置路径正确
