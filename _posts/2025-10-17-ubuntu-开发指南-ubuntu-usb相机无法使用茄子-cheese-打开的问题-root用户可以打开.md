---
title: "Ubuntu USB相机无法使用茄子（cheese）打开的问题（root用户可以打开）"
date: 2025-10-17
last_modified_at: 2025-10-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-usb相机无法使用茄子-cheese-打开的问题-root用户可以打开/
toc: true
---

概要：本文记录了在 Ubuntu 20.04 系统中，使用 USB 相机时普通用户无法通过 cheese（茄子）软件打开相机的问题。通过分析设备权限与日志，找出问题根源并提供了解决方法及异常情况的应对方案。


## 1. 问题背景  

- 设备平台：rk3588  
- 操作系统：Ubuntu 20.04  
- 相机类型：USB 相机  
- 使用软件：cheese（茄子）  

### 1.1 问题描述  

- 使用 root 用户登录桌面环境，打开 cheese，画面显示正常。  
- 使用普通用户登录桌面环境，打开 cheese，提示“无法打开网络摄像机”。

---

## 2. 解决方式  

- 将普通用户加入 `video` 用户组后，问题得到解决。

---

## 3. 解决过程  

### 3.1 查看相机设备所属组  

```bash
ls /dev/video*
```

- 输出结果显示，相机设备归属于 `video` 用户组。

### 3.2 查看当前用户所属组  

```bash
groups 用户名
```

- 发现普通用户未包含在 `video` 组中，因此没有权限访问相机设备。

### 3.3 添加用户到 video 组  

使用以下命令将普通用户加入 `video` 组：

```bash
sudo usermod -aG video 用户名
```

- 重启或重新登录用户后，再次打开 cheese，问题即解决。

---

## 4. 其他问题  

### 4.1 apt upgrade 后出现的问题  

在执行 `apt upgrade` 后，即使普通用户已经在 `video` 组中，仍然出现无法打开相机的问题。

### 4.2 日志分析  

使用以下命令查看系统日志：

```bash
journalctl -f
```

日志内容如下：

```
Could not initialize supporting library.: gstvideoencoder.c(1643): gst_video_encoder_change_state (): /GstCameraBin:camerabin/GstEncodeBin:image-encodebin/GstMppJpegEnc:mppjpegenc0: Failed to start encoder
```

### 4.3 临时解决方法  

- 回退更新后问题解决。  
- 具体原因未明，可能与 gstreamer 编解码器相关的库或硬件加速有关。
