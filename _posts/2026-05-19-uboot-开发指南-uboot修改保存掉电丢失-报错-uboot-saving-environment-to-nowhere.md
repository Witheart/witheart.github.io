---
title: "Uboot修改保存掉电丢失，报错 uboot Saving Environment to nowhere"
date: 2026-05-19
last_modified_at: 2026-05-19
categories:
  - "Uboot 开发指南"
tags:
  - "Uboot 开发指南"
permalink: /uboot-开发指南/uboot修改保存掉电丢失-报错-uboot-saving-environment-to-nowhere/
toc: true
---

## 问题现象
Uboot修改参数后，使用saveenv保存。报错 uboot Saving Environment to nowhere，直接pri可以看到修改生效，但是断电重启后修改丢失

## 问题原因
Uboot没有配置参数的保存位置，导致修改只在内存中生效，掉电丢失

## 解决方式
目前暂找不到在持久化保存参数的方式，如果要修改参数，可直接修改源码，重新烧录UBOOT解决，如下

修改启动顺序：
```bash
diff --git a/u-boot/include/configs/rockchip-common.h b/u-boot/include/configs/rockchip-common.h
index f12af5d6b..024e459e8 100644
--- a/u-boot/include/configs/rockchip-common.h
+++ b/u-boot/include/configs/rockchip-common.h
@@ -65,8 +65,8 @@
 /* First try to boot from SD (index 1), then eMMC (index 0) */
 #if CONFIG_IS_ENABLED(CMD_MMC)
 	#define BOOT_TARGET_MMC(func) \
-		func(MMC, mmc, 1) \
-		func(MMC, mmc, 0)
+		func(MMC, mmc, 0) \
+		func(MMC, mmc, 1)
 #else
 	#define BOOT_TARGET_MMC(func)
 #endif

```

注意，这个参数是UBOOT的标准启动参数，RK那一套定制的优先级更高。参考：《05.2 Ubuntu 开发指南\3588 启动介质顺序\3588 启动介质顺序.md》
