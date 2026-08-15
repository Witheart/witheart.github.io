---
title: "XFCE 自动启动项用户的屏蔽机制 Hidden=true"
date: 2025-10-13
last_modified_at: 2025-10-13
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-自动启动项用户的屏蔽机制-hidden-true/
toc: true
---

## 工作原理
当系统存在 `/etc/xdg/autostart/` 中的某个 .desktop 文件时，用户可以通过在 `~/.config/autostart/` 创建同名文件并设置 `Hidden=true` 来屏蔽它。

**示例流程：**
```
# 系统级启动项
/etc/xdg/autostart/example-app.desktop

# 用户屏蔽后（创建用户级文件）
~/.config/autostart/example-app.desktop
```

## 文件内容示例

**系统级原文件** (`/etc/xdg/autostart/example-app.desktop`)：
```ini
[Desktop Entry]
Type=Application
Name=Example Application
Exec=example-app
Hidden=false
```

**用户屏蔽文件** (`~/.config/autostart/example-app.desktop`)：
```ini
[Desktop Entry]
Hidden=true
```

## 图形界面操作

## 在 Xfce 中屏蔽系统启动项
1. 打开 **设置管理器** → **会话和启动**
2. 切换到 **应用程序自动启动** 标签页
3. 找到系统级的自动启动项
4. 取消勾选（禁用）该启动项

## 图形界面操作的效果
当您在图形界面中禁用系统级启动项时，Xfce 会自动：
1. 在 `~/.config/autostart/` 创建同名 .desktop 文件
2. 设置 `Hidden=true`


这个机制让用户可以灵活地控制自动启动行为，而无需修改系统级文件（需要 root 权限），保证了系统的可维护性和用户配置的灵活性。
