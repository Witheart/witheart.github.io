---
title: "Android WebView测试与更新——rk3568"
date: 2025-07-22
last_modified_at: 2025-07-22
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-webview测试与更新-rk3568/
toc: true
---

概要：本文介绍了在rk3568平台上进行Android WebView兼容性测试的方法，探讨了不同WebView实现的差异，并提供了WebView的下载方式及预装配置方法，旨在帮助开发者解决特定网页在不同WebView版本下的显示兼容性问题。  


## 1. 什么是Android WebView  

Android WebView 是一个系统组件，允许 Android 应用在自身内部显示网页内容。它本质上是一个嵌入在应用中的浏览器引擎，开发者可以利用它加载网页而无需跳转到外部浏览器。  

---

## 2. 测试目的  

主要测试 WebView 的兼容性。  
- 某些网页只能在特定版本的 WebView 应用中正常显示。  
- 通过测试识别并选择兼容性良好的 WebView 版本，以提高用户体验和功能的稳定性。  

---

## 3. 测试方法  

- 并非直接使用内测浏览器进行测试。  
- 采用 APK 调用 WebView 实现测试。  
- 推荐使用 WebView Test 软件进行测试，支持输入指定网址进行加载验证。  

---

## 4. 不同的 WebView 区别  

- **AOSP原生WebView（com.android.webview）**  
  - rk3568 原生带有该版本，但版本较低，可能存在兼容问题。  

- **腾讯X5内核**  
  - 国内常用，兼容性较好，适合某些特定场景。  

- **Google Play版本WebView（com.google.android.webview）**  
  - 可从 Google Play 下载较新版本，具有更好的兼容性与性能。  

---

## 5. 下载地址  

