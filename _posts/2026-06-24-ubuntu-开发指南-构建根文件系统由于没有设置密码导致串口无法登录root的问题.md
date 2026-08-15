---
title: "构建根文件系统由于没有设置密码导致串口无法登录root的问题"
date: 2026-06-24
last_modified_at: 2026-06-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/构建根文件系统由于没有设置密码导致串口无法登录root的问题/
toc: true
---

出现这个问题的原因是 `ubuntu-base` 默认没有为 `root` 用户设置密码，且默认的安全策略不允许空密码通过串口（或者说未锁定的终端）登录。

最稳妥和标准的方法是**重新挂载根文件系统（rootfs）并进入 `chroot` 环境设置密码**。

## 1 在 x86 宿主机上准备配置环境

在当前的 x86 终端中，执行以下命令配置跨架构运行环境：

```bash
# 1. 安装 QEMU 仿真器及外围工具
sudo apt-get update
sudo apt-get install qemu-user-static binfmt-support -y

# 2. 将 QEMU 静态二进制文件复制到 ARM64 的 rootfs 中
sudo cp /usr/bin/qemu-aarch64-static ./ubuntu_rootfs/usr/bin/

```

## 2 挂载宿主机的虚拟文件系统

为了让 `chroot` 后的环境能够正常运行系统命令（如修改密码、管理服务），需要将宿主机的核心虚拟内核目录挂载到目标目录中：

```bash
sudo mount -t proc /proc ./ubuntu_rootfs/proc
sudo mount -t sysfs /sys ./ubuntu_rootfs/sys
sudo mount -o bind /dev ./ubuntu_rootfs/dev
sudo mount -o bind /dev/pts ./ubuntu_rootfs/dev/pts

```

## 3 进入 chroot 并解决登录问题

现在可以切换根目录进入 RK3568 的 Ubuntu 20.04 系统内部。

```bash
sudo chroot ./ubuntu_rootfs /bin/bash

```

*执行此命令后，终端提示符通常会改变，这意味着已经以 root 身份进入了目标 ARM64 系统。*

直接运行以下命令修改密码：

```bash
passwd root

```

按照提示输入两次新密码（例如输入 `root` 或 `123456`）。


修改完成后，输入 `exit` 退出 chroot 环境：

```bash
exit

```

## 4 卸载文件系统并清理

回到 x86 宿主机环境后，必须干净地卸载刚刚挂载的目录，否则后续打包镜像时会报错或丢失文件：

```bash
sudo umount ./ubuntu_rootfs/dev/pts
sudo umount ./ubuntu_rootfs/dev
sudo umount ./ubuntu_rootfs/sys
sudo umount ./ubuntu_rootfs/proc

```

## 5 重新生成 img 固件

由于修改直接生效在 `ubuntu_rootfs` 文件夹中，现在需要将这个文件夹重新制作成 Ext4 格式的镜像（覆盖或生成新的 `ubuntu20_20260617.img`）。

通常可以使用以下标准命令（具体大小需要根据你的 rootfs 实际占用体积调整，这里以 4GB 为例）：

```bash
# 1. 创建一个 4GB 的空镜像文件（或者根据具体分区规划调整大小）
dd if=/dev/zero of=ubuntu20_20260617_fixed.img bs=1M count=4096

# 2. 格式化为 ext4 文件系统
mkfs.ext4 -F -L linuxroot ubuntu20_20260617_fixed.img

# 3. 挂载空镜像并把修改后的 rootfs 拷贝进去
mkdir -p ./tmp_mount
sudo mount ubuntu20_20260617_fixed.img ./tmp_mount
sudo cp -rfp ./ubuntu_rootfs/* ./tmp_mount/

# 4. 卸载镜像
sudo umount ./tmp_mount
rm -rf ./tmp_mount

```
