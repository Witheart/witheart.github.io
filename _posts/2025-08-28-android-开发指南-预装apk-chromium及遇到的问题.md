---
title: "预装apk chromium及遇到的问题"
date: 2025-08-28
last_modified_at: 2025-08-28
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/预装apk-chromium及遇到的问题/
toc: true
---

## 问题背景

客户对浏览器内核版本有要求，于是更换chromium，但是出现了预装不上，和预装闪退的问题。

## 问题环境
- rk3568 Android11
- chromium浏览器：arm64_ChromePublic_HEVC-139.0.7258.151.apk，下载地址https://chromium.woolyss.com/


## 问题描述
### 预装不上
这个问题之前遇到过，是因为apk使用了v2证书导致的，具体参考《3588 预装 apk 失败 —— apk使用了v2签名没有v1签名(Failed collecting certificates)》。

### 预装闪退
解决证书问题后，成功预装，但是打开时发生闪退，logcat如下：
```log
08-27 17:42:29.520  2997  3023 E linker  : library "/system/lib/libchrome.so" ("/system/lib/libchrome.so") needed or dlopened by "/apex/com.android.art/lib/libnativeloader.so" is not accessible for the namespace: [name="classloader-namespace", ld_library_paths="", default_library_paths="/odm/bundled_uninstall_back-app/arm64_ChromePublic_HEVC-139.0.7258.151/arm64_ChromePublic_HEVC-139.0.7258.151.apk!/lib/armeabi-v7a", permitted_paths="/data:/mnt/expand:/data/data/org.chromium.chrome.stable"]

08-27 17:42:29.541  2997  3023 E AndroidRuntime: java.lang.RuntimeException: Starting in 32-bit mode requires the 32-bit native library.
08-27 17:42:29.541  2997  3023 E AndroidRuntime: Caused by: java.lang.UnsatisfiedLinkError: dlopen failed: library "/system/lib/libchrome.so" needed or dlopened by "/apex/com.android.art/lib/libnativeloader.so" is not accessible for the namespace "classloader-namespace"
```

表示chromium是64位应用，但是被配置为在32位模式下运行，因为找不到对应的32位的库，从而发生了闪退。

## 问题解决
预装闪退的问题实际上和预装时的配置有关，正确配置如下
```makefile
LOCAL_PATH := $(my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := arm64_ChromePublic_HEVC-139.0.7258.151
LOCAL_MODULE_CLASS := APPS
LOCAL_MODULE_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app
LOCAL_SRC_FILES := $(LOCAL_MODULE)$(COMMON_ANDROID_PACKAGE_SUFFIX)
LOCAL_CERTIFICATE := PRESIGNED
LOCAL_DEX_PREOPT := false
LOCAL_MODULE_TAGS := optional
LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)
LOCAL_JNI_SHARED_LIBRARIES_ABI := arm64
LOCAL_REPLACE_PREBUILT_APK_INSTALLED := $(LOCAL_PATH)/arm64_ChromePublic_HEVC-139.0.7258.151.apk
MY_LOCAL_PREBUILT_JNI_LIBS := \
	lib/arm64/libchrome_crashpad_handler.so \
	lib/arm64/libchrome.so

MY_APP_LIB_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app/$(LOCAL_MODULE)/lib/$(LOCAL_JNI_SHARED_LIBRARIES_ABI)
ifneq ($(LOCAL_JNI_SHARED_LIBRARIES_ABI), None)
$(warning MY_APP_LIB_PATH=$(MY_APP_LIB_PATH))
LOCAL_POST_INSTALL_CMD :=     mkdir -p $(MY_APP_LIB_PATH)     $(foreach lib, $(MY_LOCAL_PREBUILT_JNI_LIBS), ; cp -f $(LOCAL_PATH)/$(lib) $(MY_APP_LIB_PATH)/$(notdir $(lib)))
endif
include $(BUILD_PREBUILT)

```

其中最重要的是
```makefile
LOCAL_JNI_SHARED_LIBRARIES_ABI := arm64

MY_LOCAL_PREBUILT_JNI_LIBS := \
	lib/arm64/libchrome_crashpad_handler.so \
	lib/arm64/libchrome.so
```

同时需要把对应的JNI库防止在同目录下的`lib/arm64`中。
