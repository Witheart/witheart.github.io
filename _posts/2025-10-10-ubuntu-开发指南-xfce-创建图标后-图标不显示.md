---
title: "Xfce 创建图标后，图标不显示"
date: 2025-10-10
last_modified_at: 2025-10-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-创建图标后-图标不显示/
toc: true
---

## 问题描述
在 Xfce 桌面环境中创建应用程序图标后，虽然桌面文件配置正确，但图标无法正常显示。

- 结构示例
```
/usr/share/icons/hicolor/
├── 64x64/apps/stress-gui.png
└── 128x128/apps/stress-gui.png

/usr/share/applications/stress-gui.desktop
[Desktop Entry]
Version=1.0.0
Type=Application
Name=系统负载测试工具
Comment=Ubuntu系统负载测试工具的图形界面
Exec=/usr/bin/stress-gui
Icon=stress-gui
Categories=System;Monitor;
Terminal=false
```

## 解决方案

```bash
# 强制更新 hicolor 主题图标缓存
sudo gtk-update-icon-cache -f /usr/share/icons/hicolor
```
