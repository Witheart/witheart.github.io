---
title: "查看应用包名和 Activity 名称"
date: 2024-12-24
last_modified_at: 2024-12-24
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/查看应用包名和-activity-名称/
toc: true
---

## **1 查询应用的包名**
### 方式1
1. 运行以下命令，替换关键字 `Your_APP_Name` 为具体的模块名称，也就是应用对应路径下的`vendor/rockchip/common/apps/Your_APP_Name/Android.mk`中的`LOCAL_MODULE`属性。

   ```bash
   adb shell dumpsys package | grep -A 10 "Your_APP_Name"
   ```

2. 命令输出中，找到 `applicationInfo` 字段，即可获得应用的包名。示例如下：

```plaintext
codePath=/system/priv-app/Your_APP_Name
resourcePath=/system/priv-app/Your_APP_Name
legacyNativeLibraryDir=/system/priv-app/Your_APP_Name/lib
primaryCpuAbi=arm64-v8a
secondaryCpuAbi=null
versionCode=101 minSdk=22 targetSdk=26
versionName=1.0.1
splits=[base]
apkSigningVersion=3
applicationInfo=ApplicationInfo{5e78252 com.example.appname}
flags=[ SYSTEM HAS_CODE ALLOW_CLEAR_USER_DATA LARGE_HEAP ]
privateFlags=[ PRIVATE_FLAG_ACTIVITIES_RESIZE_MODE_RESIZEABLE_VIA_SDK_VERSION PRIVATE_FLAG_REQUEST_LEGACY_EXTERNAL_STORAGE PRIVILEGED PRIVATE_FLAG_ALLOW_NATIVE_HEA
P_POINTER_TAGGING ]
forceQueryable=false
```

   **关键点**：
   - 应用包名为 `com.example.appname`，可从 `applicationInfo` 字段中提取。

### 方式2
- 或者打开应用，查看前台运行的App包名
```bash
adb shell dumpsys activity | findstr "mResumedActivity"
```

---

## **2 查询应用的主 Activity 名称**

1. 确定包名后，运行以下命令用以查询 Activity 信息：

   ```bash
   adb shell dumpsys package com.example.appname | grep -i activity
   ```

2. 根据输出结果，可以找到主 Activity 名称。例如：

   ```plaintext
   Activity Resolver Table:
   7d8ceeb com.example.appname/.ui.SplashActivity filter b1de448
   ```

   **关键点**：
   - 主 Activity 名称为 `.ui.SplashActivity`。
