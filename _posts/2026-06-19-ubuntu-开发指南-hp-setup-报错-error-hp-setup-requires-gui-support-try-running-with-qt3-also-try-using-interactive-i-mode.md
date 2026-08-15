---
title: "hp-setup 报错 error hp-setup requires GUI support (try running with --qt3). Also, try using interactive (-i) mode"
date: 2026-06-19
last_modified_at: 2026-06-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/hp-setup-报错-error-hp-setup-requires-gui-support-try-running-with-qt3-also-try-using-interactive-i-mode/
toc: true
---

## 环境
- RK3568
- Ubuntu20.04
- lightdm
- x11
- xfce4

## 问题描述
安装hplip后，在桌面终端，输入hp-setup，报错如下
```bash
$ hp-setup

HP Linux Imaging and Printing System (ver. 3.20.3)
Printer/Fax Setup Utility ver. 9.0

Copyright (c) 2001-18 HP Development Company, LP
This software comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to distribute it
under certain conditions. See COPYING file for more details.

warning: GUI Modules PyQt4 and PyQt5 are not installed
error: hp-setup requires GUI support (try running with --qt3). Also, try using interactive (-i) mode.

```

## 解决方式
```bash
sudo apt update
sudo apt install python3-pyqt5 hplip-gui
```

然后再次尝试，可正常弹出窗口
![alt text](/assets/images/ubuntu-开发指南/hp-setup-报错-error-hp-setup-requires-gui-support-try-running-with-qt3-also-try-using-interactive-i-mode/PixPin_2026-06-19_13-58-31.png)
