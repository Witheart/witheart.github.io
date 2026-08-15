---
title: "RK ddr问题验证流程"
date: 2026-05-19
last_modified_at: 2026-05-19
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk-ddr问题验证流程/
toc: true
---

## 1 ddr问题表现

- Ubuntu系统显示“糟糕，出错啦”
  ![alt text](/assets/images/rk-android-ubuntu-通用开发指南/rk-ddr问题验证流程/image.png)

- 无法进入桌面，桌面是黑屏，相关gnome组件都无法显示。但是其他软件可能可以显示，比如todesk，终端可以显示的话，其标题栏可能不见了
- 无法进入桌面，可能表现为概率性，即有的时候还是能进去的
- 内核时不时panic，且大概率panic的地址不是同一处
- 和U盘进行大文件互传，触发panic

下面进行ddr问题验证流程介绍

## 2 stressapptest

该软件相比stress，更容易测出ddr问题，基本命令如下：

```bash
stressapptest -s 43200 -i 4 -C 4 -W --stop_on_errors -M 13000
```

主要是修改13000这个数值，修改为free -m看到的数值的90%。

详细使用查看`《10. 测试SOP\DDR测试\DDR压力测试 —— stressapptest\DDR压力测试 —— stressapptest.md》`

## 3 焊接测试

`DDR_UserTool_v1.41\DDR_UserTool.exe`
使用RK提供的这个软件进行焊接测试
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/rk-ddr问题验证流程/PixPin_2026-05-19_11-13-04.png)

## 4 更换Loader测试

参考`《02.3 Linux 通用编译指南\RK 如何更换 ddr 相关 bin 文件（降频、眼图测量）\RK 如何更换 ddr 相关 bin 文件（降频、眼图测量）.md》`，主要是更换该文件：`rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.15.bin`

### 4.1 降频

对于3588，可以将4个频点都改为528MHz尝试。主要是测试降频后，问题有没有改善。

### 4.2 眼图

`rk3588_ddr_lp4_2112MHz_lp5_2736MHz_eyescan_v1.11.bin`这个文件就是用于眼图测量的，具体裕量参考
《Rockchip_Developer_Guide_DDR_CN.pdf》

### 4.3 坏块测试

该文件由fae提供，会将ddr按地址划分成几个区域，不进系统进行整个ddr空间的测试
`rk3588_ddr_lp4_1560MHz_lp5_1968MHz_full_space_test_v1.21.bin`

## 5 分析要点

- 对于测试报错的，查看报错位置是同一块还是随机的，stressapptest的测试结果可以合坏块的Loader测试结果相互验证
- 对于降频，则注意调整频率前后，问题有无改善，如发生的频率，持续的时长
