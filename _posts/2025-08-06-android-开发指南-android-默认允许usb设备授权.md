---
title: "Android 默认允许USB设备授权"
date: 2025-08-06
last_modified_at: 2025-08-06
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-默认允许usb设备授权/
toc: true
---

## 问题描述
客户apk会访问usb的摄像头，每次打开apk时，都会出现一个权限弹窗，提示“是否允许xxx应用访问xxx设备”。需求是去掉这个弹窗，默认允许所有USB设备的访问授权。

## 解决方法
加入该补丁即可，适用于rk3588 Android13。
```diff
diff --git a/frameworks/base/packages/SystemUI/src/com/android/systemui/usb/UsbPermissionActivity.java b/frameworks/base/packages/SystemUI/src/com/android/systemui/usb/UsbPermissionActivity.java
index 9484d3a638..6863f82f6b 100644
--- a/frameworks/base/packages/SystemUI/src/com/android/systemui/usb/UsbPermissionActivity.java
+++ b/frameworks/base/packages/SystemUI/src/com/android/systemui/usb/UsbPermissionActivity.java
@@ -18,6 +18,7 @@ package com.android.systemui.usb;
 
 import android.content.res.Resources;
 import android.os.Bundle;
+import android.util.Log;
 
 import javax.inject.Inject;
 
@@ -25,9 +26,11 @@ import javax.inject.Inject;
  * Dialog shown when a package requests access to a USB device or accessory.
  */
 public class UsbPermissionActivity extends UsbDialogActivity {
-
+    private static final String TAG = "UsbAutoGrant";
+    
     private boolean mPermissionGranted = false;
     private UsbAudioWarningDialogMessage mUsbPermissionMessageHandler;
+    private boolean mAutoGranted = false;  // 新增标志位
 
     @Inject
     public UsbPermissionActivity(UsbAudioWarningDialogMessage usbAudioWarningDialogMessage) {
@@ -44,6 +47,22 @@ public class UsbPermissionActivity extends UsbDialogActivity {
     @Override
     protected void onResume() {
         super.onResume();
+        
+        // === 自动授权逻辑 ===
+        Log.d(TAG, "[witheart] 检测到USB权限请求，自动授予权限");
+        
+        // 自动执行确认操作
+        onConfirm();
+        mAutoGranted = true;  // 标记为自动授权
+        
+        // 立即结束Activity，避免显示对话框
+        finish();
+        
+        // 由于立即finish()，以下原始代码不会执行
+        return;
+        
+        // 原始代码（保留但不会执行）
+        /*
         final boolean useRecordWarning = mDialogHelper.isUsbDevice()
                 && (mDialogHelper.deviceHasAudioCapture()
                 && !mDialogHelper.packageHasAudioRecordingPermission());
@@ -62,11 +81,13 @@ public class UsbPermissionActivity extends UsbDialogActivity {
             addAlwaysUseCheckbox();
         }
         setupAlert();
+        */
     }
 
     @Override
     protected void onPause() {
-        if (isFinishing()) {
+        // 只处理手动授权的情况
+        if (!mAutoGranted && isFinishing()) {
             mDialogHelper.sendPermissionDialogResponse(mPermissionGranted);
         }
         super.onPause();
@@ -74,11 +95,13 @@ public class UsbPermissionActivity extends UsbDialogActivity {
 
     @Override
     void onConfirm() {
+        Log.d(TAG, "[witheart] USB自动授权: " + mDialogHelper.getAppName() + " | " 
+                + mDialogHelper.getDeviceDescription());
+                
         mDialogHelper.grantUidAccessPermission();
         if (isAlwaysUseChecked()) {
             mDialogHelper.setDefaultPackage();
         }
         mPermissionGranted = true;
-        finish();
     }
-}
+}
\ No newline at end of file

```

## 解决步骤
- 弹出权限弹窗后，logcat捕捉日志：
```bash
08-05 16:55:04.238   548   564 D CoreBackPreview: Window{139bb97 u0 com.android.systemui/com.android.systemui.usb.UsbPermissionActivity}: Setting back callback null
```
可定位到：
包名：com.android.systemui
类名：com.android.systemui.usb.UsbPermissionActivity
路径推导：packages/SystemUI/src/com/android/systemui/usb/

由此找到`frameworks/base/packages/SystemUI/src/com/android/systemui/usb/UsbPermissionActivity.java`

- 在onResume中直接调用onConfirm，直接确认，并且确认后调用finish，结束activity
- 然后将原来onConfirm中的finish去掉
