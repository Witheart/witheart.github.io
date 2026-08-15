---
title: "Ubuntu firefly resize2fs 根文件系统扩展分析及禁用"
date: 2026-03-23
last_modified_at: 2026-03-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-firefly-resize2fs-根文件系统扩展分析及禁用/
toc: true
---

firefly根文件系统中，自带这两个服务进行根文件系统的扩展，功能上是冲突的。
- expandable_disk.service
- resize-helper.service

从日志中可以看到服务启动的蛛丝马迹：
```bash
journalctl -b | grep -E "EXT4|expand|resize2fs|resize"

3月 23 11:49:56 user kernel: EXT4-fs (mmcblk2p8): mounted filesystem with ordered data mode. Opts: (null)
3月 23 11:49:57 user resize-helper[313]: /usr/sbin/resize-helper: 30: [[: not found
3月 23 11:49:58 user systemd[1]: expandable_disk.service: Main process exited, code=exited, status=1/FAILURE
3月 23 11:49:58 user systemd[1]: expandable_disk.service: Failed with result 'exit-code'.
3月 23 11:49:58 user resize-helper[407]: resize2fs 1.45.5 (07-Jan-2020)
3月 23 11:49:58 user kernel: EXT4-fs (mmcblk2p8): resizing filesystem from 4327628 to 60829664 blocks
3月 23 11:49:59 user rc.local[579]: resize-rootfs: Resizing /dev/mmcblk2p8
3月 23 11:49:59 user resize-rootfs: Resizing /dev/mmcblk2p8
3月 23 11:50:00 user kernel: EXT4-fs (mmcblk2p8): resizing filesystem from 38010881 to 60829664 blocks
3月 23 11:50:00 user kernel: EXT4-fs (mmcblk2p8): Converting file system to meta_bg
3月 23 11:50:00 user kernel: EXT4-fs (mmcblk2p8): resizing filesystem from 38010881 to 60829664 blocks
3月 23 11:50:01 user kernel: EXT4-fs (mmcblk2p8): resized filesystem to 60829664
3月 23 11:50:02 user resize-helper[407]: Filesystem at /dev/mmcblk2p8 is mounted on /; on-line resizing required
3月 23 11:50:02 user resize-helper[407]: old_desc_blocks = 34, new_desc_blocks = 465
3月 23 11:50:02 user resize-helper[407]: The filesystem on /dev/mmcblk2p8 is now 60829664 (1k) blocks long.
3月 23 11:50:02 user systemctl[605]: Removed /etc/systemd/system/local-fs.target.wants/resize-helper.service.
3月 23 11:50:02 user systemd[1]: resize-helper.service: Succeeded.
3月 23 11:50:04 user rc.local[673]: resize-rootfs: resize2fs 1.45.5 (07-Jan-2020)
3月 23 11:50:04 user resize-rootfs: resize2fs 1.45.5 (07-Jan-2020)
3月 23 11:50:04 user rc.local[683]: resize-rootfs: resize2fs: Device or resource busy While checking for on-line resizing support
3月 23 11:50:04 user resize-rootfs: resize2fs: Device or resource busy While checking for on-line resizing support
3月 23 11:50:04 user rc.local[693]: resize-rootfs: Filesystem at /dev/mmcblk2p8 is mounted on /; on-line resizing required
3月 23 11:50:04 user resize-rootfs: Filesystem at /dev/mmcblk2p8 is mounted on /; on-line resizing required
3月 23 11:50:04 user rc.local[704]: resize-rootfs: old_desc_blocks = 34, new_desc_blocks = 465
3月 23 11:50:04 user resize-rootfs: old_desc_blocks = 34, new_desc_blocks = 465
3月 23 11:50:04 user rc.local[719]: resize-rootfs: Operation completed
3月 23 11:50:04 user resize-rootfs: Operation completed
```
其中，rc.local中的根文件系统扩展，是我自定义加入的。

## expandable_disk.service 分析
其中，expandable_disk.service 扩展的是userdate这个分区

内容如下：
```bash
# /lib/systemd/system/expandable_disk.service
[Unit]
Description=dblspace
After=systemd-remount-fs.service
[Service]
Type=exec
ExecStart=/usr/local/bin/expandable_disk.sh
[Install]
WantedBy=local-fs.target
```

```bash
# cat /usr/local/bin/expandable_disk.sh
#!/bin/bash

userdata_blk=$(blkid -o device -t PARTLABEL=userdata)
test $userdata_blk && resize2fs $userdata_blk
```

