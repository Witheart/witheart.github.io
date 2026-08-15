---
title: "Qt程序以不同方式运行：QT_QPA_PLATFORM=xcb 和 eglfs的区别？"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/qt程序以不同方式运行-qt-qpa-platform-xcb-和-eglfs的区别/
toc: true
---

## 参考链接
以下的文章让我受益匪浅，建议仔细阅读：
- [https://doc.embedfire.com/linux/rk356x/Qt/zh/latest/lubancat_qt/qtdemo/demo_run.html](https://doc.embedfire.com/linux/rk356x/Qt/zh/latest/lubancat_qt/qtdemo/demo_run.html)

本文大都是参考复制上文的。

## 一句话总结
QT_QPA_PLATFORM变量决定了Qt程序运行的层级，xcb为通过显示管理器运行，而eglfs则不通过显示管理器，更直接。

## 详解
![Linux显示框图](/assets/images/ubuntu-开发指南/qt程序以不同方式运行-qt-qpa-platform-xcb-和-eglfs的区别/image.png)
- EGLFS是一个平台插件，可以在EGL和OpenGL ES之上运行Qt应用程序，eglfs使用opengles/egl进行gpu渲染后，直接送给drm去显示，而不需要通过X11或Wayland这样的实际窗口系统。
- XCB是桌面Linux平台上使用的X11插件，使用窗口系统显示Qt程序。

## eglfs显示配置
```bash
#! /bin/bash

# 指定qt库路径
export LD_LIBRARY_PATH=/opt/qt-everywhere-src-5.15.8/ext/lib:$LD_LIBRARY_PATH

# 指定qt插件路径
export QT_QPA_PLATFORM_PLUGIN_PATH=/opt/qt-everywhere-src-5.15.8/ext/plugins

# 导出qtdemo的安装目录
export APP_DIR=/usr/local/qt-app

# 指定显示平台插件，通过QT_QPA_PLATFORM 或者-platform命令行选项指定其他设置
export QT_QPA_PLATFORM=eglfs

# 此环境变量强制执行特定的插件，QT_QPA_EGLFS_INTEGRATION 设置为eglfs_kms将使用KMS / DRM后端
export QT_QPA_EGLFS_INTEGRATION=eglfs_kms

# KMS / DRM后端还通过JSON文件支持自定义配置，QT_QPA_EGLFS_KMS_CONFIG 指定配置文件的路径
export QT_QPA_EGLFS_KMS_CONFIG=/usr/local/qt-app/conf/cursor.json

# 指定将current选择一种分辨率与当前模式匹配的模式，QT_QPA_EGLFS_ALWAYS_SET_MODE
#export QT_QPA_EGLFS_ALWAYS_SET_MODE=1

# 默认情况下，KMS后端将使用旧版API，可以启用DRM atomic API，通过将QT_QPA_EGLFS_KMS_ATOMIC环境变量设置为1。
#export QT_QPA_EGLFS_KMS_ATOMIC=1

# 鼠标设备，
# QT_QPA_EVDEV_MOUSE_PARAMETERS
#export QT_QPA_EVDEV_MOUSE_PARAMETERS=abs
#export QT_QPA_EVDEV_MOUSE_PARAMETERS=/dev/input/event2

# hide/show cursor
#export QT_QPA_EGLFS_HIDECURSOR=1

# 键盘设备
# 触摸设备
# eglfs 启用tslib支持,QT_QPA_EGLFS_TSLIB
#export QT_QPA_EGLFS_TSLIB=1

# 字体库
#export QT_QPA_FONTDIR=/usr/share/fonts

# 界面旋转角度 0，90，180，270，（使用触摸屏幕，触摸也要旋转）
#export QT_QPA_EGLFS_ROTATION=-90

$APP_DIR/FireApp
```

如果运行上面这个脚本出现问题，可以设置下环境变量QT_QPA_EGLFS_DEBUG=1，查看下具体原因，一般而言是需要安装下面软件包：
```bash
sudo apt update
sudo apt-get install libegl* libgles*

# 其他相关（板卡系统不同，可能有些库搜索不到，可以不安装）
sudo apt install libmtdev-dev libinput-dev libts-dev
```

通过设置环境变量QT_QPA_EGLFS_KMS_CONFIG，来自定义配置文件，例如run_eglfs.sh脚本设置的cursor.json文件内容：
```bash
{
"device": "/dev/dri/card0",
"hwcursor": false,
"outputs": [
    { "name": "HDMI-A-1", "mode": "1920x1080" }
]
}
```
上面是设置HDMI-A-1输出等等，更多参数设置和说明，请参考下https://doc.qt.io/qt-5/embedded-linux.html#display-output。

## xcb显示配置
```bash
#! /bin/bash

# 指定默认的显示器
export DISPLAY=:0.0
# 导出qtdemo的安装目录
export APP_DIR=/usr/local/qt-app
# 指定qt库路径
export LD_LIBRARY_PATH=/opt/qt-everywhere-src-5.15.8/ext/lib
# 指定qt插件路径
export QT_QPA_PLATFORM_PLUGIN_PATH=/opt/qt-everywhere-src-5.15.8/ext/plugins

# 指定平台，通过QT_QPA_PLATFORM 或者-platform命令行选项指定其他设置
export QT_QPA_PLATFORM=xcb

echo "start FireApp..."
#运行FireApp
$APP_DIR/FireApp
```

简单测试可以直接使用命令：
```bash
# 简单测试命令
LD_LIBRARY_PATH=/opt/qt-everywhere-src-5.15.8/ext/lib ./FireApp -platform xcb
```

以上部署测试都是通过shell脚本设置运行环境变量，也可以直接添加到系统配置中（直接添加环境变量到/etc/ld.so.conf，/etc/profile.d/xxx.sh）。
