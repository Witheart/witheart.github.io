---
title: "Android 屏幕最小宽度与 DPI 设定"
date: 2025-06-04
last_modified_at: 2025-06-04
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-屏幕最小宽度与-dpi-设定/
toc: true
---

概要：本文介绍了 Android 系统中通过设置 DPI（每英寸点数）和最小宽度来优化屏幕显示效果的方法，并附带了相关命令和源码修改示例，适用于开发者进行系统定制和适配优化。


## 1. DPI 与最小宽度的作用  

调整 DPI 可以影响文字大小和图形的显示效果，尤其在低分辨率设备上，通过 DPI 的合理设置可以提升用户体验。  

开发者选项中提供了“最小宽度”这一设置项，也可以影响屏幕的显示逻辑密度，从而改变界面元素的大小与布局。

参考链接：[https://blog.csdn.net/qq_40184851/article/details/126723582](https://blog.csdn.net/qq_40184851/article/details/126723582)

---

## 2. 屏幕密度相关命令  

### 2.1 查看当前屏幕密度  

```bash
wm density
```

### 2.2 设置屏幕密度  

```bash
wm density 640
```

### 2.3 重置屏幕密度为默认  

```bash
wm density reset
```

---

## 3. 设置默认屏幕密度  

可以通过系统源码中添加属性来设置默认的屏幕密度。

### 3.1 修改设备配置文件  

路径：`device/rockchip/rk3588/rk3588_QY/rk3588_QY.mk`

```diff
@@ -45,3 +45,4 @@
 PRODUCT_PROPERTY_OVERRIDES += persist.bt.power.down=true
 PRODUCT_PROPERTY_OVERRIDES += vendor.hwc.device.extend=HDMI-A-1,DP-1
 PRODUCT_PROPERTY_OVERRIDES += vendor.hwc.device.primary=eDP-1
 PRODUCT_PROPERTY_OVERRIDES += persist.hotspot.enable=false
+PRODUCT_PROPERTY_OVERRIDES += persist.lcd_density=144
```

### 3.2 修改 SettingsProvider 加载密度设置  

路径：`frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/DatabaseHelper.java`

```diff
@@ -2323,6 +2323,9 @@
 // persistent system property instead.
 //loadSetting(stmt, Settings.Secure.ADB_ENABLED, 0);

+// 调整屏幕密度，使用 wm density 查看，wm density <数值> 设置
+loadSetting(stmt, Settings.Secure.DISPLAY_DENSITY_FORCED,SystemProperties.get("persist.lcd_density"));
+
 if ("box".equals(SystemProperties.get("ro.target.product")))
     loadSetting(stmt, Settings.Secure.DISPLAY_DENSITY_FORCED,SystemProperties.get("ro.sf.lcd_density"));
```

---

通过上述设置，开发者可以在系统构建阶段指定默认的屏幕密度，提升系统在不同设备上的适配效果。
