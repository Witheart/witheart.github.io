---
title: "Ubuntu 软键盘相关知识"
date: 2026-01-06
last_modified_at: 2026-01-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-软键盘相关知识/
toc: true
---

## 常用的软键盘

- 检查运行中的软键盘进程：

```bash
ps aux | grep -E "onboard|florence|caribou|gok|xvkbd|kvkbd|cellwriter"
```

- GNOME Shell 集成的软键盘，该软键盘看不到名称，是 GNOME Shell 的一部分
  ![alt text](/assets/images/ubuntu-开发指南/ubuntu-软键盘相关知识/PixPin_2026-01-06_17-11-21.png)
  很明显，自带的软键盘没有把 DOCK 顶起来，而是完全悬浮在屏幕上面

## 软键盘的开关

设置-辅助功能-屏幕键盘

```bash
# 检查GNOME的虚拟键盘设置
gsettings get org.gnome.desktop.a11y.applications screen-keyboard-enabled
```

## Gnome-shell 自带软键盘的改进

- 有一些 GNOME Shell Extension 提供了这些功能
  https://extensions.gnome.org/extension/4413/improved-osk/
  https://extensions.gnome.org/extension/1631/improve-onscreen-keyboard/
  https://extensions.gnome.org/extension/6156/touch-x/
  https://extensions.gnome.org/extension/1061/on-screen-keyboard-button/
  https://extensions.gnome.org/extension/4316/force-show-osk/
  https://extensions.gnome.org/extension/5949/gjs-osk/
  https://extensions.gnome.org/extension/6595/enhanced-osk/
  https://extensions.gnome.org/extension/3339/onscreen-keyboard-for-kiosk/
  https://extensions.gnome.org/extension/7239/im-panel-integrated-with-osk/
  https://extensions.gnome.org/extension/1061/on-screen-keyboard-button/

## onboard 的问题

无法在全屏软件上使用，可以通过设置近似解决这个问题，但不完美，参考《onboard 软键盘在全屏软件上的显示》

## 软键盘的自动唤起依赖
- 详细参考文章《Ubuntu 内置软键盘OSK(on-secreen keyboard)无法自动弹出》
屏幕键盘是否自动弹出，不是由应用决定，而是由 GNOME Shell + Mutter 判断当前输入焦点是否是“触摸输入场景”。

- 4 个核心条件

| 条件                                        | 说明                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| 1️⃣ GNOME Shell 自己的 OSK                   | `org.gnome.desktop.a11y.applications screen-keyboard-enabled` |
| 2️⃣ 输入法框架                               | IBus + GTK IM module                                          |
| 3️⃣ 应用是否是 **Wayland / GTK**             | X11/Qt/Electron 很多场景不触发                                |
| 4️⃣ GNOME 是否检测到 **Touch / Tablet 设备** |                                                               |

## 手势唤起软键盘

https://bbs.archlinux.org/viewtopic.php?id=245125

- 手法是从触摸屏底部，用一根手指即可，往上滑，大概滑到屏幕中间的位置，停顿一下。如果不行多试几次。
- 如果还不行，可能是禁用了手势，使用 Extension 软件查看是否安装了禁用手势相关的扩展，如 Disable Gesture 2021
