---
title: "Ubuntu 下使用命令行将 U 盘格式化为 ext4、FAT32 和 exFAT 的详细教程"
date: 2024-12-28
last_modified_at: 2024-12-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下使用命令行将-u-盘格式化为-ext4-fat32-和-exfat-的详细教程/
toc: true
---

本教程将详细介绍如何将 U 盘格式化为 **ext4**、**FAT32** 和 **exFAT** 文件系统，同时包括如何安装必要工具（如 `exfat-utils`）。

![alt text](/assets/images/ubuntu-开发指南/ubuntu-下使用命令行将-u-盘格式化为-ext4-fat32-和-exfat-的详细教程/image.png)

## 每种文件系统的适用场景：

- **ext4**：适用于 Linux 环境，支持文件权限和日志功能，但无法跨平台使用。
- **FAT32**：适用于跨平台（Windows、macOS 和 Linux），但不支持单个文件超过 4GB 的情况。
- **exFAT**：适用于跨平台（Windows、macOS 和 Linux），支持大文件，推荐用作 FAT32 的替代方案。

## **步骤 1: 插入 U 盘并识别设备**

1. **插入 U 盘**：将 U 盘插入电脑的 USB 接口。
2. **列出所有存储设备**：运行以下命令查看系统中已连接的存储设备：

   ```bash
   lsblk
   ```

   输出示例：

   ```plaintext
   NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
   sda      8:0    0   500G  0 disk
   ├─sda1   8:1    0    50G  0 part /
   ├─sda2   8:2    0   450G  0 part /home
   sdb      8:16   1    16G  0 disk
   └─sdb1   8:17   1    16G  0 part /media/username/USB
   ```

   在这里，`sdb` 是 U 盘的设备名称，其大小为 16GB。

3. **确认设备名称**：通过设备的大小和挂载点判断 U 盘的设备名称（如 `sdb`）。**注意：确保不要误操作其他磁盘。**

4. **查看分区文件系统类型**：运行以下命令查看分区的现有文件系统：

   ```bash
   lsblk -f
   ```

   输出示例：

   ```plaintext
   NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
   sdb    └─sdb1 vfat   USB   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX /media/username/USB
   ```

   在这里，`sdb1` 是 U 盘的分区，当前文件系统类型为 FAT32（`vfat`）。

---

## **步骤 2: 卸载 U 盘的分区**

如果 U 盘的分区已经挂载，需要先卸载它：

```bash
sudo umount /dev/sdb1
```

将 `sdb1` 替换为 U 盘的分区名称。

确认卸载成功：

```bash
lsblk
```

确保 `MOUNTPOINT` 列为空。

---

## **步骤 3: 删除现有分区表**

使用 `fdisk` 删除 U 盘上的现有分区：

1. 启动 `fdisk` 工具：

   ```bash
   sudo fdisk /dev/sdb
   ```

   注意：将 `sdb` 替换为你的 U 盘设备名称。

2. 进入交互式界面后，按以下步骤操作：

   - 输入 `p` 列出分区。
   - 输入 `d` 删除分区。如果有多个分区，重复输入 `d`，直到所有分区删除完毕。
   - 输入 `w` 保存更改并退出。

---

## **步骤 4: 创建新分区**

继续使用 `fdisk` 创建新分区：

1. 启动 `fdisk` 工具：

   ```bash
   sudo fdisk /dev/sdb
   ```

2. 按以下步骤操作：

   - 输入 `n` 创建新分区。
   - 按 `p` 选择创建主分区。
   - 输入分区编号（通常为 `1`）。
   - 按回车键接受默认起始扇区和结束扇区。
   - 输入 `w` 保存更改并退出。

---

## **步骤 5: 格式化分区**

在创建新分区后，可以将其格式化为所需的文件系统：**ext4**、**FAT32** 或 **exFAT**。

---

### **5.1 格式化为 ext4 文件系统**

运行以下命令，将分区格式化为 ext4 文件系统：

```bash
sudo mkfs.ext4 /dev/sdb1
```

- `mkfs.ext4` 用于格式化 ext4 文件系统。
- `/dev/sdb1` 是 U 盘的分区名称。

格式化完成后，系统会输出类似以下内容：

```plaintext
Creating filesystem with 3907584 4k blocks and 977280 inodes
Filesystem UUID: xxxx-xxxx
Superblock backups stored on blocks: ...
```

---

### **5.2 格式化为 FAT32 文件系统**

运行以下命令，将分区格式化为 FAT32 文件系统：

```bash
sudo mkfs.vfat -F 32 /dev/sdb1
```

- `mkfs.vfat` 用于格式化 FAT 文件系统。
- `-F 32` 指定使用 FAT32 格式。
- `/dev/sdb1` 是 U 盘的分区名称。

格式化完成后，系统会输出类似以下内容：

```plaintext
mkfs.fat 4.2 (2021-01-31)
```

---

### **5.3 格式化为 exFAT 文件系统**

#### **安装 exFAT 工具**

如果你的系统没有支持 exFAT 的工具，可以安装 `exfat-utils`：

```bash
sudo apt update
sudo apt install exfat-utils
```

#### **格式化为 exFAT**

安装完成后，运行以下命令将分区格式化为 exFAT 文件系统：

```bash
sudo mkfs.exfat /dev/sdb1
```

- `mkfs.exfat` 用于格式化为 exFAT 文件系统。
- `/dev/sdb1` 是 U 盘的分区名称。

格式化完成后，系统会输出类似以下内容：

```plaintext
mkexfatfs 1.3.0
Creating... done.
```

---

## **步骤 6: 验证格式化结果**

1. 再次运行以下命令查看分区信息：

   ```bash
   lsblk -f
   ```

   输出示例：

   ```plaintext
   NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
   sdb    └─sdb1 ext4         xxxx-xxxx                       
   ```

   或：

   ```plaintext
   NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
   sdb    └─sdb1 vfat         xxxx-xxxx
   ```

   或：

   ```plaintext
   NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
   sdb    └─sdb1 exfat        xxxx-xxxx
   ```

   确认分区的文件系统类型是否为 ext4、vfat（FAT32）或 exFAT。

2. 如果需要使用 U 盘，可以手动挂载：

   ```bash
   sudo mount /dev/sdb1 /mnt
   ```

   将 `/mnt` 替换为你希望的挂载点。
