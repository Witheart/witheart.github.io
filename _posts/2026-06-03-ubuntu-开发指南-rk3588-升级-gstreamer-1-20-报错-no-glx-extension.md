---
title: "RK3588 升级 GStreamer 1.20 报错 No GLX extension"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-升级-gstreamer-1-20-报错-no-glx-extension/
toc: true
---

## 1 问题背景与环境

- **硬件平台**：Rockchip RK3588 (ARM64 架构)
- **显示环境**：X11 视窗系统
- **核心操作**：客户通过官方源码（freedesktop）手动编译升级 GStreamer 至 1.20 版本。

---

## 2 现象描述

在使用 `videotestsrc` 纯测试 OpenGL 渲染链路时，管道崩溃，报错如下：

```text
gst-launch-1.0 rtspsrc location="rtsp://192.168.3.124:8554/rltest1" protocols=4 latency=0 buffer-mode=none ! rtph264depay ! h264parse ! mppvideodec width=480 height=480 arm-afbc=false ! queue max-size-buffers=1 ! glupload ! glcolorconvert ! glvideomixer name=sink_0 ! video/x-raw,format=RGBA ! glimagesink sync=true qos=false max-lateness=-1

ERROR: from element /GstPipeline:pipeline0/GstGLImageSinkBin:glimagesinkbin0/GstGLImageSink:sink: No GLX extension

```

## 3 根因分析

GStreamer 1.20 官方主线源码默认以桌面标准编译。在 X11 环境下，GStreamer 默认去寻找独立显卡使用的 **GLX** 扩展接口。然而，RK3588 搭载的是 Mali GPU，其在 X11 下原生支持的是针对嵌入式设备的 **EGL** 和 **OpenGL ES (GLES2)**。接口寻找错位导致直接崩溃。

## 4 解决方案

无需重新编译，在执行 GStreamer 管道前，通过注入环境变量强制扭转 GStreamer 的底层 API 调用逻辑，指定使用 EGL 和 GLES2：

```bash
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2

```

## 5 测试软解
```bash
# 下载一个标准的测试视频 (H.264 MP4)
wget https://www.w3schools.com/html/mov_bbb.mp4 -O test.mp4

# 用本地文件模拟拉流播放测试
# 1. 确保环境变量注入（纠正 X11 下的 OpenGL 行为）
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2

# 2. 播放本地文件，经过软解后，送给 OpenGL 链路
gst-launch-1.0 filesrc location=test.mp4 ! qtdemux ! decodebin ! queue max-size-buffers=1 ! glupload ! glcolorconvert ! glvideomixer name=sink_0 ! video/x-raw,format=RGBA ! glimagesink sync=false qos=false max-lateness=-1
```

软解测试成功，则说明问题解决了。

## 6 环境变量全局生效
```bash
sudo vim /etc/profile.d/gst_rockchip_env.sh

# 填入下面的内容
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2
```
重启设备或者重新登录终端即可全局生效。
