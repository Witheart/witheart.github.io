---
title: "Android 修改系统刷机后默认语言"
date: 2025-06-21
last_modified_at: 2025-06-21
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-修改系统刷机后默认语言/
toc: true
---

## 验证环境
- rk3568
- Android 11

## 修改方式
```diff
diff --git a/build/make/target/product/full_base.mk b/build/make/target/product/full_base.mk
index 0455eb1f11..6c88e3ff75 100644
--- a/build/make/target/product/full_base.mk
+++ b/build/make/target/product/full_base.mk
@@ -48,7 +48,8 @@ PRODUCT_PROPERTY_OVERRIDES := \
     ro.config.notification_sound=pixiedust.ogg
 
 # Put en_US first in the list, so make it default.
-PRODUCT_LOCALES := zh_CN
+# PRODUCT_LOCALES := zh_CN
+PRODUCT_LOCALES := en_US
 
 # Get some sounds
 $(call inherit-product-if-exists, frameworks/base/data/sounds/AllAudio.mk)
```
- 韩文可以改为ko_KR
