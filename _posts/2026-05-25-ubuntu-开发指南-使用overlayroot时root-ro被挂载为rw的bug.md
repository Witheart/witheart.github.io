---
title: "使用overlayroot时root-ro被挂载为rw的bug"
date: 2026-05-25
last_modified_at: 2026-05-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/使用overlayroot时root-ro被挂载为rw的bug/
toc: true
---

## 问题描述
```dts
bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTLABEL=rootfs rootfstype=ext4 rw rootwait overlayroot=tmpfs net.ifnames=0";
```

- 使用上面的挂载选项，开机后挂载情况是这样的
```bash
mount

/dev/mmcblk0p7 on /media/root-ro type ext4 (rw,relatime)
/dev/mmcblk0p8 on /media/root-rw type ext4 (rw,relatime)
overlayroot on / type overlay (rw,relatime,lowerdir=/media/root-ro,upperdir=/media/root-rw/overlay,workdir=/media/root-rw/overlay-workdir/_)
```
可以看到，/media/root-ro也被挂载为rw了

- 如果修改bootargs的rw为ro
```bash
bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTLABEL=rootfs rootfstype=ext4 ro rootwait overlayroot=tmpfs net.ifnames=0";
```
会导致开机挂载后，overlayroot被挂载为ro的，导致系统无法正常使用
```bash
/dev/mmcblk0p7 on /media/root-ro type ext4 (ro,relatime)
/dev/mmcblk0p8 on /media/root-rw type ext4 (rw,relatime)
overlayroot on / type overlay (ro,relatime,lowerdir=/media/root-ro,upperdir=/media/root-rw/overlay,workdir=/media/root-rw/overlay-workdir/_)
```

## 相关问题报告
https://github.com/systemd/systemd/issues/39558
https://unix.stackexchange.com/questions/800673/overlayroot-behaving-differently-on-debian-13

上面讨论的 Bug 是因为新的 Linux 发行版（如 Ubuntu 23.10+ 或 Debian 13）更新了 util-linux（版本 ≥ 2.39），引入了全新的内核挂载 API（fsconfig/fsopen）与 OverlayFS 不兼容导致的。而 LIBMOUNT_FORCE_MOUNT2=always 是开发者为了退回老版本 API 专门加的“后门”。
但是，Ubuntu 20.04 的 util-linux 版本是 2.34。 它本来用的就是老版本的 mount(2) API，所有上面的解法无效。

## 解决方式
- /etc/rc.local中，增加
```bash
#overlayfs
mount -t ext4 -o remount,ro /dev/disk/by-partlabel/rootfs /media/root-ro
```
暂时没找到其他更好的解决方式
