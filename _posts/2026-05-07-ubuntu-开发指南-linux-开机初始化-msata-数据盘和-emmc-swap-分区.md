---
title: "Linux 开机初始化 mSATA 数据盘和 EMMC Swap 分区"
date: 2026-05-07
last_modified_at: 2026-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-开机初始化-msata-数据盘和-emmc-swap-分区/
toc: true
---

## 创建文件
```bash
vim /usr/local/bin/format_swap_msata.sh
```

## 填入如下内容
```bash
#!/bin/bash
# 作者：吴思含（Witheart）
# 更新时间：20260506
# 功能：首次开机初始化 mSATA 数据盘和 EMMC Swap 分区

LOG_TAG="[witheart]"

log() {
    echo "$LOG_TAG $1" | sudo tee /dev/kmsg
}

log "Starting first-boot initialization..."

# ==========================================
# 1. 格式化 Swap 分区
# ==========================================
# 建议使用 by-partlabel 来寻找 swap，这样即使 mmcblk 编号变化也能找到
SWAP_DEV="/dev/disk/by-partlabel/swap"

# 备用回退路径：如果 by-partlabel 找不到，则使用提供的绝对路径
if [ ! -b "$SWAP_DEV" ]; then
    SWAP_DEV="/dev/mmcblk2p10"
fi

if [ -b "$SWAP_DEV" ]; then
    # 检查是否已经被格式化为 swap
    if blkid "$SWAP_DEV" | grep -q 'TYPE="swap"'; then
        log "Swap partition $SWAP_DEV is already formatted. Skipping."
    else
        log "Formatting Swap partition on $SWAP_DEV..."
        mkswap "$SWAP_DEV"
        if [ $? -eq 0 ]; then
            log "Swap formatting successful. Activating swap..."
            swapon "$SWAP_DEV"
        else
            log "Error: Failed to format Swap on $SWAP_DEV."
        fi
    fi
else
    log "Error: Swap partition device ($SWAP_DEV) not found!"
fi

# ==========================================
# 2. 分区并格式化 mSATA (/dev/sda)
# ==========================================
MSATA_DISK="/dev/sda"
MSATA_PART="${MSATA_DISK}1"

if [ -b "$MSATA_DISK" ]; then
    # 检查是否已经存在 label 为 data 的分区
    if blkid | grep -q 'LABEL="data"'; then
        log "mSATA partition with label 'data' already exists. Skipping format."
    else
        log "No 'data' partition found. Initializing mSATA on $MSATA_DISK..."
        
        # 使用 parted 创建全新的 GPT 分区表和一个占满全盘的 ext4 主分区
        log "Creating GPT partition table and primary partition on $MSATA_DISK..."
        parted -s "$MSATA_DISK" mklabel gpt
        parted -s "$MSATA_DISK" mkpart primary ext4 0% 100%
        
        # 等待系统识别新分区
        sleep 2
        partprobe "$MSATA_DISK"
        sleep 2
        
        if [ -b "$MSATA_PART" ]; then
            log "Formatting $MSATA_PART to ext4 with label 'data'..."
            mkfs.ext4 -F -L data "$MSATA_PART"
            
            if [ $? -eq 0 ]; then
                log "mSATA formatting successful. Attempting to mount..."
                # 如果 /etc/fstab 已经配置好，可以用 mount -a 或者直接挂载
                mkdir -p /data
                mount "$MSATA_PART" /data
                log "mSATA mounted to /data successfully."
            else
                log "Error: Failed to format $MSATA_PART."
            fi
        else
            log "Error: Partition $MSATA_PART was not created successfully."
        fi
    fi
else
    log "Warning: mSATA disk ($MSATA_DISK) not found. Skipping initialization."
fi

log "First-boot initialization completed."

```

## 给予执行权限
```bash
chmod +x /usr/local/bin/format_swap_msata.sh
```

## 放到开机脚本中（首次启动执行）
```bash
    # 初始化 mSATA 数据盘和 EMMC Swap 分区
    echo "[witheart] 开始初始化 mSATA 数据盘和 EMMC Swap 分区..."
    /usr/local/bin/format_swap_msata.sh
    echo "[witheart] 初始化 mSATA 数据盘和 EMMC Swap 分区结束"
```
