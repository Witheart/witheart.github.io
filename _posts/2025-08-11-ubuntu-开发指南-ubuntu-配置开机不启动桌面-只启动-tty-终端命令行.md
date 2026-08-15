---
title: "Ubuntu 配置开机不启动桌面，只启动 tty 终端命令行"
date: 2025-08-11
last_modified_at: 2025-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-配置开机不启动桌面-只启动-tty-终端命令行/
toc: true
---

概要：本文介绍了如何通过内核配置和 systemd 设置，实现 Ubuntu 启动时不进入图形桌面环境，而是仅启动 tty 命令行终端，适用于服务器环境或需要精简系统资源的场景。


## 1. 内核编译时开启必要选项

在编译内核时，需确保以下选项已启用，以支持终端输出功能：

```bash
CONFIG_FRAMEBUFFER_CONSOLE=y
CONFIG_VT=y
```

---

## 2. 设置默认启动为命令行模式

使用 systemd 命令将默认启动目标设置为 multi-user.target（即命令行模式）：

```bash
sudo systemctl set-default multi-user.target
```

---

## 3. 重启系统以生效

设置完成后，重启系统即可生效：

```bash
sudo reboot
```

系统启动后将进入 tty 命令行终端，而不会加载图形界面。  

---
