---
title: "XFCE 重启后无法自动挂载U盘、TF卡解决 —— udiskie"
date: 2025-09-30
last_modified_at: 2025-09-30
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-重启后无法自动挂载u盘-tf卡解决-udiskie/
toc: true
---

## 问题现象
开机状态下，插入tf卡或U盘，可以自动挂载并弹出文件管理器。在此状态下重启，重启后无法自动挂载，必须再次热拔插。

原因是默认的自动挂载由Thunar提供，开机没有打开Thunar的情况下，不会自动挂载

## 解决方法
```bash
sudo apt update

sudo apt install udiskie

```

在会话与启动中，添加udiskie的自启动项：
```bash
udiskie -a -n -t
```
-a自动挂载，-n显示弹出式通知，-t显示托盘图标
