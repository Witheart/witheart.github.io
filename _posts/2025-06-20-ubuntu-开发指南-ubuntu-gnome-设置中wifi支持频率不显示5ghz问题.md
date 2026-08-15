---
title: "ubuntu gnome 设置中wifi支持频率不显示5GHz问题"
date: 2025-06-20
last_modified_at: 2025-06-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-gnome-设置中wifi支持频率不显示5ghz问题/
toc: true
---

概要：本文介绍了在 Ubuntu GNOME 设置中 WiFi 支持频率不显示 5GHz 的问题，并提出了通过在开机脚本中重启 NetworkManager 的方式来解决，同时分析了可能的原因。  


## 1. 问题描述  

WiFi 模组为双频模组，但在连接到 WiFi 后，在 GNOME 的“设置 → WiFi → 连接的WiFi右侧的设置图标”界面中，支持频率只显示 2.4GHz。正常情况下应如下图所示显示多个频段支持情况：  

![alt text](/assets/images/ubuntu-开发指南/ubuntu-gnome-设置中wifi支持频率不显示5ghz问题/28b41490e7797fd8d74e70b06e4f9f14_compress.jpg)

---

## 2. 解决方式  

在开机时重启网络管理服务，可解决该问题。具体做法如下：

- 在开机脚本中添加如下命令：

```bash
systemctl restart NetworkManager
```

这样可以在系统启动后重新加载网络管理器，从而正确识别 WiFi 模组的频率支持情况。

---

## 3. 原因分析  

推测该问题的原因是：

- WiFi 驱动启动得太早或太晚，导致 Ubuntu 在初始化网络组件时无法正确获取其“支持频率”信息。

通过重启 NetworkManager，可以确保系统在识别 WiFi 模组时重新获取完整的频率信息，从而解决显示不全的问题。
