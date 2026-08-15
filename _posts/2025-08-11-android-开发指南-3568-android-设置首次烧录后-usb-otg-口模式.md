---
title: "3568 Android 设置首次烧录后 usb otg 口模式"
date: 2025-08-11
last_modified_at: 2025-08-11
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-设置首次烧录后-usb-otg-口模式/
toc: true
---

## patch

```diff
diff --git a/device/rockchip/rk356x/device.mk b/device/rockchip/rk356x/device.mk
index 9914a40ae5..982f0997ca 100644
--- a/device/rockchip/rk356x/device.mk
+++ b/device/rockchip/rk356x/device.mk
@@ -94,7 +94,7 @@ PRODUCT_PROPERTY_OVERRIDES += \
                 ro.build.shutdown_timeout=6 \
                 persist.enable_task_snapshots=false \
                 ro.vendor.frameratelock=true \
-		persist.usb3.otg.mode = 0 \
+		persist.usb3.otg.mode = 1 \
 		persist.sys.rotation.efull = true \
 		persist.demo.hdmirotates = true \
 		persist.4g.monitor.mode = 1 \
```

- 0: 主机，对应设置下 otg 模式关闭
- 1: 自动识别（从机），对应设置下 otg 模式开启
