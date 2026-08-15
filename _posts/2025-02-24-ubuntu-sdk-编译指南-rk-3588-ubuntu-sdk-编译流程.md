---
title: "RK 3588 Ubuntu SDK 编译流程"
date: 2025-02-24
last_modified_at: 2025-02-24
categories:
  - "Ubuntu SDK 编译指南"
tags:
  - "Ubuntu SDK 编译指南"
permalink: /ubuntu-sdk-编译指南/rk-3588-ubuntu-sdk-编译流程/
toc: true
---

概要：本教程介绍了在 RK 3588 Ubuntu SDK 环境下编译 U-Boot、内核及固件的完整流程，并说明了生成的文件及最终 update.img 的打包过程。  

切换分支后，所有内容一定要重新编译！！！（因为rockdev中文件处于.gitignore中，切换分支并不会跟着切换）

## 1. 编译 U-Boot、内核及固件  

使用以下命令依次编译 U-Boot、内核和固件：  

```sh
./build.sh uboot
./build.sh kernel
./build.sh firmware
```

firmware 编译完成后，将在 `rockdev/` 目录下生成多个链接文件，这些文件指向实际编译出的文件。例如：  

```sh
uboot.img -> ../u-boot/uboot.img
```

最终打包时，将使用 `rockdev/` 目录下的文件生成 `update.img`。  

---

## 2. 查看 `rockdev/` 目录内容  

可以使用以下命令查看 `rockdev/` 目录的文件结构：  

```sh
➜  rockdev git:(QY-RK3588) ✗ ls -al
total 7525604
drwxrwxr-x  2 hw hw       4096 2月  24 11:40 .
drwxrwxr-x 18 hw hw       4096 2月  24 09:37 ..
-rw-rw-r--  1 hw hw   33554432 2月  22 14:32 baseparameter
lrwxrwxrwx  1 hw hw         18 2月  24 11:37 boot.img -> ../kernel/boot.img
lrwxrwxrwx  1 hw hw         41 2月  24 11:37 MiniLoaderAll.bin -> ../u-boot/rk3588_spl_loader_v1.15.113.bin
lrwxrwxrwx  1 hw hw         41 2月  24 11:37 misc.img -> ../device/rockchip/rockimg/blank-misc.img
-rw-rw-r--  1 hw hw   17457152 2月  24 11:37 oem.img
lrwxrwxrwx  1 hw hw         39 2月  24 11:37 parameter.txt -> ../device/rockchip/rk3588/parameter.txt
lrwxrwxrwx  1 hw hw         64 2月  24 11:37 recovery.img -> ../buildroot/output/rockchip_rk3588_recovery/images/recovery.img
-rw-rw-r--  1 hw hw 3809327104 2月  24 11:38 rootfs.ext4
lrwxrwxrwx  1 hw hw         19 2月  24 11:37 uboot.img -> ../u-boot/uboot.img
-rw-rw-r--  1 hw hw 3884016202 2月  24 11:39 update.img
-rw-rw-r--  1 hw hw    4481024 2月  24 11:37 userdata.img
```

---

## 3. 生成 `update.img`  

首先，将 `rootfs.ext4` 放入 `rockdev/` 目录，然后执行以下命令生成 `update.img`：  

```sh
./build.sh updateimg
```

该命令会打包 `rockdev/` 目录下的所有必要文件，最终生成 `update.img`，用于设备的固件更新。  
