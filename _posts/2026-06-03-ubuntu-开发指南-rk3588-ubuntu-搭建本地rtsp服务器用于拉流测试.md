---
title: "RK3588 Ubuntu 搭建本地RTSP服务器用于拉流测试"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-ubuntu-搭建本地rtsp服务器用于拉流测试/
toc: true
---

## 第一步：下载并启动 RTSP 服务器 (终端 1)

MediaMTX 是用 Go 语言写的，不需要安装任何依赖环境，下载下来就是一个可执行文件，开箱即用。

1. 在终端中执行以下命令，下载适用于 ARM64 架构的版本并解压：

```bash
wget https://github.com/bluenviron/mediamtx/releases/download/v1.6.0/mediamtx_v1.6.0_linux_arm64v8.tar.gz
tar -zxvf mediamtx_v1.6.0_linux_arm64v8.tar.gz

```

2. 运行服务器：

```bash
./mediamtx

```

_运行后，你会看到日志提示服务器已启动，监听在 `8554` 端口。请让这个终端一直保持运行状态，不要关闭。_

---

## 第二步：将本地视频推流到服务器 (终端 2)

现在我们有了一个空载的 RTSP 服务器，我们需要向它“喂”视频流。

准备一个时长稍长的 `test.mp4` ，将其中的 H.264 视频流抽出来，原封不动地推给服务器**。

打开一个**新的终端窗口**，进入你存放 `test.mp4` 的目录，运行以下 GStreamer 推流命令：

```bash
gst-launch-1.0 -v filesrc location=test.mp4 ! qtdemux ! h264parse ! rtspclientsink location=rtsp://127.0.0.1:8554/mystream

```

- **原理解释**：`qtdemux` 负责把 MP4 容器解开，`h264parse` 整理裸流，`rtspclientsink` 负责将流推送到我们刚建好的本地服务器上的 `/mystream` 频道。


成功运行后，这个终端会持续向外发送数据。

---

## 第三步：模拟客户拉流测试 (终端 3)

现在，你的板子上已经真实存在了一个 RTSP 视频流，地址是：`rtsp://127.0.0.1:8554/mystream`。

打开**第三个终端窗口**，注入显示环境变量，并使用结合了瑞芯微硬件解码器 (`mppvideodec`) 的终极测试命令去拉流：

```bash
# 1. 注入 EGL/GLES 环境变量 (修复 X11 OpenGL 问题)
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2

# 2. 运行拉流 Pipeline
gst-launch-1.0 rtspsrc location="rtsp://127.0.0.1:8554/mystream" protocols=4 latency=300 ! rtph264depay ! h264parse ! mppvideodec arm-afbc=false ! queue max-size-buffers=5 ! glupload ! glcolorconvert ! glimagesink sync=false qos=false max-lateness=-1

```

如果画面成功在屏幕上弹出并流畅播放，就成功了。
