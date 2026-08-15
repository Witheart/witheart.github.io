---
title: "Ubuntu 配置unity-greeter自动选择xfce桌面且用户自动登录"
date: 2026-06-09
last_modified_at: 2026-06-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-配置unity-greeter自动选择xfce桌面且用户自动登录/
toc: true
---

## 1 确认 XFCE 的 Session 名称

在配置之前，需要确认系统识别到的 XFCE 会话名称到底是什么。这取决于 `/usr/share/xsessions/` 目录下的 `.desktop` 文件名。

在终端执行：

```bash
ls /usr/share/xsessions/

```

你可能会看到 `xfce.desktop` 或 `xfce4.desktop`，以及 `ubuntu.desktop` 文件。
如果文件名是 `xfce.desktop`，那么你的 `user-session` 值就是 `xfce`。

## 2 配置 LightDM 实现自动登录与默认桌面

打开或创建 LightDM 的主配置文件 `/etc/lightdm/lightdm.conf`：

```bash
sudo vim /etc/lightdm/lightdm.conf

```

在文件中找到 `[Seat:*]` 配置段（如果没有，请手动添加）。将配置修改为如下内容：

```ini
[Seat:*]
# 指定使用的 greeter
greeter-session=unity-greeter

# 指定默认进入的桌面会话
user-session=xfce

# 启用自动登录
autologin-user=你的用户名

# 将自动登录的延迟时间设置为 0 秒
autologin-user-timeout=0

```

保存并退出。

配置完成后，重启设备 (`sudo reboot`) 即可看到系统跳过 `unity-greeter` 的输入界面，直接加载 XFCE 桌面。
