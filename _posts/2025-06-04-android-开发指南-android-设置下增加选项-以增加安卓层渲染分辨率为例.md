---
title: "Android 设置下增加选项——以增加安卓层渲染分辨率为例"
date: 2025-06-04
last_modified_at: 2025-06-04
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-设置下增加选项-以增加安卓层渲染分辨率为例/
toc: true
---

概要：本文介绍了如何在 Android 系统中，通过添加系统属性和设置 UI，实现主帧缓冲分辨率的动态调节功能，包括系统属性的配置、多语言支持、UI 接口接入、自定义 Preference 控件的实现与解析等，适用于性能调试、节能优化和兼容性测试等场景。


## 1. 增加主帧缓冲大小设置的系统属性  

在设备配置文件 `rk3588_QY.mk` 中添加了一个新的系统属性：  
```diff
+PRODUCT_PROPERTY_OVERRIDES += persist.vendor.framebuffer.main
```

该属性为**持久化属性**，相关信息如下：

- **属性名**：`persist.vendor.framebuffer.main`  
- **用途**：控制主显示帧缓冲区的分辨率  
- **默认值**：空字符串（表示自动模式）  
- **存储位置**：保存在 `/data` 分区，重启后仍然有效  

---

## 2. 在系统设置中添加帧缓冲大小调节选项  

### 2.1 新增多语言字符串资源  

- **英文 (`strings.xml`)**：
  ```xml
  <string name="framebuffer_title">Main Framebuffer Size</string>
  <string name="framebuffer_summary">Current: %s</string>
  <string name="auto_mode">auto</string>
  ```

- **中文 (`values-zh-rCN/strings.xml`)**：
  ```xml
  <string name="framebuffer_title">主帧缓冲大小</string>
  <string name="framebuffer_summary">当前: %s</string>
  <string name="auto_mode">自动</string>
  ```
  
### 2.2 新增分辨率选项数组  

在 `arrays.xml` 中添加两个数组：  

```xml
<string-array name="framebuffer_entries">
    <item>自动 (Auto)</item>
    <item>800x600</item>
    <item>1024x768</item>
    <!-- 其他分辨率选项 -->
</string-array>

<string-array name="framebuffer_values">
    <item></item> <!-- 空值表示自动模式 -->
    <item>800x600</item>
    <item>1024x768</item>
    <!-- 其他分辨率值 -->
</string-array>
```

### 2.3 在显示设置中添加 UI 入口  

在 `display_settings.xml` 中添加新的设置项：  

```xml
<com.android.settings.FramebufferSizePreference
    android:key="main_framebuffer_size"
    android:title="@string/framebuffer_title"
    android:persistent="true" />
```
- **类名**：`com.android.settings.FramebufferSizePreference`  
  - 自定义 `ListPreference` 实现类  
- **android:key**：`main_framebuffer_size`  
  - 设置项的唯一标识符，用于存储用户选择  
- **android:title**：显示在 UI 中的标题  
- **android:persistent**：设置值会保存到系统数据库中，重启仍然保留  

### 2.4 新增分辨率选择控制器  

核心实现类为 `FramebufferSizePreference.java`，功能如下：  

```java
package com.android.settings;

import android.content.Context;
import android.os.SystemProperties;
import android.util.AttributeSet;
import android.util.Log;
import androidx.preference.ListPreference;

public class FramebufferSizePreference extends ListPreference {
    private static final String TAG = "FramebufferPref";
    private static final String PROP_KEY = "persist.vendor.framebuffer.main";
    private static final String EMPTY_VALUE = ""; // 空字符串表示自动

    // 构造函数（从XML加载时调用）
    public FramebufferSizePreference(Context context, AttributeSet attrs) {
        super(context, attrs);  // 调用父类构造
        init();  // 执行初始化
    }

    // 初始化方法
    private void init() {
        // 设置选项显示文本
        setEntries(R.array.framebuffer_entries);
        // 设置选项实际值
        setEntryValues(R.array.framebuffer_values);
        
        // 获取当前系统属性值（默认自动）
        String currentValue = SystemProperties.get(PROP_KEY, EMPTY_VALUE);
        // 设置UI当前选中的值
        setValue(currentValue);
        // 更新描述文本（显示当前状态）
        updateSummary(currentValue);
        
        // 设置值变更监听器
        setOnPreferenceChangeListener((preference, newValue) -> {
            String value = (String) newValue;
            // 处理自动选项 - 设为空字符串
            if (EMPTY_VALUE.equals(value)) {
                SystemProperties.set(PROP_KEY, EMPTY_VALUE);
            } else {
                SystemProperties.set(PROP_KEY, value);
            }
            // 更新UI描述
            updateSummary(value);
            // 记录日志
            Log.i(TAG, "Set framebuffer size: " + value);
            return true; // 确认变更
        });
    }

    // 更新描述文本的方法
    private void updateSummary(String value) {
         if (EMPTY_VALUE.equals(value)) {
            // 自动模式：使用"auto"资源
            setSummary(getContext().getString(R.string.framebuffer_summary, 
                       getContext().getString(R.string.auto_mode)));
        } else {
            // 手动模式：直接显示分辨率
            setSummary(getContext().getString(R.string.framebuffer_summary, value));
        }
    }
}
```

