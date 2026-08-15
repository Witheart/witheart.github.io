---
title: "adb 出现 emulator-5564  offline 设备导致无法正常调试"
date: 2026-05-06
last_modified_at: 2026-05-06
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/adb-出现-emulator-5564-offline-设备导致无法正常调试/
toc: true
---

## 问题描述
在使用ADB调试过程中，有时会遇到设备显示为offline状态，无法正常连接和调试：
```cmd
>adb devices
List of devices attached
emulator-5564   offline
```

但此时PC并没有连接到其他的adb设备

## 原理解析
**上述这种5564的端口设备，一般不是外部连接的adb设备产生的，原理如下：**
1. 某些服务监听了这个端口
2. ADB 有一个固定的扫描机制来识别本地运行的模拟器：
   1. 扫描范围： ADB 会扫描本地 5554 到 5584 之间的 偶数 TCP 端口。
   2. 配对逻辑： ADB 认为模拟器由两个连续端口组成：
      1. 偶数端口 (N)： 控制台端口（Console，用于发送命令）。
      2. 奇数端口 (N+1)： 接口端口（ADB 连接端口）。

**查看端口监听情况：**
```cmd
>netstat -ano | findstr :5565                                                                          
TCP    127.0.0.1:5565         0.0.0.0:0              LISTENING       5432                                               
TCP    127.0.0.1:5565         127.0.0.1:11965        ESTABLISHED     5432                                               
TCP    127.0.0.1:11965        127.0.0.1:5565         ESTABLISHED     12252                                              
```

- 第1行：本机的 5565端口正处于监听状态（等待连接），而且是只允许本机内部访问（127.0.0.1）。负责监听的程序 PID 是 5432。
- 第 2 & 3 行（TCP）：这两行是一对已建立（ESTABLISHED）的本地内部连接。PID 为 5432​ 的程序（正是上面那个监听的程序）正在和 PID 为 12252​ 的程序通过 5565和 11965这两个端口互相传输数据。这通常是两个本地软件之间的正常通信。

**查看这两个程序：**
```cmd
>tasklist /fi "PID eq 5432" /fo table /nh
GPIOHostService.exe           5432 Services                   0      4,116 K

>tasklist /fi "PID eq 12252" /fo table /nh
adb.exe                      12252 Console                    1     10,032 K
```

可以看到，PID 为 5432 的程序是 GPIOHostService.exe，监听了 5565；而 PID 为 12252 的程序是 adb.exe。
GPIOHostService.exe 通过端口5565向adb.exe发送或接受数据；而 adb.exe通过端口11965向GPIOHostService.exe发送或接受数据。（全双工）

**emulator-5564 建立流程解析：**
1. GPIOHostService.exe 监听了 5565 端口
2. ADB 会扫描本地 5554 到 5584 之间的 偶数 TCP 端口
3. 由于 5565 是奇数，ADB 自动推导出它的“控制台端口”是 5565 - 1 = 5564
4. 因此，ADB 报告发现了一个名为 emulator-5564 的设备

## 解决方式
### 方式1
```cmd
taskkill /F /PID 5432
taskkill /F /PID 12252
```

有些进程，被kill掉后还会自启，导致adb重启后又会产生emulator设备，这时候可以选择直接卸载该程序：
- 比如 GPIOHostService.exe 是由于安装了 `Intel(R) GPIO Configuration Tool 3.12.1` 产生的，直接卸载即可

### 方式2
修改 ADB 扫描的上限，或者使用防火墙拦截 ADB 的探测。
