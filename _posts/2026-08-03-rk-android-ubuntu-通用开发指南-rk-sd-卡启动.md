---
title: "RK SD 卡启动"
date: 2026-08-03
last_modified_at: 2026-08-03
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk-sd-卡启动/
toc: true
---

## 参考
- https://redmine.rock-chips.com/issues/613225
- 《RK3568改为SD卡启动》 —— by李浩

## 硬件支持
要使用SD启动卡，在硬件上要求一开机就给sd卡供电（基本要从电源直供），并且默认的SD卡检查脚要有效。

## 启动卡制作方式

- SD_Firmware_Tool.exe 1.7版本
- 选择SD启动卡进行制作

## Android 说明
对于Android来说，启动卡的固件跟烧录的emmc/flash的固件不通用，先确保烧录的emmc里的固件能正常开机，在此基础上修改:
1. 在`kernel`使用的`dts`里的`&sdmmc`里增加`supports-emmc`属性，并且把emmc配置关掉(即把`&sdhci`里的`status ="disabled"`)。
2. 把`device/rockchip/rk356x/device.mk`下使用的`PRODUCT_BOOT_DEVICE`值设为sd卡的，比如(要按实际的值修改)
```diff
-PRODUCT_BOOT_DEVICE := fe310000.sdhci,fe330000.nandc
+PRODUCT_BOOT_DEVICE := fe2b0000.dwmmc
```

注意，EMMC中内容可能需要先擦除才能启动，不擦除的未验证，擦除的已验证可以正常启动。

## Linux 说明
- 制作SD启动卡即可（TF卡和EMMC同时有系统会优先使用TF卡引导）
- 注意，由于bootarg（dts中）中指定了以固定的PARTUUID启动，所以即使是使用了TF卡引导，挂载时由于TF卡和EMMC中的rootfs的PARTUUID相同，会错误挂载EMMC中的rootfs，需要修改PARTUUID，使正确挂载
