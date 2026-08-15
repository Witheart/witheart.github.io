---
title: "3588 Android 13 预装apk失败 —— 不再使用apps.mk"
date: 2026-04-08
last_modified_at: 2026-04-08
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3588-android-13-预装apk失败-不再使用apps-mk/
toc: true
---

## 问题背景
vendor/rockchip/common/apps下预置apk，填写对应的Android.mk，并且在vendor/rockchip/common/apps/apps.mk的PRODUCT_PACKAGES字段也添加了，但是apk预置失败。

## 解决方式
不使用vendor/rockchip/common/apps/apps.mk的PRODUCT_PACKAGES字段，而是使用device/rockchip/common/modules/rockchip_apps.mk的PRODUCT_PACKAGES字段。

## 原因解释
apps.mk在Android11 SDK中，有被调用，如下
```bash
vendor/rockchip/common/device-vendor.mk:19:$(call inherit-product-if-exists, vendor/rockchip/common/apps/apps.mk)
```
但在Android13中，该调用消失了，只对rockchip_apps.mk有调用
```bash
/mnt/hdd/rk3588_android13_sdk/rk_android13/device/rockchip/common/device.mk:853:$(call inherit-product, device/rockchip/common/modules/rockchip_apps.mk)
```
故在apps.mk中控制编译不生效。
