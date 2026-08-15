---
title: "编译记录"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "Ubuntu SDK 编译指南"
tags:
  - "Ubuntu SDK 编译指南"
permalink: /ubuntu-sdk-编译指南/编译记录/
toc: true
---

配置文件
device/rockchip/.BoardConfig.mk

./build.sh uboot
./build.sh kernel
./build.sh recovery
- ./build.sh firmware
  - boot.img
  - MiniLoaderAll.bin
  - misc.img
  - oem.img
  - parameter.txt
  - recovery.img
  - rootfs.img
  - uboot.img
  - userdata.img
其中大部分是符号链接
```bash
hw@hw-Default-string:/mnt/hdd/rk3568_linux_4.19/rockdev$ ls -al
total 12532
drwxrwxr-x  2 hw hw     4096 1月  22 15:45 .
drwxrwxr-x 20 hw hw     4096 1月  22 14:15 ..
lrwxrwxrwx  1 hw hw       18 1月  22 15:45 boot.img -> ../kernel/boot.img
lrwxrwxrwx  1 hw hw       41 1月  22 15:45 MiniLoaderAll.bin -> ../u-boot/rk356x_spl_loader_v1.18.112.bin
lrwxrwxrwx  1 hw hw       35 1月  22 15:45 misc.img -> ../device/rockchip/rockimg/misc.img
-rw-rw-r--  1 hw hw 17457152 1月  22 15:45 oem.img
lrwxrwxrwx  1 hw hw       53 1月  22 15:45 parameter.txt -> ../device/rockchip/rk356x/parameter-buildroot-fit.txt
lrwxrwxrwx  1 hw hw       64 1月  22 15:45 recovery.img -> ../buildroot/output/rockchip_rk356x_recovery/images/recovery.img
lrwxrwxrwx  1 hw hw       11 1月  22 15:45 rootfs.img -> rootfs.ext4
lrwxrwxrwx  1 hw hw       19 1月  22 15:45 uboot.img -> ../u-boot/uboot.img
-rw-rw-r--  1 hw hw  4472832 1月  22 15:45 userdata.img

```
./build.sh updateimg


要打包的镜像放置在 rockdev/
