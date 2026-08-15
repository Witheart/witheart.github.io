---
title: "overlayroot 如何使用 MobaXTerm 的 sftp 功能修改底层根文件系统或传输文件"
date: 2026-06-11
last_modified_at: 2026-06-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-如何使用-mobaxterm-的-sftp-功能修改底层根文件系统或传输文件/
toc: true
---

## 1 问题

sudo overlayroot-chroot 只在当前命令行生效，如果使用mobaxterm的sftp，则无法生效。这是因为MobaXterm 左侧（或独立弹出）的 SFTP 文件传输窗口，是一个**完全独立的进程**（通过 `sshd` 建立的另一个连接）。它根本不知道你的终端窗口里执行了 `chroot`。SFTP 依然连接在系统的全局默认视图（即合并后的 Overlay `/`）。所以你拖拽进去的文件，全部写到了表层的 `userdata`（`/media/root-rw/overlay/`）里。

## 2 解决方式

### 2. 第一步：在终端全局解锁底包

在普通的 SSH 终端（**不要**进 `overlayroot-chroot`），直接执行：

```bash
sudo mount -o remount,rw /media/root-ro

```

_(这会把底包物理分区在全局视野下解锁，允许写入。)_

### 2.1 第二步：在 SFTP 窗口导航到“真实底包”路径

在 MobaXterm 的左侧 SFTP 目录树中，**千万不要拖到 `/` 目录下**！
你必须一层一层点进去，导航到真实的底包挂载点：
**`/media/root-ro/`**

> **举个例子：**
> 如果你想把一个脚本替换到底包的 `/usr/local/bin/` 目录下。
> 你在 SFTP 里应该进入的路径是：**`/media/root-ro/usr/local/bin/`**

### 2.2 第三步：拖拽上传文件

现在，你可以把电脑上的文件直接拖进 MobaXterm 的这个目录里。此时，文件是实打实地写进了底层的根文件系统。

### 2.3 第四步：同步并重新锁死底包

文件传完后，回到 SSH 终端，执行以下命令确保数据落盘并恢复只读保护：

```bash
sync
sudo mount -o remount,ro /media/root-ro

```

如果一直busy，只能重启。
