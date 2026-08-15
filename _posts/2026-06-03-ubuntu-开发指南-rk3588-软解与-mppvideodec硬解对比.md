---
title: "RK3588 软解与 mppvideodec硬解对比"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-软解与-mppvideodec硬解对比/
toc: true
---

## 1 环境搭建

先参考《RK3588 Ubuntu 搭建本地RTSP服务器用于拉流测试》进行RTSP服务器搭建。

## 2 软硬解对比

### 2.1 解码并渲染视频

- 软解

```bash
# 确保环境变量生效
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2

# 使用 avdec_h264 强制 CPU 软解
gst-launch-1.0 rtspsrc location="rtsp://127.0.0.1:8554/mystream" protocols=4 latency=300 ! rtph264depay ! h264parse ! avdec_h264 ! queue max-size-buffers=5 ! glupload ! glcolorconvert ! glimagesink sync=false qos=false max-lateness=-1
```

![alt text](/assets/images/ubuntu-开发指南/rk3588-软解与-mppvideodec硬解对比/PixPin_2026-06-03_11-14-29.png)

- 硬解

```bash
# 确保环境变量生效
export DISPLAY=:0
export GST_GL_WINDOW=x11
export GST_GL_PLATFORM=egl
export GST_GL_API=gles2

gst-launch-1.0 rtspsrc location="rtsp://127.0.0.1:8554/mystream" protocols=4 latency=300 ! rtph264depay ! h264parse ! mppvideodec arm-afbc=false ! queue max-size-buffers=5 ! glupload ! glcolorconvert ! glimagesink sync=false qos=false max-lateness=-1

```

![alt text](/assets/images/ubuntu-开发指南/rk3588-软解与-mppvideodec硬解对比/PixPin_2026-06-03_11-15-08.png)

上面的软硬解对比，从CPU占用来说，肉眼看不出明显的差异，看起来大概只有20%的差异，原因可能是性能瓶颈根本不在“解码”上，而是在“内存拷贝和渲染（glimagesink）”上。在 X11 环境下，glupload 极大概率没有实现真正的“零拷贝”（Zero-copy），导致无论是软解还是硬解，CPU 都必须满载工作，把每一帧画面从内存搬运到显存里。

可以尝试用下面的方式排除渲染的变量：

### 2.2 测试纯解码的消耗

既然渲染层（`glimagesink`）占用了大量的 CPU 干扰了我们的判断，我们就**把渲染层直接砍掉**，只测试纯解码的消耗。

GStreamer 提供了一个叫 `fakesink`（黑洞）的插件，它接收到画面后直接丢弃，不进行任何显示。

请在拉流终端（终端 3）分别运行以下两条命令，并观察 `htop`：

**1. 纯软解 + 丢弃画面**

```bash
gst-launch-1.0 rtspsrc location="rtsp://127.0.0.1:8554/mystream" protocols=4 latency=300 ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false

```

![alt text](/assets/images/ubuntu-开发指南/rk3588-软解与-mppvideodec硬解对比/PixPin_2026-06-03_11-16-17.png)

**2. 纯硬解 + 丢弃画面**

```bash
gst-launch-1.0 rtspsrc location="rtsp://127.0.0.1:8554/mystream" protocols=4 latency=300 ! rtph264depay ! h264parse ! mppvideodec arm-afbc=false ! fakesink sync=false

```

![alt text](/assets/images/ubuntu-开发指南/rk3588-软解与-mppvideodec硬解对比/PixPin_2026-06-03_11-17-02.png)

**结论**：CPU 占用率有明显区别，就彻底证明了硬件解码是 100% 生效的！

---

### 3 查看内核硬件中断（证明硬解起作用）

RK3588 的硬件视频解码器（VPU/RKVDEC）每次解码完一帧画面，都会向 CPU 发送一个硬件中断信号。只要视频在硬解播放，相关的中断计数就会疯狂上涨。

1. 先把刚才那个能出画面的**硬解测试命令**跑起来。
2. 另开一个终端，运行这行命令实时查看内核中断：

```bash
watch -n 1 "cat /proc/interrupts | grep -iE 'vdec|mpp|vdpu'"

```

- **预期结果**：你会看到包含 `rkvdec` 或 `vdpu` 字样的那一行，后面的数字（中断次数）在每秒钟以几十次的速度稳定增加。如果你把 GStreamer 停掉，数字就会立刻停止跳动。这就是硬件在工作的表现。
