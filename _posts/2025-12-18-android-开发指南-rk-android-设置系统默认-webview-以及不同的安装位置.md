---
title: "RK Android 设置系统默认 webview 以及不同的安装位置"
date: 2025-12-18
last_modified_at: 2025-12-18
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-android-设置系统默认-webview-以及不同的安装位置/
toc: true
---

## 1 设置系统默认 webview

此处参考《Rockchip 浏览器相关问题解答.pdf》

### 1.1 webview 版本区别

| Name            | PackageName                | 获取方式      | 自动更新 1 | 稳定性 |
| --------------- | -------------------------- | ------------- | ---------- | ------ |
| Android WebView | com.android.webview        | Android 自带  | 否         | 最高   |
| Chrome Stable2  | com.android.chrome         | Chrome 自带   | 可         | 高     |
| Google WebView3 | com.google.android.webview | 随 GMS 包发布 | 可         | 高     |
| Custom Webview  | com.android.webview        | 自编译        | 否         | 中     |

### 1.2 更改系统指定的 webview 包名

frameworks/base/core/res/res/xml/config_webview_packages.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Copyright 2015 The Android Open Source Project

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->

<webviewproviders>
    <!-- The default WebView implementation -->
    <webviewprovider description="Android WebView" packageName="com.google.android.webview" availableByDefault="true">
    </webviewprovider>
</webviewproviders>
```

此处可以指定几个 webview，如下
![alt text](/assets/images/android-开发指南/rk-android-设置系统默认-webview-以及不同的安装位置/PixPin_2025-12-18_17-53-57.png)

- 系统在开机过程中会自动根据这个配置文件中的顺序来搜索设备中已安装并启用的包信息，找到以后直接返回，例如上面配置中的三个发行版如果都安装并启用了，则默认的包名是 `com.android.webview`。

- 如果只有一个 webview，保留一个即可。

## 2 webview 不同的安装位置

### 2.1 默认位置

```
external/chromium-webview
├── CleanSpec.mk
├── prebuilt
│ ├── arm
│ │ └── webview.apk
│ ├── arm64
│ │ └── webview.apk
│ ├── x86
│ │ └── webview.apk
│ └── x86_64
│ └── webview.apk
└── README.md
```

实际上这里还会有个 Android.mk，此处因为需要更换 webview 的安装位置被我删除了

### 2.2 系统应用位置

如果需要将 webview 做成系统应用，需要修改安装的位置

```
vendor/rockchip/common/apps/webview
├── Android.mk
├── lib
│ ├── arm
│ │ ├── libcrashpad_handler_trampoline.so
│ │ └── libwebviewchromium.so
│ └── arm64
│ ├── libcrashpad_handler_trampoline.so
│ └── libwebviewchromium.so
└── webview.apk
```

- 此处记得将 32 位的库（arm 目录）也加进来，并且在 Android.mk 中不要指定 ABI，否则使用 32 位 webview 库的应用，可能就会闪退，报如下的错误

```
Caused by: java.lang.UnsatisfiedLinkError: dlopen failed: "/odm/bundled_uninstall_back-app/webview/lib/arm64/libwebviewchromium.so" is 64-bit instead of 32-bit
```

- Android.mk 如下

```makefile
LOCAL_PATH := $(my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := webview
LOCAL_MODULE_CLASS := APPS
LOCAL_MODULE_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app
LOCAL_SRC_FILES := $(LOCAL_MODULE)$(COMMON_ANDROID_PACKAGE_SUFFIX)
LOCAL_CERTIFICATE := PRESIGNED
LOCAL_MODULE_TAGS := optional
LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)

# LOCAL_JNI_SHARED_LIBRARIES_ABI := arm64

MY_LOCAL_PREBUILT_JNI_LIBS := \
    lib/arm64/libcrashpad_handler_trampoline.so \
    lib/arm64/libwebviewchromium.so \
    lib/arm/libcrashpad_handler_trampoline.so \
    lib/arm/libwebviewchromium.so

MY_APP_LIB_PATH_ARM64 := \
    $(TARGET_OUT_ODM)/bundled_uninstall_back-app/$(LOCAL_MODULE)/lib/arm64-v8a

MY_APP_LIB_PATH_ARM := \
    $(TARGET_OUT_ODM)/bundled_uninstall_back-app/$(LOCAL_MODULE)/lib/armeabi-v7a

LOCAL_POST_INSTALL_CMD := \
    mkdir -p $(MY_APP_LIB_PATH_ARM64); \
    mkdir -p $(MY_APP_LIB_PATH_ARM); \
    cp -f $(LOCAL_PATH)/lib/arm64/* $(MY_APP_LIB_PATH_ARM64)/; \
    cp -f $(LOCAL_PATH)/lib/arm/* $(MY_APP_LIB_PATH_ARM)/

include $(BUILD_PREBUILT)

```