- [WebView（Google Play 版本）——实测该版本缺少一个库com.google.android.trichromelibrary](https://play.google.com/store/apps/details?id=com.google.android.webview)  
- [WebView Test 测试工具](https://play.google.com/store/apps/details?id=com.snc.test.webview2&hl=zh)  
- [APK 提取工具](https://mi9.com/apk-downloader)  

笔者有一个完整的webview包
---

## 6. rk3568预装方式  

### 6.1 预装路径  

```
vendor/rockchip/common/apps/
```  

### 6.2 修改说明  

1. **取消原有预置 WebView 的安装**  
   - 删除以下文件：  
     ```
     external/chromium-webview/Android.mk
     ```

2. **修改系统默认 WebView 包名配置**  
   - 编辑以下文件：  
     ```
     frameworks/base/core/res/res/xml/config_webview_packages.xml
     ```  

---

```diff
diff --git a/external/chromium-webview/Android.mk b/external/chromium-webview/Android.mk
deleted file mode 100644
index cad13c606e..0000000000
--- a/external/chromium-webview/Android.mk
+++ /dev/null
@@ -1,36 +0,0 @@
-#
-# Copyright (C) 2014 The Android Open Source Project
-#
-# Licensed under the Apache License, Version 2.0 (the "License");
-# you may not use this file except in compliance with the License.
-# You may obtain a copy of the License at
-#
-#      http://www.apache.org/licenses/LICENSE-2.0
-#
-# Unless required by applicable law or agreed to in writing, software
-# distributed under the License is distributed on an "AS IS" BASIS,
-# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-# See the License for the specific language governing permissions and
-# limitations under the License.
-#
-
-# Install the prebuilt webview apk.
-
-LOCAL_PATH := $(call my-dir)
-
-include $(CLEAR_VARS)
-
-LOCAL_MODULE := webview
-LOCAL_MODULE_CLASS := APPS
-LOCAL_PRODUCT_MODULE := true
-LOCAL_MULTILIB := both
-LOCAL_CERTIFICATE := $(DEFAULT_SYSTEM_DEV_CERTIFICATE)
-LOCAL_REQUIRED_MODULES := \
-        libwebviewchromium_loader \
-        libwebviewchromium_plat_support
-
-LOCAL_MODULE_TARGET_ARCH := arm arm64 x86 x86_64
-my_src_arch := $(call get-prebuilt-src-arch,$(LOCAL_MODULE_TARGET_ARCH))
-LOCAL_SRC_FILES := prebuilt/$(my_src_arch)/webview.apk
-
-include $(BUILD_PREBUILT)
diff --git a/frameworks/base/core/res/res/xml/config_webview_packages.xml b/frameworks/base/core/res/res/xml/config_webview_packages.xml
index f062b59a00..9c4d65aed6 100644
--- a/frameworks/base/core/res/res/xml/config_webview_packages.xml
+++ b/frameworks/base/core/res/res/xml/config_webview_packages.xml
@@ -16,6 +16,6 @@
 
 <webviewproviders>
     <!-- The default WebView implementation -->
-    <webviewprovider description="Android WebView" packageName="com.android.webview" availableByDefault="true">
+    <webviewprovider description="Android WebView" packageName="com.google.android.webview" availableByDefault="true">
     </webviewprovider>
 </webviewproviders>
diff --git a/vendor/rockchip/common/apps/apps.mk b/vendor/rockchip/common/apps/apps.mk
index 775bbc080e..0d50b4b6d8 100755
--- a/vendor/rockchip/common/apps/apps.mk
+++ b/vendor/rockchip/common/apps/apps.mk
@@ -3,6 +3,7 @@
 PRODUCT_PACKAGES += \
     RKUpdateService   \
            Screen  \
+           webview
 
 ifeq ($(strip $(TARGET_BOARD_HARDWARE)), rk30board)
 ifeq ($(strip $(TARGET_ARCH)), arm)
diff --git a/vendor/rockchip/common/apps/webview/Android.mk b/vendor/rockchip/common/apps/webview/Android.mk
new file mode 100644
index 0000000000..0901addbd7
--- /dev/null
+++ b/vendor/rockchip/common/apps/webview/Android.mk
@@ -0,0 +1,22 @@
+LOCAL_PATH := $(my-dir)
+
+include $(CLEAR_VARS)
+LOCAL_MODULE := webview
+LOCAL_MODULE_CLASS := APPS
+LOCAL_MODULE_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app
+LOCAL_SRC_FILES := $(LOCAL_MODULE)$(COMMON_ANDROID_PACKAGE_SUFFIX)
+LOCAL_CERTIFICATE := PRESIGNED
+#LOCAL_DEX_PREOPT := false
+LOCAL_MODULE_TAGS := optional
+LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)
+LOCAL_JNI_SHARED_LIBRARIES_ABI := arm64
+MY_LOCAL_PREBUILT_JNI_LIBS := \
+	lib/arm64/libcrashpad_handler_trampoline.so\
+	lib/arm64/libwebviewchromium.so\
+
+MY_APP_LIB_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app/$(LOCAL_MODULE)/lib/$(LOCAL_JNI_SHARED_LIBRARIES_ABI)
+ifneq ($(LOCAL_JNI_SHARED_LIBRARIES_ABI), None)
+$(warning MY_APP_LIB_PATH=$(MY_APP_LIB_PATH))
+LOCAL_POST_INSTALL_CMD :=     mkdir -p $(MY_APP_LIB_PATH)     $(foreach lib, $(MY_LOCAL_PREBUILT_JNI_LIBS), ; cp -f $(LOCAL_PATH)/$(lib) $(MY_APP_LIB_PATH)/$(notdir $(lib)))
+endif
+include $(BUILD_PREBUILT)
diff --git a/vendor/rockchip/common/apps/webview/lib/arm64/libcrashpad_handler_trampoline.so b/vendor/rockchip/common/apps/webview/lib/arm64/libcrashpad_handler_trampoline.so
new file mode 100644
index 0000000000..9c21650c4b
Binary files /dev/null and b/vendor/rockchip/common/apps/webview/lib/arm64/libcrashpad_handler_trampoline.so differ
diff --git a/vendor/rockchip/common/apps/webview/lib/arm64/libwebviewchromium.so b/vendor/rockchip/common/apps/webview/lib/arm64/libwebviewchromium.so
new file mode 100644
index 0000000000..fd5f791b8f
Binary files /dev/null and b/vendor/rockchip/common/apps/webview/lib/arm64/libwebviewchromium.so differ
diff --git a/vendor/rockchip/common/apps/webview/webview.apk b/vendor/rockchip/common/apps/webview/webview.apk
new file mode 100644
index 0000000000..f5e4c14fd6
Binary files /dev/null and b/vendor/rockchip/common/apps/webview/webview.apk differ

```  
