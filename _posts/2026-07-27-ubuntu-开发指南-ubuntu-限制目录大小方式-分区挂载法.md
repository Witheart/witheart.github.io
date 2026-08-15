---
title: "Ubuntu 限制目录大小方式 —— 分区挂载法"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-限制目录大小方式-分区挂载法/
toc: true
---

## 目标

限制用户目录下指定目录的大小，使用划分独立分区，挂载到该目录的方式进行限制。

## 修改分区表

- `device/rockchip/rk356x/parameter-buildroot-fit.txt`
- 8GB 大小的rootfs

```diff
diff --git a/device/rockchip/rk356x/parameter-buildroot-fit.txt b/device/rockchip/rk356x/parameter-buildroot-fit.txt
index 25fdc0248..ed3a5240e 100644
--- a/device/rockchip/rk356x/parameter-buildroot-fit.txt
+++ b/device/rockchip/rk356x/parameter-buildroot-fit.txt
@@ -8,5 +8,5 @@ MACHINE: 0xffffffff
 CHECK_MASK: 0x80
 PWR_HLD: 0,0,A,0,1
 TYPE: GPT
-CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00020000@0x0002a000(recovery),0x00010000@0x0004a000(baseparameter),0x00020000@0x0005a000(resource),-@0x0007a000(rootfs:grow)
+CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00020000@0x0002a000(recovery),0x00010000@0x0004a000(baseparameter),0x00020000@0x0005a000(resource),0x01000000@0x0007a000(rootfs),-@0x0107a000(userdata:grow)
 uuid:rootfs=614e0000-0000-4b53-8000-1d28000054a9

```

## 修改开机脚本
- /etc/rc.local中添加
```bash
# 挂载userdata分区
PART_DEV="/dev/disk/by-partlabel/userdata"
MOUNT_DIR="/home/KangHua/HTY1600"

# 等待 udev 识别分区标签（最多等 5 秒）
for i in {1..5}; do
    if [ -b "$PART_DEV" ]; then
        break
    fi
    sleep 1
done

if [ -b "$PART_DEV" ]; then
    # 检查分区是否已经被格式化过 (如果没有 ext4 特征，则执行 mkfs)
    if ! blkid "$PART_DEV" | grep -q "ext4"; then
        echo "[witheart] Formatting $PART_DEV to ext4 for the first time..."
	mkfs.ext4 -L "userdata" -F "$PART_DEV"
    fi

    # 确保挂载目录存在
    mkdir -p "$MOUNT_DIR"

    # 挂载分区
    mount "$PART_DEV" "$MOUNT_DIR"

    # 修复目录权限，确保 KangHua 用户有读写权限
    chown -R KangHua:KangHua "$MOUNT_DIR"
fi
```

## 修改打包脚本

- 只打包根文件系统所在的分区，适用于rootfs中目录有其他分区挂载的情况。使用-x选项防止穿越分区

```diff
diff --git a/hw_export_rootfs b/hw_export_rootfs
index 985f94a..840cf89 100644
--- a/hw_export_rootfs
+++ b/hw_export_rootfs
@@ -276,7 +276,7 @@ fi
 if [[ $STORE_FS_TYPE == "btrfs" ]]; then
     ROOTFS_SIZE=`btrfs filesystem usage -m $ROOTFS_MOUNTPOINT | grep "Device allocated" | awk '{print $3}'`
 else
-    ROOTFS_SIZE=`du -s -k $ROOTFS_MOUNTPOINT | awk '{print $1}'`
+    ROOTFS_SIZE=`du -s -k -x $ROOTFS_MOUNTPOINT | awk '{print $1}'`
 fi

 IMAGE_SIZE=$((ROOTFS_SIZE>>10))
@@ -313,7 +313,7 @@ if [[ $STORE_FS_TYPE == "btrfs" ]]; then
     umount $TEMP_MOUNT_POINT
     mount -t btrfs -o noatime,compress=lzo,subvol=root $IMAGE_FILE $TEMP_MOUNT_POINT
 else
-    INODE_COUNT=$(find "${ROOTFS_MOUNTPOINT}" 2>/dev/null | wc -l)
+    INODE_COUNT=$(find "${ROOTFS_MOUNTPOINT}" -xdev 2>/dev/null | wc -l)
     INODE_COUNT=$((INODE_COUNT+512))
     BLOCK_COUNT=$(((ROOTFS_SIZE+INODE_COUNT/4)*15/10))
```
