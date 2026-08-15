---
title: "overlayroot userdata分区，首次启动没有格式化导致无法挂载的问题"
date: 2026-05-25
last_modified_at: 2026-05-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-userdata分区-首次启动没有格式化导致无法挂载的问题/
toc: true
---

## 问题描述

虽然dts中bootargs中传参时要求格式化userdata分区，但是可能是由于initramfs中缺少mkfs.ext4工具，导致格式化没有生效。overlayfs不起作用。

## 解决方式

`/etc/rc.local`

- 版本1：在没有userdata分区的系统上会导致无限重启
```bash
#overlayfs
USERDATA_DEV="/dev/disk/by-partlabel/userdata"

# 用 blkid 检查该分区是否已经存在 ext4 文件系统
if ! blkid "$USERDATA_DEV" | grep -q 'TYPE="ext4"'; then
    # 没检测到 ext4，说明是刚烧录完的第一次开机
    echo "[witheart] First boot detected: Formatting userdata partition..." > /dev/kmsg

    # 强制无交互格式化，并打上 userdata 标签
    mkfs.ext4 -F -L userdata "$USERDATA_DEV"

    # 格式化完成后，当前的启动链已经错过了 overlayroot 的拼装时机
    # 必须立刻重启，让内核重新从头加载，挂载双层系统
    echo "[witheart] Format complete. Rebooting system to apply overlayfs..." > /dev/kmsg
    reboot

    # 退出脚本，防止执行后续逻辑
    exit 0
fi

# 挂载为ro
mount -t ext4 -o remount,ro /dev/disk/by-partlabel/rootfs /media/root-ro
```

- 版本2：放在开机脚本的最前面
```bash
#overlayfs
USERDATA_DEV="/dev/disk/by-partlabel/userdata"

# 定义一个标志，决定后续是否执行 overlayfs 的挂载逻辑
OVERLAY_ENABLED=0

# 1. 检查分区设备节点是否存在
if [ -b "$USERDATA_DEV" ]; then
    # 2. 设备存在时，检查是否已经格式化为 ext4
    if ! blkid "$USERDATA_DEV" | grep -q 'TYPE="ext4"'; then
        echo "[witheart] First boot detected: Formatting userdata partition..." > /dev/kmsg

        # 3. 尝试格式化
        if mkfs.ext4 -F -L userdata "$USERDATA_DEV"; then
            echo "[witheart] Format complete. Rebooting system to apply overlayfs..." > /dev/kmsg
            reboot
            exit 0
        else
            # 格式化失败：不能使用 overlay，维持标志为 0
            echo "[witheart] ERROR: Failed to format $USERDATA_DEV. Bypassing overlayroot..." > /dev/kmsg
        fi
    else
        # 设备存在且已经是 ext4，满足构建 overlay 的条件
        OVERLAY_ENABLED=1
    fi
else
    # 设备不存在：不能使用 overlay，维持标志为 0
    echo "[witheart] WARNING: Partition $USERDATA_DEV not found. Bypassing overlayroot..." > /dev/kmsg
fi

# OverlayRoot 核心挂载逻辑
if [ "$OVERLAY_ENABLED" -eq 1 ]; then
    echo "[witheart] Userdata ready. Preparing overlayfs environment..." > /dev/kmsg
    
    # 满足条件，将 rootfs 挂载为只读 (lowerdir)
    mount -t ext4 -o remount,ro /dev/disk/by-partlabel/rootfs /media/root-ro
else
    # 不满足 overlay 条件，直接跳过只读挂载，进入普通模式
    echo "[witheart] System will boot in standard RW mode (No overlayroot)." > /dev/kmsg
    # 此时 rootfs 会保持开机默认的状态（通常是可读写的）继续启动
fi
```
