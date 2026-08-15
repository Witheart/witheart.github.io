---
title: "查看 Ubuntu 系统的桌面环境和显示管理器"
date: 2025-01-09
last_modified_at: 2025-01-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/查看-ubuntu-系统的桌面环境和显示管理器/
toc: true
---

下面这些命令需要在桌面终端中执行，否则可能无法准确显示结果。如果你通过 SSH 登录系统，`$XDG_SESSION_TYPE` 和 `$XDG_CURRENT_DESKTOP` 等变量可能为空或返回非图形环境相关的值。


## **1. 查看当前使用的显示管理器**

显示管理器（Display Manager）是系统启动图形界面的核心工具，它负责显示登录界面并启动桌面环境。可以通过以下命令查看当前系统使用的显示管理器：

```bash
cat /etc/X11/default-display-manager
```

终端将返回显示管理器的路径。例如：

- `/usr/sbin/gdm3`：表示使用的是 **GDM3**（GNOME Display Manager）。
- `/usr/sbin/lightdm`：表示使用的是 **LightDM**（Light Display Manager）。
- `/usr/bin/sddm`：表示使用的是 **SDDM**（KDE 的显示管理器）。
- `/usr/bin/kdm`：表示使用的是 **KDM**（KDE 的旧版显示管理器）。

---

## **2. 检查显示管理器服务的运行状态**

如果你想进一步确认显示管理器是否正常运行，可以使用以下命令查看它的服务状态：

```bash
systemctl status display-manager
```

这条命令会输出显示管理器服务的详细状态，示例如下：

```plaintext
● gdm.service - GNOME Display Manager
   Loaded: loaded (/lib/systemd/system/gdm.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2025-01-09 10:12:34 UTC; 1h 23min ago
```

通过输出的 `Active: active (running)`，可以确认显示管理器正在正常运行；同时还能看到当前运行的显示管理器名称（例如 `gdm.service` 表示 GDM）。

---

## **3. 查看当前使用的显示协议（X11 或 Wayland）**

Linux 系统的图形界面可以通过两种主要的显示协议运行：**X11** 和 **Wayland**。可以通过以下命令查看当前会话使用的是哪种显示协议：

```bash
echo $XDG_SESSION_TYPE
```

可能的输出值有：

- `x11`：表示当前使用的是 **X11** 协议。
- `wayland`：表示当前使用的是 **Wayland** 协议。

X11 是传统的显示协议，兼容性好，而 Wayland 是现代的显示协议，旨在提高性能和安全性。

---

## **4. 查看当前的桌面环境**

桌面环境（Desktop Environment）是你与系统交互的主要图形界面，例如 GNOME、KDE、Xfce 等。可以通过以下命令查看当前使用的桌面环境：

```bash
echo $XDG_CURRENT_DESKTOP
```

终端将返回桌面环境的名称，例如：

- `GNOME`：表示使用的是 **GNOME 桌面环境**。
- `LXDE`：表示使用的是 **LXDE 桌面环境**。
- `XFCE`：表示使用的是 **Xfce 桌面环境**。
- `KDE`：表示使用的是 **KDE Plasma 桌面环境**。
- `MATE`：表示使用的是 **MATE 桌面环境**。