可以看到，脚本寻找一个叫userdata的分区，在找到时，使用 resize2fs 进行扩展。

## resize-helper.service 分析
内容如下：
可以看到，该脚本在运行一次后，就会自行disable掉，而firefly的打包脚本打包前，会在脚本中执行enable。
```bash
# systemctl cat resize-helper.service
# /lib/systemd/system/resize-helper.service
[Unit]
Description=Resize root filesystem to fit available disk space
After=systemd-remount-fs.service

[Service]
Type=oneshot
ExecStart=-/usr/sbin/resize-helper
ExecStartPost=/bin/systemctl disable resize-helper.service

[Install]
WantedBy=local-fs.target
```


```bash
# cat /usr/sbin/resize-helper
#!/bin/sh
# Copyright (c) Fathi Boudra <fathi.boudra@linaro.org>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
# 1. Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in the
#    documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
# OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
# LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
# OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
# SUCH DAMAGE.

# we must be root
[ $(whoami) = "root" ] || { echo "E: You must be root" && exit 1; }

ROOTFS_DEVICE=$(findmnt -n -o SOURCE --target /)
if [[ "${ROOTFS_DEVICE}" == "overlayroot" ]]; then
        exit 0
fi

# we must have few tools
SGDISK=$(which sgdisk) || { echo "E: You must have sgdisk" && exit 1; }
PARTED=$(which parted) || { echo "E: You must have parted" && exit 1; }
PARTPROBE=$(which partprobe) || { echo "E: You must have partprobe" && exit 1; }
RESIZE2FS=$(which resize2fs) || { echo "E: You must have resize2fs" && exit 1; }
E2FSCK=$(which e2fsck) || { echo "E: You must have e2fsck" && exit 1; }

# find root device
#ROOT_DEVICE=$(findmnt --noheadings --output=SOURCE / | cut -d'[' -f1)
# prune root device (for example UUID)
#ROOT_DEVICE=$(realpath ${ROOT_DEVICE})

MAJOR_ROOTFS=$(mountpoint -d / | cut -f 1 -d ":")
MINOR_ROOTFS=$(mountpoint -d / | cut -f 2 -d ":")

DEV_ROOTFS=$(cat /proc/partitions | awk {'if ($1 == "'${MAJOR_ROOTFS}'" && $2 == "'${MINOR_ROOTFS}'") print $4 '})
ROOT_DEVICE=/dev/${DEV_ROOTFS}

DEV_BLK=$(cat /proc/partitions | awk {'if ($1 == "'${MAJOR_ROOTFS}'" && $2 == "0") print $4 '})
BOOT_DEVICE=$(fdisk  -l /dev/${DEV_BLK} | grep EFI | cut -f 1 -d " ")

:<<!
mount ${BOOT_DEVICE} /boot > /dev/null

if [ $? -eq '0' ]; then
        echo "${BOOT_DEVICE} /boot    vfat   defaults  0   2" >> /etc/fstab
fi
!

PART_MEMERY_TYPE=$(udevadm info --query=property --name=${ROOT_DEVICE} | grep '^ID_PATH=' | cut -d'.' -f2)

if [ "$PART_MEMERY_TYPE" = "sdhci" ]; then
    ${RESIZE2FS} "${ROOT_DEVICE}"
else

# get the partition number and type
PART_ENTRY_NUMBER=$(udevadm info --query=property --name=${ROOT_DEVICE} | grep '^ID_PART_ENTRY_NUMBER=' | cut -d'=' -f2)
PART_TABLE_TYPE=$(udevadm info --query=property --name=${ROOT_DEVICE} | grep '^ID_PART_TABLE_TYPE=' | cut -d'=' -f2)
# find the block device
DEVICE=$(udevadm info --query=path --name=${ROOT_DEVICE} | awk -F'/' '{print $(NF-1)}')
DEVICE="/dev/${DEVICE}"

if [ "$PART_TABLE_TYPE" = "gpt" ]; then
        ${SGDISK} -e ${DEVICE}
        #${PARTPROBE}
fi

${PARTED} ${DEVICE} resizepart ${PART_ENTRY_NUMBER} 100%
#${PARTPROBE}
${E2FSCK} -f "${ROOT_DEVICE}"
${RESIZE2FS} "${ROOT_DEVICE}"
fi
```

## 关于禁用
1. 删除firefly根文件系统打包脚本中的enable resize-helper.service
2. mask
```bash
systemctl mask expandable_disk.service
systemctl mask resize-helper.service
```
