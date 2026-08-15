---
title: "RK 如何更换 ddr 相关 bin 文件（降频、眼图测量）"
date: 2026-05-19
last_modified_at: 2026-05-19
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/rk-如何更换-ddr-相关-bin-文件-降频-眼图测量/
toc: true
---

## 修改历史

| 时间     | 历史                              |
| -------- | --------------------------------- |
| 20260114 | 创建了本文                        |
| 20260519 | 加入了bin文件的编辑、training结果 |

- RK 没有开源ddr初始化的相关代码，而是采用bin文件的形式发布的。这些bin文件在SDK中的`rkbin/bin`路径下，也可以在`https://github.com/rockchip-linux/rkbin`上找到。

## 1 ddr bin 文件的更换

以3588为例，使用的bin文件在这个文件中定义了
`rkbin/RKBOOT/RK3588MINIALL.ini`

```ini
[CHIP_NAME]
NAME=RK3588
[VERSION]
MAJOR=1
MINOR=11
[CODE471_OPTION]
NUM=1
Path1=bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.15.bin
Sleep=1
[CODE472_OPTION]
NUM=1
Path1=bin/rk35/rk3588_usbplug_v1.11.bin
[LOADER_OPTION]
NUM=2
LOADER1=FlashData
LOADER2=FlashBoot
FlashData=bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.15.bin
FlashBoot=bin/rk35/rk3588_spl_v1.13.bin
[OUTPUT]
PATH=rk3588_spl_loader_v1.15.113.bin
[SYSTEM]
NEWIDB=true
[FLAG]
471_RC4_OFF=true
RC4_OFF=true
[BOOT1_PARAM]
WORD_0=0x0
WORD_1=0x0
WORD_2=0x0
WORD_3=0x0
WORD_4=0x0
WORD_5=0x0
WORD_6=0x0
WORD_7=0x0

```

可以看到，使用的是`bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.15.bin`这个文件。

进入该路径下，可以看到有以下bin文件

- rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.15.bin: lpddr4 对应2112MHz频率，lpddr5 对应2736MHz频率。
- rk3588_ddr_lp4_2112MHz_lp5_2736MHz_eyescan_v1.11.bin: 用于眼图测量
- rk3583_ddr_lp4_1848MHz_lp5_2112MHz_v1.14.bin: 同第一个，只是降频了

如果要降频，只需要把第一个删掉，将第三个的名字改成和第一个一样，然后编译uboot。

- 编译时，bin文件将和其他启动文件一起，被编译成uboot下的Loader —— `u-boot/rk3588_spl_loader_v1.15.113.bin`，rockdev中也有指向该Loader的软链接`MiniLoaderAll.bin`。

## 2 烧录方式

只需烧录Loader
![alt text](/assets/images/linux-通用编译指南/rk-如何更换-ddr-相关-bin-文件-降频-眼图测量/PixPin_2026-01-14_09-22-28.png)

烧录后可能卡在等待Loader成功，请重新上电

- 如果使用的是眼图测试的Loader，那么上电后在串口就会输出眼图测试的结果
- 眼图测试的Loader烧录后无法正常开机，也进不了Loader模式烧录，只能使用maskrom烧录

## 3 bin文件的编辑

如果想修改bin文件更换其他频点，需要使用下面的软件进行编辑，再合到Loader中
`rk_ddrBin_tool_windows_V1.08\rk_ddrBin_tool.exe`

## 4 training结果

注意，较新版本的bin文件，开机时会通过debug串口打印出训练结果，下面贴出一段异常的，输出了很多l0，具体的含义暂未查询到

```bash
DDR d4bf75a5a6 cym 26/01/19-11:11.53,fwver: v1.22
ch0 ttot10
ch1 ttot10
ch2 ttot10
ch3 ttot10
ch0 ttot10
LPDDR4X, 528MHz
channel[0] BW=16 Col=10 Bk=8 CS0 Row=17 CS1 Row=17 CS=2 Die BW=16 Size=4096MB
ch1 ttot10
channel[1] BW=16 Col=10 Bk=8 CS0 Row=17 CS1 Row=17 CS=2 Die BW=16 Size=4096MB
ch2 ttot10
channel[2] BW=16 Col=10 Bk=8 CS0 Row=17 CS1 Row=17 CS=2 Die BW=16 Size=4096MB
ch3 ttot10
channel[3] BW=16 Col=10 Bk=8 CS0 Row=17 CS1 Row=17 CS=2 Die BW=16 Size=4096MB
Manufacturer ID:0x13
DQS rds:l0,l0

DQ rds:l0 l0 l0 l0 l0 l0 l0 l0, l0 l0 l0 l0 l0 l0 l0 l0
DQS rds:l0,l0

DQ rds:l0 l0 l0 l0 l0 l0 l0 l0, l0 l0 l0 l0 l0 l0 l0 l0
DQS rds:l0,l0

DQ rds:l0 l0 l0 l0 l0 l0 l0 l0, l0 l0 l0 l0 l0 l0 l0 l0
DQS rds:l0,l0

DQ rds:l0 l0 l0 l0 l0 l0 l0 l0, l0 l0 l0 l0 l0 l0 l0 l0

```
