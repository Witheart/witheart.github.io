---
title: "3568 Android USB相机（UVC摄像头）问题排查与日志捕捉"
date: 2026-04-08
last_modified_at: 2026-04-08
categories:
  - "Android 调试"
tags:
  - "Android 调试"
permalink: /android-调试/3568-android-usb相机-uvc摄像头-问题排查与日志捕捉/
toc: true
---

## 设备类型区分
此文章适用于UVC类型的USB摄像头，对于扫码枪等设备，将被识别为HID类型，不适用于本文。

## 命令
- lsusb
- ls -al /dev/video*
- v4l2-ctl --list-devices
