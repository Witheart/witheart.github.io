---
title: "ping -I 指定网络接口 ping 时报错"
date: 2025-01-22
last_modified_at: 2025-01-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ping-i-指定网络接口-ping-时报错/
toc: true
---

## 错误信息
```bash
root@RK3568:/vendor/lib/modules# ping -I wlan0 8.8.8.8
ping: invalid option -- 'I'
Try 'ping --help' or 'ping --usage' for more information.
```

## 原因
在某些嵌入式系统或精简版 Linux 系统中，ping 工具可能是一个更简单的实现（如 BusyBox 版），而不支持 -I 参数（用于指定网络接口）。

## 解决方式：使用 iputils-ping 工具
安装 iputils-ping 工具
```bash
sudo apt update
sudo apt install iputils-ping
```

安装完成后，重新运行：
```bash
ping -I wlan0 8.8.8.8
```
