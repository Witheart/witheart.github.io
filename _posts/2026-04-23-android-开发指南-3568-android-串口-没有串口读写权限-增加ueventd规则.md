---
title: "3568 Android 串口“没有串口读写权限” —— 增加ueventd规则"
date: 2026-04-23
last_modified_at: 2026-04-23
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-串口-没有串口读写权限-增加ueventd规则/
toc: true
---

## 问题描述
![alt text](/assets/images/android-开发指南/3568-android-串口-没有串口读写权限-增加ueventd规则/3db5a5a0-8653-47cf-8b8a-f34d29077aa0.jpg)

## 解决方式
```diff
diff --git a/device/rockchip/common/ueventd.rockchip.rc b/device/rockchip/common/ueventd.rockchip.rc
index a8a70c3e54..d74547aaee 100755
--- a/device/rockchip/common/ueventd.rockchip.rc
+++ b/device/rockchip/common/ueventd.rockchip.rc
@@ -64,11 +64,7 @@
 /dev/rtk_btusb            0660   bluetooth  net_bt
 
 # for XR
-/dev/ttyXRUSB0            0666   system     system
-/dev/ttyXRUSB1            0666   system     system
-/dev/ttyXRUSB2            0666   system     system
-/dev/ttyXRUSB3            0666   system     system
-/dev/ttyXRUSB4            0666   system     system
+/dev/ttyXRUSB*            0666   system     system
 
 # for rk3568-3.5
 /dev/ttyS0            	  0666   system     system

```
