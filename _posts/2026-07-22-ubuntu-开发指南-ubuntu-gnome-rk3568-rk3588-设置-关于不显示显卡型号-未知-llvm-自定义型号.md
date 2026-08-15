---
title: "Ubuntu gnome RK3568 RK3588 设置-关于不显示显卡型号(未知、llvm) —— 自定义型号"
date: 2026-07-22
last_modified_at: 2026-07-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-gnome-rk3568-rk3588-设置-关于不显示显卡型号-未知-llvm-自定义型号/
toc: true
---

## 问题描述
RK3568/RK3588使用Ubuntu20.04 Gnome系统，设置->关于处，显卡显示未知，或者显示llvm的软解，即使mali驱动已经配置了。

## 原因分析
GNOME 设置面板在打开“关于”页面时，会单独拉起一个叫 /usr/libexec/gnome-control-center-print-renderer 的极小辅助程序去查显卡名字。这个辅助程序是基于 GTK 写的标准桌面应用，它会按规矩去底层找 Mesa 驱动，也就是rockchip_dri.so。有两种情况，mesa的rockchip_dri.so没有查询的接口，或者根本没有安装mesa驱动，也就没有rockchip_dri.so。这两种情况都会报错，导致显示未知，或者显示llvm的软解。

查询时具体的报错可以通过在桌面下终端输入以下命令模拟：
```bash
env G_MESSAGES_DEBUG=all gnome-control-center info-overview
```

## 自定义显卡型号（伪装）
```bash
# 1. 把原装那个探测程序备份
sudo mv /usr/libexec/gnome-control-center-print-renderer /usr/libexec/gnome-control-center-print-renderer.bak

# 2. 伪造一个回显卡型号的脚本
sudo sh -c 'echo "#!/bin/sh" > /usr/libexec/gnome-control-center-print-renderer'
sudo sh -c 'echo "echo \"Mali-G610 GPU\"" >> /usr/libexec/gnome-control-center-print-renderer'

# 3. 给脚本赋予执行权限
sudo chmod +x /usr/libexec/gnome-control-center-print-renderer

```

修改后，GNOME 去查显卡信息的时候，关于页面会显示出我们自定义的显卡型号Mali-G610 GPU。
