---
title: "Linux 桌面应用开机自启"
date: 2025-02-26
last_modified_at: 2025-02-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-桌面应用开机自启/
toc: true
---

概要：本文介绍如何在 Linux 桌面环境下配置 GUI 应用的开机自启。由于普通的开机自启脚本可能缺少 `DISPLAY` 变量，导致 GUI 程序无法正常运行，因此本文采用桌面环境的自动启动项进行配置。


## 方法一：编辑~/.config/autostart/下文件

对于 GNOME 或 XFCE 等桌面环境用户，可以通过图形界面配置登录时自动启动应用。

### 1.1 创建 `.desktop` 文件

首先，在 `~/.config/autostart/` 目录下创建 `.desktop` 文件，例如：

```bash
nano ~/.config/autostart/vncviewer.desktop
```

示例内容：

```ini
[Desktop Entry]
Type=Application
Name=VNC Viewer AutoStart
Exec=/usr/bin/vncviewer 目标IP:端口
```

**参数说明**：

- **Type**：指定类型为应用程序（Application）。
- **Name**：应用的显示名称。
- **Exec**：启动应用的命令，可替换为实际的可执行文件路径及参数。

### 1.2 设置权限

确保该 `.desktop` 文件可执行：

```bash
chmod +x ~/.config/autostart/vncviewer.desktop
```

### 1.3 适用场景

此方法依赖于用户图形会话，适用于用户登录后自动启动 GUI 程序。

## 方法二：GNOME 桌面下使用 GUI 界面设置自启动

- 安装
```bash
sudo apt update
sudo apt install gnome-startup-applications
```

- 打开开机自启动编辑页面
```bash
gnome-session-properties
```

- 添加新的启动项，以 onboard 自启为例，命令填写为 onboard

- 重启验证
