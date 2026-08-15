---
title: "什么是KVM over IP（BMC）"
date: 2026-07-19
last_modified_at: 2026-07-19
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/什么是kvm-over-ip-bmc/
toc: true
---

这里需要先澄清一个概念：OpenBMC 里的 KVM，**不是** Linux 内核里的那个虚拟机管理程序（Kernel-based Virtual Machine）。

这里的 KVM 指的是 **KVM over IP**（Keyboard, Video, Mouse over IP），也就是**远程控制台**功能。它的作用是把服务器的物理显示器画面通过网络传给你，并把你的鼠标键盘操作传回物理服务器，让你感觉就像亲自坐在机房的显示器前一样，连 BIOS 画面都能看到。

它的核心原理是：**硬件级别的信号拦截与欺骗。**

![alt text](/assets/images/bmc/什么是kvm-over-ip-bmc/image.png)

## 1. Video (视频)：如何把画面传出来？

BMC 芯片（目前最主流的是信骅 ASPEED 的 AST2500/AST2600 系列）内部其实集成了一个**基础的 2D 显卡（VGA 控制器）**。

- **对主机（Host）而言：** 主板在硬件电路上，直接把主 CPU 的 PCIe 总线连接到 BMC 的这块内置显卡上。主机的操作系统（甚至 BIOS）会认为这就是一张插在主板上的物理显卡，并把所有的视频画面（Framebuffer）写入这块显卡的显存中。
- **对 BMC 而言：** BMC 内部有一个专用的硬件视频压缩引擎。它会不断地从自己的显存里抓取主机写进来的画面，进行硬件压缩（比如使用 ASPEED 的专有算法或者转成 JPEG/H.264 格式）。
- **在 OpenBMC 软件层：** OpenBMC 里通常有一个叫 `obmc-ikvm`（或者结合 V4L2 驱动）的后台服务进程。它负责读取压缩好的视频流，并通过 WebSocket 或 VNC 协议，通过带外网络发送到你电脑浏览器的 Web UI（例如使用 noVNC 前端组件）上。

## 2. Keyboard & Mouse (键鼠)：如何把操作传回去？

既然视频是“拦截”，键鼠操作就是“欺骗”。

- **硬件连接：** BMC 芯片除了连在主机的 PCIe 总线上，还通过 USB 总线连接在主机上。
- **虚拟化设备：** BMC 内部的 Linux 操作系统会运行一个 USB Gadget 驱动。它向主机**伪装成一个标准的 USB 复合设备（也就是物理键盘和鼠标）**。
- **数据传递：** 当你在网页 KVM 界面上移动鼠标或敲击键盘时，浏览器将这些动作的坐标和键码通过网络发送给 OpenBMC 的后台服务。
- **主机响应：** 后台服务拿到指令后，通过 USB Gadget 驱动将其转化为标准的 USB 硬件中断信号发送给主机。主机操作系统就会认为：“哦，刚才有人在主板背后的 USB 口上按下了回车键。”
