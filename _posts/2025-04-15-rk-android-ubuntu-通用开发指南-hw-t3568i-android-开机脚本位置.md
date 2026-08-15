---
title: "HW-T3568I Android 开机脚本位置"
date: 2025-04-15
last_modified_at: 2025-04-15
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/hw-t3568i-android-开机脚本位置/
toc: true
---

概要：本文详细介绍了 HW-T3568I Android 设备开机脚本的位置及其调用链，帮助开发者理解系统启动过程中脚本的执行顺序和逻辑。


## 1. 脚本位置概述  

### 1.1 SDK 中的脚本位置  
- `device/rockchip/common/init.rockchip.rc`  
- `device/rockchip/rk356x/init.rk356x.rc`  
- `device/rockchip/rk356x/rk3568_HW/init.rk356x.rc`  

### 1.2 系统中的脚本位置  
- `/vendor/etc/init/hw/init.rockchip.rc`  
- `/vendor/etc/init/hw/init.rk356x.rc`  
- `/system/etc/init/hw/init.rc`  

**注意**：实际查看时，SDK 中的 `init.rk356x.rc` 和 `init.rk3568_HW/init.rk356x.rc` 都存在，而系统中 `init.rk356x.rc` 对应的是 SDK 中的 `rk3568_HW/init.rk356x.rc`。

---

## 2. 系统脚本执行顺序  

### 2.1 系统实际执行的脚本  
系统会执行 `/system/etc/init/hw/init.rc`，该文件中包含以下关键内容：  

```sh
import /init.environ.rc
import /system/etc/init/hw/init.usb.rc
import /init.${ro.hardware}.rc
import /vendor/etc/init/hw/init.${ro.hardware}.rc
import /system/etc/init/hw/init.usb.configfs.rc
import /system/etc/init/hw/init.${ro.zygote}.rc
```

### 2.2 `${ro.hardware}` 属性  
`${ro.hardware}` 是 Android 下的一个属性，而不是 shell 中的变量。  
- 使用 `getprop ro.hardware` 可以得到其属性值 `rk30board`。  
- 这会引入 `/vendor/etc/init/hw/init.rk30board.rc` 文件。

### 2.3 `init.rk30board.rc` 文件内容  
该文件中包含以下关键内容：  

```sh
import /vendor/etc/init/hw/init.rockchip.rc
import /vendor/etc/init/hw/init.connectivity.rc
import /vendor/etc/init/hw/init.box.samba.rc
import /vendor/etc/init/hw/init.${ro.board.platform}.rc
import /vendor/etc/init/hw/init.${ro.target.product}.rc
import /vendor/etc/init/hw/init.car.rc
import /vendor/etc/init/hw/init.optee.rc
```

### 2.4 其他关键属性  
- 使用 `getprop` 可以得到：  
  - `ro.board.platform` 为 `rk356x`  
  - `ro.target.product` 为 `tablet`  

### 2.5 完整调用链  
结合上述信息，完整的调用链如下：  
1. `/system/etc/init/hw/init.rc`  
   - 引入 `/init.${ro.hardware}.rc` (`init.rk30board.rc`)  
2. `/vendor/etc/init/hw/init.rk30board.rc`  
   - 引入 `/vendor/etc/init/hw/init.${ro.board.platform}.rc` (`init.rk356x.rc`)  
   - 引入 `/vendor/etc/init/hw/init.${ro.target.product}.rc` (`init.tablet.rc`)  

---

## 3. 调试方法  
有趣的是，我是如何找到这个调用链的呢？如下：
### 3.1 查找 `/system/etc/init/hw/init.rc` 文件  
通过以下命令可以找到该文件：  
```sh
dmesg | grep "init.rc"
```

输出示例：  
```sh
rk3568_HW:/system/etc/init/hw # dmesg | grep "init.rc"
[   20.656537] init: processing action (sys.sysctl.extra_free_kbytes=*) from (/system/etc/init/hw/init.rc:994)
[   50.740170] init: processing action (sys.boot_completed=1) from (/system/etc/init/hw/init.rc:985)
```

### 3.2 在脚本中添加调试信息  
在 `init.rc` 文件的以下两行位置添加调试信息：  
- `sys.sysctl.extra_free_kbytes=*`  
- `sys.boot_completed=1`  

示例：  
```sh
on property:sys.boot_completed=1
    ...
    exec -- /system/bin/log -p d -t init.rc "wsh!!!!!!!!!!!!!!"
```

### 3.3 查看调试日志  
在 `logcat` 中可以收到以下日志：  
```sh
04-15 13:57:21.424     0     0 I init    : processing action (sys.boot_completed=1) from (/system/etc/init/hw/init.rc:987)
04-15 13:57:21.608  1053  1053 D init.rc : wsh!!!!!!!!!!!!!!
```
