---
title: "Ubuntu 修改主机名"
date: 2025-12-20
last_modified_at: 2025-12-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-修改主机名/
toc: true
---

## 概念
主机名就像计算机的"名字"，在终端提示符中显示为user@firefly的"firefly"部分，主要用于在网络中唯一标识设备、方便管理员区分多台服务器、防止误操作，并让日常的SSH连接和系统管理更加直观和人性化。

## 修改方式

### 方法一：使用 hostnamectl 命令（推荐）

```bash
# 查看当前主机名
hostnamectl

# 修改主机名（将 new-hostname 替换为你想要的主机名）
sudo hostnamectl set-hostname new-hostname
```

例如，要将主机名改为"myubuntu"：
```bash
sudo hostnamectl set-hostname myubuntu
```

**编辑 hosts 文件**：
```bash
sudo nano /etc/hosts
```
将文件中所有的旧主机名替换为新主机名，特别是 `127.0.1.1` 这行。

### 方法二：修改相关配置文件

1. **编辑 hostname 文件**：
```bash
sudo nano /etc/hostname
```
删除原有内容，写入新主机名，保存退出。

2. **编辑 hosts 文件**：
```bash
sudo nano /etc/hosts
```
将文件中所有的旧主机名替换为新主机名，特别是 `127.0.1.1` 这行。
