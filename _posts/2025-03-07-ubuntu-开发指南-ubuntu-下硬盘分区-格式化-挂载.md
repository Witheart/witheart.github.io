---
title: "Ubuntu 下硬盘分区、格式化、挂载"
date: 2025-03-07
last_modified_at: 2025-03-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下硬盘分区-格式化-挂载/
toc: true
---

概要：本教程介绍了在 Ubuntu 系统下如何查看硬盘信息、进行分区、格式化、挂载以及设置开机自动挂载，适用于新安装的硬盘或重新配置的存储设备。  


## **1. 查看未挂载的硬盘**  
使用 `lsblk` 命令查看当前的磁盘设备及其挂载情况：  

```bash
lsblk
```

示例输出：  

```
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0     7:0    0     4K  1 loop /snap/bare/5
loop1     7:1    0  63.7M  1 loop /snap/core20/2434
loop2     7:2    0  63.7M  1 loop /snap/core20/2496
sda       8:0    0 119.2G  0 disk
├─sda1    8:1    0   512M  0 part /boot/efi
└─sda2    8:2    0 118.7G  0 part /
sdb       8:16   0   1.8T  0 disk
└─sdb1    8:17   0   1.8T  0 part /mnt/hdd
nvme0n1  259:0   0   1.8T  0 disk
```

可以看到 `nvme0n1` 设备没有挂载点，说明它是一个未使用的硬盘。  

---

## **2. 确认新硬盘**  
如果 `nvme0n1` 还没有分区，可以使用 `fdisk` 或 `parted` 进行分区。  

---

## **3. 分区（如果硬盘未分区）**  

### **使用 `fdisk` 进行分区**  
```bash
sudo fdisk /dev/nvme0n1
```

在 `fdisk` 交互界面中：  
1. 输入 `n`（新建分区）  
2. 选择 `p`（主分区）  
3. 按 **回车**（使用默认分区编号）  
4. 按 **回车**（使用默认起始扇区）  
5. 按 **回车**（使用默认结束扇区，分配整个磁盘）  
6. 输入 `w`（写入更改并退出）  

---

## **4. 格式化分区**  
假设刚创建的分区是 `nvme0n1p1`，可以使用 **ext4** 文件系统格式化：  

```bash
sudo mkfs.ext4 /dev/nvme0n1p1
```

如果你要使用 **XFS** 文件系统：  

```bash
sudo mkfs.xfs /dev/nvme0n1p1
```

---

## **5. 创建挂载点**  
选择一个目录作为挂载点，例如 `/mnt/nvme`：  

```bash
sudo mkdir -p /mnt/nvme
```

---

## **6. 挂载硬盘**  
```bash
sudo mount /dev/nvme0n1p1 /mnt/nvme
```

验证是否挂载成功：  

```bash
df -h | grep nvme
```

---

## **7. 开机自动挂载（可选）**  

为了确保重启后硬盘仍然保持挂载状态，需要编辑 `/etc/fstab`：  

### **7.1 获取分区的 UUID**  
```bash
blkid /dev/nvme0n1p1
```

示例输出：  
```
/dev/nvme0n1p1: UUID="12345678-aaaa-bbbb-cccc-1234567890ab" TYPE="ext4"
```

如果 `blkid` 没有输出，可以使用 `lsblk -f` 查看：  

```bash
lsblk -f
```

示例输出：  
```
NAME        FSTYPE   FSVER LABEL UUID                                 MOUNTPOINTS
nvme0n1
└─nvme0n1p1 ext4     1.0         5f0dd418-e916-4740-b8d8-c53b9d955253 /mnt/nvme
```

这里 `UUID` 为 `5f0dd418-e916-4740-b8d8-c53b9d955253`。  

### **7.2 编辑 `/etc/fstab`**  
```bash
sudo nano /etc/fstab
```

在文件末尾添加以下内容（请替换 `UUID=xxxx` 为你的实际 UUID）：  

```
UUID=12345678-aaaa-bbbb-cccc-1234567890ab /mnt/nvme ext4 defaults 0 2
```

**注意**：如果你使用的是 XFS 文件系统，请将 `ext4` 改为 `xfs`。  

### **7.3 测试 `/etc/fstab` 配置**  
```bash
sudo mount -a
```

如果没有错误消息，则说明配置正确。  

---

## **8. 总结**  
1. **确认硬盘**：`lsblk`  
2. **创建分区**：`fdisk /dev/nvme0n1`  
3. **格式化分区**：`mkfs.ext4 /dev/nvme0n1p1`  
4. **创建挂载点**：`mkdir -p /mnt/nvme`  
5. **手动挂载**：`mount /dev/nvme0n1p1 /mnt/nvme`  
6. **开机自动挂载**：编辑 `/etc/fstab`  

这样，你的硬盘就可以在 Ubuntu 系统中正常使用，并且在重启后仍然保持挂载状态。
