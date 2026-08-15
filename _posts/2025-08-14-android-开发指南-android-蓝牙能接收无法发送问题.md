---
title: "Android 蓝牙能接收无法发送问题"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-蓝牙能接收无法发送问题/
toc: true
---

## 问题描述
3588 Android 12，连接到手机蓝牙后，可以正常接收手机发送的文件，但是发送文件到手机时报错。
![alt text](/assets/images/android-开发指南/android-蓝牙能接收无法发送问题/baf254b98cffd7f88e340f7f26d44000_compress.jpg)

## 日志分析
```log
08-14 09:44:10.189  2482  3177 E BluetoothOppSendFileInfo: File based URI not in Environment.getExternalStorageDirectory() is not allowed.
08-14 09:44:13.381  2482  3183 E BtOppService: Can't open file for OUTBOUND info 4
```
Android 12 的存储访问框架 (Scoped Storage) 严格限制对非标准路径的访问，特别是外部存储卷（如 12F7-244B0）中的文件。错误代码 4表示 BluetoothOppService无法访问该文件（权限不足或路径无效）。

## 解决方式
将文件复制到系统其他目录进行传输。
