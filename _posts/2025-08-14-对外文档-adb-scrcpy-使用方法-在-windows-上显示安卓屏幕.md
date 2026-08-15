---
title: "ADB scrcpy 使用方法——在 Windows 上显示安卓屏幕"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/adb-scrcpy-使用方法-在-windows-上显示安卓屏幕/
toc: true
---

概要：本文介绍了在 Windows 系统上使用免费开源工具 scrcpy，通过 ADB（有线或无线）连接 Android 设备，实现无需安装 App 即可在 PC 端投屏安卓屏幕的具体方法。


## 1. scrcpy 工具概述

scrcpy 是一款功能强大、免费开源的 Android 屏幕镜像工具，由 Genymobile 公司开发。与其它需要安装应用的投屏工具不同，scrcpy 无需在手机上安装任何额外应用，只需通过 USB 调试或无线 ADB 即可实现高质量的屏幕镜像。

---

## 2. 使用步骤

PC 通过 ADB 连接到 Android 设备，有线或无线方式均可。

- 无线连接可参考以下教程：
  - 《ADB 无线调试方法——安卓原生》
  - 《ADB 无线调试及固定端口号方法——补丁版》

### 2.1 连接设备

1. 打开终端，输入以下命令查看已连接设备：

   ```bash
   adb devices
   ```

2. 确保终端只显示一个设备。

   - 如果有多个设备连接，可使用以下命令断开多余设备：

     ```bash
     adb disconnect [<host>[:<port>]]
     ```

   - ​​<host>[:<port>]​​（可选）：指定要断开的目标设备的 IP 地址和端口号（默认端口为 5555）。如果省略此参数，将断开所有已连接的远程设备。

### 2.2 启动 scrcpy

3. 双击打开 `scrcpy.exe` 文件。
   - 如果操作正常，应该能在电脑上看到安卓设备的桌面画面。
