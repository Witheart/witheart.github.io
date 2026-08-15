---
title: "Ubuntu 下常用文件与磁盘管理命令"
date: 2025-01-21
last_modified_at: 2025-01-21
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下常用文件与磁盘管理命令/
toc: true
---

## 1. **查看当前目录下文件占用大小：`du -sh *` **

`du`（Disk Usage）命令用于显示目录和文件的磁盘使用情况。选项 `-s` 表示仅显示每个文件或目录的总计，而不列出子目录；`-h` 则以适合人类阅读的格式（如 KB、MB、GB）显示结果。

---

## 2. **显示文件系统整体使用情况：`df -h` **

`df`（Disk Free）命令用于显示文件系统的磁盘使用情况。选项 `-h` 以人类可读的格式输出磁盘容量、已用空间、剩余空间和使用率。

---

## 3. **显示块大小和挂载点：`lsblk` 、显示块的文件系统格式：`lsblk -f` **

`lsblk`（List Block Devices）命令用于列出系统中的所有块设备（硬盘、分区、挂载点等），并以树状结构展示它们之间的层次关系。搭配 `-f` 参数，可以查看分区的文件系统类型（如 ext4、vfat 等）及 UUID 信息。


### 输出分析（`lsblk -f`）
当添加 `-f` 参数时，可以进一步查看分区的文件系统格式：
```
arm@arm-Default-string:~$ lsblk -f
NAME   FSTYPE      FSVER LABEL    UUID                                 MOUNTPOINTS
loop0  squashfs    4.0                                                    /snap/bare/5
loop1  squashfs    4.0                                                    /snap/core20/2379
...
sda                                                                        
├─sda1 vfat        FAT32          1234-ABCD                            /boot/efi
└─sda2 ext4        1.0            5678-DCBA                            /
sdb                                                                        
└─sdb1 ext4        1.0   Storage  abcd-1234                            /mnt/hdd
```

这里可以看到：
1. **文件系统类型**：
   - `/dev/sda1` 使用 `vfat` 文件系统，这是典型的 EFI 系统分区格式。
   - `/dev/sda2` 和 `/dev/sdb1` 使用 `ext4` 文件系统，这是 Linux 系统常用的文件系统。

2. **分区标识**：
   - 每个分区都有唯一的 UUID（如 `1234-ABCD` 和 `abcd-1234`），这是文件系统的唯一标识符，常用于挂载配置。

3. **标签（LABEL）**：
   - `/dev/sdb1` 分区被命名为 `Storage`，方便识别用途。

通过 `lsblk -f`，用户可以详细了解分区的文件系统格式和 UUID，方便管理和配置挂载点。
