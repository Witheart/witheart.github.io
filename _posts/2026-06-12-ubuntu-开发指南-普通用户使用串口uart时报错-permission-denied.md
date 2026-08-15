---
title: "普通用户使用串口uart时报错 Permission denied"
date: 2026-06-12
last_modified_at: 2026-06-12
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/普通用户使用串口uart时报错-permission-denied/
toc: true
---

## 问题描述
```bash
$ python3 ./T3568_uart_test.py
Error testing UART on /dev/ttyS0: [Errno 13] could not open port /dev/ttyS0: [Errno 13] Permission denied: '/dev/ttyS0'
Error testing UART on /dev/ttyS1: [Errno 13] could not open port /dev/ttyS1: [Errno 13] Permission denied: '/dev/ttyS1'
Error testing UART on /dev/ttyS2: [Errno 13] could not open port /dev/ttyS2: [Errno 13] Permission denied: '/dev/ttyS2'
Error testing UART on /dev/ttyS3: [Errno 13] could not open port /dev/ttyS3: [Errno 13] Permission denied: '/dev/ttyS3'
Error testing UART on /dev/ttyS4: [Errno 13] could not open port /dev/ttyS4: [Errno 13] Permission denied: '/dev/ttyS4'
Error testing UART on /dev/ttyS5: [Errno 13] could not open port /dev/ttyS5: [Errno 13] Permission denied: '/dev/ttyS5'

```

- 查看权限

```bash
$ ls -al /dev/ttyS*
crw-rw---- 1 root dialout 4, 64 6月  12 13:54 /dev/ttyS0
crw-rw---- 1 root dialout 4, 65 6月  12 13:54 /dev/ttyS1
crw-rw---- 1 root dialout 4, 66 6月  12 13:54 /dev/ttyS2
crw-rw---- 1 root dialout 4, 67 6月  12 13:54 /dev/ttyS3
crw-rw---- 1 root dialout 4, 68 6月  12 13:54 /dev/ttyS4
crw-rw---- 1 root dialout 4, 69 6月  12 13:54 /dev/ttyS5
crw-rw---- 1 root dialout 4, 70 6月  12 14:23 /dev/ttyS6

```
串口设备的拥有者是 root，所属组是 dialout。普通用户（user）没有读写权限，因此会被系统直接拒绝。

## 解决方法

这样做的好处是，你以后运行串口代码再也不需要加 `sudo` 了。

**第 1 步：** 执行以下命令，将当前用户（`user`）添加到 `dialout` 组：

```bash
sudo usermod -aG dialout $USER

```

**第 2 步：** 刷新组权限。**（这一步非常重要，否则改动不会立刻生效）**
你可以直接关闭当前终端窗口重新打开，或者在当前终端执行以下命令使其立即生效：

```bash
newgrp dialout

```

**第 3 步：** 重新使用串口

这次应该就不会再报权限错误。
