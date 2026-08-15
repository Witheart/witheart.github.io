---
title: "RK3588 配置显卡栈显卡驱动配置，libmali 桌面加速"
date: 2026-07-09
last_modified_at: 2026-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-配置显卡栈显卡驱动配置-libmali-桌面加速/
toc: true
---

## 前言
从ubuntu-base构建出来的系统，桌面使用cpu软解。要想使用上3588内置的mali显卡，必须打上显卡驱动。但是实测只安装瑞芯微预编译（rk SDK debian/package目录下）的libmali包后，桌面无法显示，须配合xserver和librga2才能显示。即使这样，桌面仍旧卡顿，需配合环境变量，才能让桌面完整吃到mali的加速。本文是折腾这一套图形栈的记录。

## 问题描述
- ubuntu-base构建的系统，只使用cpu软解
- 安装xserver-xorg-core_1.20.13-1ubuntu1~20.04.2_arm64.deb后重启，桌面无法显示，卡kernel logo
- 再安装librga2_2.2.0-1_arm64.deb，桌面就可以显示了，还不如cpu软解流畅，拖动窗口有明显撕裂，不跟手

## 正确配置流程
### 预编译包获取与处理
- rk SDK debian/package目录下，获取这些包
libmali-valhall-g610-g13p0-x11-gbm_1.9-1_arm64.deb
librga2_2.2.0-1_arm64.deb
xserver-xorg-core_1.20.11-1_arm64.deb
xserver-xorg-legacy_1.20.11-1_arm64.deb

xserver-xorg-common就不用了，因为其他包依赖这个包，降级安装预编译的包，会导致apt依赖失效，导致apt不可用

- 安装xserver-xorg-core会报错
```bash
xserver-xorg-core depends on libselinux1 (>= 3.1~); however: Version of libselinux1:arm64 on system is 3.0-1build2.
```
Ubuntu20.04没有libselinux1(>= 3.1~)的软件源，此处我们拆包进行处理。
```bash
# 1. 创建临时解压目录
mkdir -p unpack_tmp

# 2. 将 deb 包的内容和控制信息解压到临时目录
dpkg-deb -R xserver-xorg-core_1.20.11-1_arm64.deb unpack_tmp/

# 3. 修改控制文件中的依赖版本
# 你可以手动 vim unpack_tmp/DEBIAN/control 修改，或者直接用下面这条 sed 命令替换：
sed -i 's/libselinux1 (>= 3.1~)/libselinux1 (>= 3.0)/g' unpack_tmp/DEBIAN/control

# 4. 重新打包生成一个新的 deb 文件
dpkg-deb -b unpack_tmp/ xserver-xorg-core_mod_1.20.11-1_arm64.deb

# 重新安装
sudo dpkg -i xserver-xorg-core_mod_1.20.11-1_arm64.deb
```

### 预编译包安装
```bash
sudo dpkg -i ./libmali-valhall-g610-g13p0-x11-gbm_1.9-1_arm64.deb
sudo dpkg -i ./librga2_2.2.0-1_arm64.deb
sudo dpkg -i ./xserver-xorg-core_1.20.11-1_arm64.deb
sudo dpkg -i ./xserver-xorg-legacy_1.20.11-1_arm64.deb
```
注意，安装了libmali之后，必须安装预编译的xserver，否则启动时会卡在内核logo，无法显示登录界面或者桌面。使用xrandr则显示 can't open display。
拆包xserver进行分析，发现其中的usr/lib/xorg/modules/drivers/modesetting_drv.so，相比Ubuntu官方编译的版本，多了rockchip RGA库的链接。验证方式如下：
```bash
strings usr/lib/xorg/modules/drivers/modesetting_drv.so | grep -i rga
# 会输出：
# Rga
# rga
# RGA
```
为了防止xserver被apt升级，需要锁定版本：

### apt版本锁定
```bash
sudo apt-mark hold libmali-valhall-g610-g13p0-x11-gbm librga2 xserver-xorg-core xserver-xorg-legacy
```

### 桌面加速配置
此时，驱动安装完成，但是桌面窗口体验上比cpu软解还卡，查看GPU占用率
```bash
watch cat /sys/devices/platform/fb000000.gpu/utilisation
```
然后反复拖动窗口。

在只使用cpu软解的情况下，该数值一直为0；经过上面的配置，该数值在拖动窗口时，可以到达10左右。

对比其他系统的配置文件，发现有一项重要的配置没有设置：
```bash
sudo tee /etc/profile.d/rk-gpu-env.sh > /dev/null << 'EOF'
#!/bin/bash
# Rockchip GPU & UI Hardware Acceleration Envs

# Force GNOME/Mutter to use OpenGL ES 2
export COGL_DRIVER=gles2

# GStreamer hardware acceleration
export GST_GL_API=gles2
export GST_GL_PLATFORM=egl

# Fix Chromium/QtWebEngine GPU blacklisting
export QTWEBENGINE_CHROMIUM_FLAGS="--no-sandbox --disable-es3-gl-context --ignore-gpu-blacklist --ignore-gpu-blocklist --enable-accelerated-video-decode"

# Ensure DISPLAY is set for background rendering tasks
export DISPLAY=${DISPLAY:-:0}
EOF

# 赋予执行权限
sudo chmod +x /etc/profile.d/rk-gpu-env.sh
```

GNOME 的窗口管理器 Mutter 底层依赖 Cogl 库来进行图层合成和渲染。在 x86 平台上，Cogl 默认使用完整的 Desktop OpenGL。但在 RK3588 这种 ARM 平台上，Mali GPU 原生支持的是 OpenGL ES (GLES)。
如果不显式指定 COGL_DRIVER=gles2，Mutter 初始化时可能会寻找完整的 OpenGL 支持，找不到或者版本不匹配时，就会退化为 CPU 软解（llvmpipe）或者使用极低效的兼容层。这就是为什么 GPU 只有 10% 的利用率（可能只参与了最基础的光标或 2D 搬运），并且伴随严重的撕裂感。

执行后重启，桌面撕裂感消失，GPU占用可以来到二十多。
