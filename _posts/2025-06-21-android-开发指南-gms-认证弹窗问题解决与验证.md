---
title: "gms 认证弹窗问题解决与验证"
date: 2025-06-21
last_modified_at: 2025-06-21
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/gms-认证弹窗问题解决与验证/
toc: true
---

概要：本文介绍了 Android 11 环境下 GMS 认证弹窗问题的两种解决方式，并提供了详细的代码修改方案与验证方法，确保用户在非官方认证环境下也能正常使用谷歌服务。  


## 1. 验证环境  
- 操作系统版本：Android 11  

---

## 2. 解决方式  

### 2.1 方式一：找谷歌官方过认证  
通过向 Google 官方申请认证，获取正式授权，从而避免认证弹窗问题。  

### 2.2 方式二：内置已认证的 Android ID  
在系统检查 Android ID 时，使用已认证的 ID 替换当前 ID。以下为具体代码修改方案：

```diff
diff --git a/frameworks/base/core/java/android/content/ContentResolver.java b/frameworks/base/core/java/android/content/ContentResolver.java
old mode 100644
new mode 100755
index c409613589..f6c200368e
--- a/frameworks/base/core/java/android/content/ContentResolver.java
+++ b/frameworks/base/core/java/android/content/ContentResolver.java
@@ -88,6 +88,7 @@ import java.util.Collection;
 import java.util.List;
 import java.util.Objects;
 import java.util.Random;
+import android.provider.Settings;
 import java.util.concurrent.atomic.AtomicBoolean;
 
 /**
@@ -2352,6 +2353,14 @@ public abstract class ContentResolver implements ContentInterface {
             throw new IllegalArgumentException("Unknown URI " + uri);
         }
         try {
+            if (values != null) {
+                if (values.get("android_id") != null) {
+                    String androidIDGoogle = Settings.System.getString(mContext.getContentResolver(), "google_android_id");
+                    String androidId = values.getAsString("android_id");
+                    values.clear();
+                    values.put("android_id", androidIDGoogle);
+                }
+            }
             long startTime = SystemClock.uptimeMillis();
             int rowsUpdated = provider.update(mPackageName, mAttributionTag, uri, values, extras);
             long durationMillis = SystemClock.uptimeMillis() - startTime;
```

```diff
diff --git a/frameworks/base/packages/SettingsProvider/res/values/defaults.xml b/frameworks/base/packages/SettingsProvider/res/values/defaults.xml
index b9c6e04728..3d1dce1a8c 100644
--- a/frameworks/base/packages/SettingsProvider/res/values/defaults.xml
+++ b/frameworks/base/packages/SettingsProvider/res/values/defaults.xml
@@ -26,6 +26,8 @@
     <string name="def_airplane_mode_radios" translatable="false">cell,bluetooth,wifi,nfc,wimax</string>
     <string name="airplane_mode_toggleable_radios" translatable="false">bluetooth,wifi,nfc</string>
     <string name="def_bluetooth_disabled_profiles" translatable="false">0</string>
+    <!-- google id from customer & should be overlaid by each customer -->
+    <string name="def_android_id" translatable="false">此处替换为已认证的19位Android ID</string>
     <bool name="def_auto_time">true</bool>
     <bool name="def_auto_time_zone">true</bool>
     <bool name="def_accelerometer_rotation">false</bool>
```

```diff
diff --git a/frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/DatabaseHelper.java b/frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/DatabaseHelper.java
index b7c6e04728..57e81e2220 100755
--- a/frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/DatabaseHelper.java
+++ b/frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/DatabaseHelper.java
@@ -2325,6 +2325,7 @@ class DatabaseHelper extends SQLiteOpenHelper {
     private void loadDefaultHapticSettings(SQLiteStatement stmt) {
         loadBooleanSetting(stmt, Settings.System.HAPTIC_FEEDBACK_ENABLED,
                 R.bool.def_haptic_feedback);
+                loadStringSetting(stmt, "google_android_id", R.string.def_android_id);
     }
 
     private void loadSecureSettings(SQLiteDatabase db) {
```

---

## 3. 验证  

确保设备可以访问外网（例如通过 ping google.com 验证网络连通性），然后执行以下步骤：

1. 打开谷歌应用商城（Google Play Store）；
2. 成功登录 Google 账号；
3. 正常下载应用；
4. 无出现认证弹窗。  

若以上步骤均成功，则说明问题已解决。  
