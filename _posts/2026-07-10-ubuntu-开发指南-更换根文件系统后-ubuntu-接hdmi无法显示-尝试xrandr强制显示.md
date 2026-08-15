---
title: "更换根文件系统后 Ubuntu 接HDMI无法显示 —— 尝试xrandr强制显示"
date: 2026-07-10
last_modified_at: 2026-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/更换根文件系统后-ubuntu-接hdmi无法显示-尝试xrandr强制显示/
toc: true
---

## 强制显示
- 使用下面的命令，查看有没有读到屏幕
```bash
xrandr
```

如果没有读到屏幕，可能是环境变量的原因，如果是debug串口一般不用设置环境变量，如果是ssh则需要设置
```bash
export DISPLAY=:0
```
- 在读到屏幕的情况下，强行输出到HDMI
```bash
xrandr --output HDMI-1 --mode 1280x1024
```


## 为什么 `xrandr` 能强行点亮？

在 Linux 图形架构中，显示链路是这样的：
**内核 (DRM) -> X 服务器 (Xorg) -> 窗口管理器/显示管理器 (GDM/GNOME) -> 你的屏幕**

当你敲下 `xrandr` 命令时，你其实是直接绕过了最上层的桌面环境，手动给 X 服务器下达了指令：“强行把 Framebuffer（显存区）映射到 HDMI-1 接口，并按照 1280x1024 的时序输出信号。”
既然它亮了，说明底层的管道全都是通的，只是**没有组件自动点亮屏幕**。
