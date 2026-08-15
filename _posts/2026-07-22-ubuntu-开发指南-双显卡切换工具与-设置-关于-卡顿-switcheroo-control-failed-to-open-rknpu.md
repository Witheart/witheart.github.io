---
title: "双显卡切换工具与“设置-关于”卡顿 Switcheroo-Control（failed to open rknpu）"
date: 2026-07-22
last_modified_at: 2026-07-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/双显卡切换工具与-设置-关于-卡顿-switcheroo-control-failed-to-open-rknpu/
toc: true
---

## 问题描述

Ubuntu20.04 Gnome，打开设置->关于时，会有明显卡顿，使用`env G_MESSAGES_DEBUG=all gnome-control-center info-overview`进行排查，发现读显卡信息的时候不仅去读取了rockchip_dri.so，还试图读取rknpu_dri.so。报错如下

```bash
(gnome-control-center:1875): info-overview-cc-panel-DEBUG: 18:30:25.903: Getting renderer from helper for GPU 'Unknown Graphics Controller'
(gnome-control-center:1875): info-overview-cc-panel-DEBUG: 18:30:25.903: About to launch '/usr/libexec/gnome-control-center-print-renderer'
(gnome-control-center:1875): info-overview-cc-panel-DEBUG: 18:30:25.903: With environment:
(gnome-control-center:1875): info-overview-cc-panel-DEBUG: 18:30:25.903:   DRI_PRIME = platform-fdab0000_npu
(gnome-control-center:1875): GLib-DEBUG: 18:30:25.903: posix_spawn avoided (fd close requested)
libGL error: MESA-LOADER: failed to open rknpu: /usr/lib/dri/rknpu_dri.so: 无法打开共享对象文件: 没有那个文件或目录 (search paths /usr/lib/aarch64-linux-gnu/dri:\$${ORIGIN}/                                                                                             dri:/usr/lib/dri, suffix _dri)
libGL error: failed to load driver: rknpu
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
```

## 分析
switcheroo-control 是 Linux 下负责多显卡（比如笔记本的双显卡）切换和状态上报的后台服务。GNOME 启动时会去问它：“板子上有几个能画图的硬件？” 结果它把 VOP（显示子系统）和 NPU（神经网络处理器）全报了上去。GNOME 拿到列表后，就错误地带上 DRI_PRIME 环境变量去逐个遍历加载。

## 解决方式
卸载显卡切换服务
```bash
sudo apt purge switcheroo-control

# 或者如果你不想卸载，可以直接禁用并屏蔽
sudo systemctl stop switcheroo-control
sudo systemctl disable switcheroo-control
sudo systemctl mask switcheroo-control
```
