---
title: "RK3588 升级 GStreamer 1.20 报错硬件解码器丢失 (no element mppvideodec)"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-升级-gstreamer-1-20-报错硬件解码器丢失-no-element-mppvideodec/
toc: true
---

## 1 问题背景与环境

- **硬件平台**：Rockchip RK3588 (ARM64 架构)
- **显示环境**：X11 视窗系统
- **核心操作**：客户通过官方源码（freedesktop）手动编译升级 GStreamer 至 1.20 版本。


## 2 现象描述

修复 OpenGL 显示后，接入真实 RTSP 流测试，出现新报错：

```bash
root@user:/home/user/# gst-launch-1.0 rtspsrc location="rtsp://10.168.1.188:20554/rtp/34020000001310000014_34020000001310000014?originTypeStr=rtp_push&videoCodec=H264" protocols=4 latency=0 buffer-mode=none ! rtph264depay ! h264parse ! mppvideodec width=480 height=480 arm-afbc=false ! queue max-size-buffers=1 ! glupload ! glcolorconvert ! glvideomixer name=sink_0 ! video/x-raw,format=RGBA ! glimagesink sync=false qos=false max-lateness=-1

WARNING: erroneous pipeline: no element "mppvideodec"
```

## 3 根因分析

`mppvideodec` 是 Rockchip 基于芯片内部 MPP（Media Process Platform）硬件解码模块开发的**私有定制插件**，并未合并入 Freedesktop 官方主线。
客户强行用纯净版 GStreamer 1.20 源码覆盖升级系统，导致出厂固件自带的硬件加速插件层缺失。


## 4 解决方案

需重新编译瑞芯微专属的 GStreamer 插件仓库 (`gstreamer-rockchip` / `gst-rkmpp`)，并将其绑定到新版 GStreamer 1.20 环境中。

**编译步骤：**

1. 获取适配版本的 `gstreamer-rockchip` 源码（需包含 `meson.build`），该源码可在SDK中找到（external/gstreamer-rockchip），打包发到RK3588开发板上。
2. 确认系统 `pkg-config` 已指向新编译的 1.20 版本：

```bash
pkg-config --modversion gstreamer-1.0  # 应输出 1.20.0

```

3. 使用 Meson 进行编译安装：

```bash
meson build
sudo ninja -C build install
sudo ldconfig

```

输出中应该会有类似于
```bash
Run-time dependency gstreamer-1.0 found: YES 1.20.0
```
注意其和你的gst版本是否一致。

4. 验证插件是否就绪：

```bash
gst-inspect-1.0 mppvideodec


Factory Details:
  Rank                     primary + 1 (257)
  Long-name                Rockchip's MPP video decoder
  Klass                    Decoder/Video
  Description              Multicodec (HEVC / AVC / VP8 / VP9) hardware decoder
  Author                   Randy Li <randy.li@rock-chips.com>, Jeffy Chen <jeffy.chen@rock-chips.com>

Plugin Details:
  Name                     rockchipmpp
  Description              Rockchip Mpp Video Plugin
  Filename                 /usr/local/lib/aarch64-linux-gnu/gstreamer-1.0/libgstrockchipmpp.so
  Version                  1.14.4
  License                  LGPL
  Source module            gst-rockchip
  Binary package           GStreamer Rockchip Plug-ins
  Origin URL               Unknown package origin

GObject
 +----GInitiallyUnowned
       +----GstObject
             +----GstElement
                   +----GstVideoDecoder
                         +----GstMppDec
                               +----GstMppVideoDec

Pad Templates:
  SINK template: 'sink'
    Availability: Always
    Capabilities:
      video/x-h264
          stream-format: { (string)avc, (string)avc3, (string)byte-stream }
              alignment: { (string)au }
                 parsed: true
      video/x-h265
          stream-format: { (string)hvc1, (string)hev1, (string)byte-stream }
              alignment: { (string)au }
                 parsed: true
      video/mpeg
            mpegversion: { (int)1, (int)2, (int)4 }
                 parsed: true
           systemstream: false
      video/x-vp8
      video/x-vp9

  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)NV12, (string)NV16, (string)NV12_10LE40, (string)NV12, (string)NV21, (string)I420, (string)YV12, (string)NV16, (s                                       tring)NV61, (string)BGR16, (string)RGB, (string)BGR, (string)RGBA, (string)BGRA, (string)RGBx, (string)BGRx }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-raw
                 format: { (string)NV12, (string)NV16, (string)NV12_10LE40 }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
               arm-afbc: 1

Element has no clocking capabilities.
```