---

## 3. 主要功能说明  

- **属性控制**：通过 `persist.vendor.framebuffer.main` 动态调整主显示缓冲分辨率  
- **自动模式**：空字符串表示系统自动选择最佳分辨率  
- **持久化存储**：用户选择的分辨率重启后仍然有效  
- **UI反馈**：  
  - 设置界面显示所有可用分辨率  
  - 摘要动态显示当前分辨率（如 "当前: 1920x1080"）  
  - 自动模式显示为 "auto" / "自动"  

## 4. 完整修改代码
```diff
➜  rk_android13 git:(QY-3588) git --no-pager diff d363f3e685b7ffc3d44e66566400a9f3dd18c5ee 0534e75c36241d8338981d2e9abd3559fee4f2b9
diff --git a/device/rockchip/rk3588/rk3588_QY/rk3588_QY.mk b/device/rockchip/rk3588/rk3588_QY/rk3588_QY.mk
index 942bf8d8b5..908076183c 100644
--- a/device/rockchip/rk3588/rk3588_QY/rk3588_QY.mk
+++ b/device/rockchip/rk3588/rk3588_QY/rk3588_QY.mk
@@ -46,3 +46,4 @@ PRODUCT_PROPERTY_OVERRIDES += vendor.hwc.device.extend=HDMI-A-1,DP-1
 PRODUCT_PROPERTY_OVERRIDES += vendor.hwc.device.primary=eDP-1
 PRODUCT_PROPERTY_OVERRIDES += persist.hotspot.enable=false
 PRODUCT_PROPERTY_OVERRIDES += persist.lcd_density=144
+PRODUCT_PROPERTY_OVERRIDES += persist.vendor.framebuffer.main
\ No newline at end of file
diff --git a/packages/apps/Settings/res/values-zh-rCN/strings.xml b/packages/apps/Settings/res/values-zh-rCN/strings.xml
index fcb2d6c82d..3dcdfca54d 100644
--- a/packages/apps/Settings/res/values-zh-rCN/strings.xml
+++ b/packages/apps/Settings/res/values-zh-rCN/strings.xml
@@ -1443,6 +1443,9 @@
     <string name="input_pwd">输入密码</string>
     <string name="alert_dialog_ok">确定</string>
     <string name="alert_dialog_cancel">取消</string>
+    <string name="framebuffer_title">主帧缓冲大小</string>
+    <string name="framebuffer_summary">当前: %s</string>
+    <string name="auto_mode">自动</string>
     <string name="drop_down">下拉窗口</string>
     <string name="brightness" msgid="6216871641021779698">"亮度"</string>
     <string name="brightness_title" msgid="5457874893085305155">"亮度"</string>
diff --git a/packages/apps/Settings/res/values/arrays.xml b/packages/apps/Settings/res/values/arrays.xml
index d5f85eb3f0..8a442baf83 100644
--- a/packages/apps/Settings/res/values/arrays.xml
+++ b/packages/apps/Settings/res/values/arrays.xml
@@ -1710,4 +1710,28 @@
     <integer-array name="network_mode_3g_deprecated_carrier_id" translatable="false">
     </integer-array>
 
+    <string-array name="framebuffer_entries">
+        <item>自动 (Auto)</item>
+        <item>800x600</item>
+        <item>1024x768</item>
+        <item>1280x800</item>
+        <item>1280x1024</item>
+        <item>1366x768</item>
+        <item>1920x1080</item>
+        <item>2560x1440</item>
+        <item>3840x2160</item>
+    </string-array>
+
+    <string-array name="framebuffer_values">
+        <item></item>
+        <item>800x600</item>
+        <item>1024x768</item>
+        <item>1280x800</item>
+        <item>1280x1024</item>
+        <item>1366x768</item>
+        <item>1920x1080</item>
+        <item>2560x1440</item>
+        <item>3840x2160</item>
+    </string-array>
+
 </resources>
diff --git a/packages/apps/Settings/res/values/strings.xml b/packages/apps/Settings/res/values/strings.xml
index 15a554724b..667f04efc8 100644
--- a/packages/apps/Settings/res/values/strings.xml
+++ b/packages/apps/Settings/res/values/strings.xml
@@ -3207,6 +3207,9 @@
     <string name="input_pwd">input password</string>
     <string name="alert_dialog_ok">ok</string>
     <string name="alert_dialog_cancel">cancel</string>
+    <string name="framebuffer_title">Main Framebuffer Size</string>
+    <string name="framebuffer_summary">Current: %s</string>
+    <string name="auto_mode">auto</string>
     <string name="drop_down">Pull down window</string>
     <!-- Sound & display settings screen, setting option name to change brightness level -->
     <string name="brightness">Brightness level</string>
diff --git a/packages/apps/Settings/res/xml/display_settings.xml b/packages/apps/Settings/res/xml/display_settings.xml
index 2739135c06..4314915774 100644
--- a/packages/apps/Settings/res/xml/display_settings.xml
+++ b/packages/apps/Settings/res/xml/display_settings.xml
@@ -190,6 +190,11 @@
             android:entries="@array/set_screen_orientation_entries"
             android:entryValues="@array/set_screen_orientation_values" />
 
+        <com.android.settings.FramebufferSizePreference
+            android:key="main_framebuffer_size"
+            android:title="@string/framebuffer_title"
+            android:persistent="true" />
+
         <com.android.settings.BrightnessPullDown
             android:key="pull_down"
             android:title="@string/drop_down"
diff --git a/packages/apps/Settings/src/com/android/settings/FramebufferSizePreference.java b/packages/apps/Settings/src/com/android/settings/FramebufferSizePreference.java
new file mode 100644
index 0000000000..2fa7223c6f
--- /dev/null
+++ b/packages/apps/Settings/src/com/android/settings/FramebufferSizePreference.java
@@ -0,0 +1,53 @@
+package com.android.settings;
+
+import android.content.Context;
+import android.os.SystemProperties;
+import android.util.AttributeSet;
+import android.util.Log;
+import androidx.preference.ListPreference;
+
+public class FramebufferSizePreference extends ListPreference {
+    private static final String TAG = "FramebufferPref";
+    private static final String PROP_KEY = "persist.vendor.framebuffer.main";
+    private static final String EMPTY_VALUE = ""; // 空字符串表示自动
+
+    public FramebufferSizePreference(Context context, AttributeSet attrs) {
+        super(context, attrs);
+        init();
+    }
+
+    private void init() {
+        // 设置选项数据
+        setEntries(R.array.framebuffer_entries);
+        setEntryValues(R.array.framebuffer_values);
+        
+        // 读取当前值
+        String currentValue = SystemProperties.get(PROP_KEY, EMPTY_VALUE);
+        setValue(currentValue);
+        updateSummary(currentValue);
+        
+        // 设置值变化监听器
+        setOnPreferenceChangeListener((preference, newValue) -> {
+            String value = (String) newValue;
+            // 处理自动选项 - 设置为空字符串
+            if (EMPTY_VALUE.equals(value)) {
+                SystemProperties.set(PROP_KEY, EMPTY_VALUE);
+            } else {
+                SystemProperties.set(PROP_KEY, value);
+            }
+            updateSummary(value);
+            Log.i(TAG, "Set framebuffer size: " + value);
+            return true;
+        });
+    }
+
+    private void updateSummary(String value) {
+         if (EMPTY_VALUE.equals(value)) {
+            // 显示为"自动"
+            setSummary(getContext().getString(R.string.framebuffer_summary, 
+                       getContext().getString(R.string.auto_mode)));
+        } else {
+            setSummary(getContext().getString(R.string.framebuffer_summary, value));
+        }
+    }
+}
\ No newline at end of file
```
