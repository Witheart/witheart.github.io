---
title: "Ubuntu根文件系统分区扩展指南"
date: 2024-12-18
last_modified_at: 2024-12-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu根文件系统分区扩展指南/
toc: true
---

- 在Ubuntu中，烧录好的 `rootfs` 文件系统可能未能占用整个分区的空间，导致设备的根分区提示空间不足。
- 解决方式：通过自动化脚本和服务配置，在启动时自动扩展根文件系统到分区的完整大小。

---

## 一、问题背景

从以下命令的输出可以发现问题：

### **1. 分区信息**
通过 `lsblk` 查看设备分区：

```bash
root@user:~# lsblk
NAME         MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
mmcblk0      179:0    0 116.5G  0 disk
├─mmcblk0p1  179:1    0     4M  0 part
├─mmcblk0p2  179:2    0     4M  0 part
├─mmcblk0p3  179:3    0     4M  0 part
├─mmcblk0p4  179:4    0    64M  0 part
├─mmcblk0p5  179:5    0   128M  0 part
├─mmcblk0p6  179:6    0    32M  0 part
└─mmcblk0p7  179:7    0 116.3G  0 part /
mmcblk0boot0 179:32   0     4M  1 disk
mmcblk0boot1 179:64   0     4M  1 disk
```

以上输出显示 `/dev/mmcblk0p7` 是根文件系统的分区（挂载点 `/`），其大小为 **116.3G**，但实际文件系统可能没有扩展到整个分区。

### **2. 文件系统容量**
通过 `df -h` 检查根文件系统容量：

```bash
root@user:~# df -h
文件系统        容量  已用  可用 已用% 挂载点
/dev/root       3.9G  3.8G     0  100% /
devtmpfs        3.9G  8.0K  3.9G    1% /dev
tmpfs           3.9G     0  3.9G    0% /dev/shm
tmpfs           793M  2.0M  791M    1% /run
tmpfs           5.0M  4.0K  5.0M    1% /run/lock
tmpfs           3.9G     0  3.9G    0% /sys/fs/cgroup
tmpfs           793M   28K  793M    1% /run/user/0
```

从输出可以看出，根文件系统的容量仅为 `3.9G`，已经占满（`100%`），这说明文件系统未扩展到整个分区。

---

## 二、解决方案

为解决上述问题，我们需要：
1. **确认目标分区**：通过 `lsblk` 找到根文件系统所在的分区（一般是分区中 `SIZE` 最大的，如 `/dev/mmcblk0p7`）。
2. **编写调整脚本**：使用 `resize2fs` 工具扩展文件系统到分区的完整大小。
3. **创建系统服务**：在系统启动时自动运行调整脚本。

---

### **1. 确认分区**

运行以下命令，找到根文件系统所在的分区（即 `MOUNTPOINT` 为 `/` 的分区）：

```bash
lsblk
```

在示例输出中，根文件系统所在的分区是 `/dev/mmcblk0p7`，其大小为 `116.3G`。

> **注意**：如果您的环境中分区不同，请使用正确的分区路径替换脚本中的 `/dev/mmcblk0p7`。

---

### **2. 编写调整脚本**

创建脚本 `/etc/init.d/resize2fs.sh`，内容如下：

```bash
#!/bin/bash -e

# 如果尚未调整文件系统大小，则进行调整
if [ ! -e "/usr/local/boot_flag" ]; then
  echo "正在调整 /dev/mmcblk0p7 大小..."
  
  # 确保文件系统是可写的
  if mount | grep -q "/dev/mmcblk0p7"; then
    mount -o remount,rw /dev/mmcblk0p7 || { echo "重新挂载文件系统失败。"; exit 1; }
  fi
  
  resize2fs /dev/mmcblk0p7 || { echo "调整文件系统大小失败。"; exit 1; }
  touch /usr/local/boot_flag || { echo "创建启动标记失败。"; exit 1; }
fi
```

#### **脚本说明**：
- **检测标记文件**：`/usr/local/boot_flag` 用于标记是否已执行过分区调整，避免重复操作。
- **重新挂载分区**：确保分区以可写模式挂载。
- **调整文件系统大小**：调用 `resize2fs` 工具扩展文件系统。
- **创建标记文件**：调整完成后创建标记文件，防止重复调整。

#### **添加脚本执行权限**：
运行以下命令为脚本添加执行权限：
```bash
chmod +x /etc/init.d/resize2fs.sh
```

---

### **3. 创建系统服务**

创建服务文件 `/lib/systemd/system/resize2fs.service`，内容如下：

```ini
[Unit]
Description=Resize root filesystem during boot
Before=lightdm.service
After=resize-helper.service

[Service]
Type=simple
ExecStart=/etc/init.d/resize2fs.sh

[Install]
WantedBy=multi-user.target
```

#### **服务说明**：
- **运行时机**：服务将在系统启动阶段运行，确保分区已挂载。
- **调用脚本**：服务通过 `ExecStart` 调用调整文件系统的脚本。

#### **启用服务**：
运行以下命令启用服务：
```bash
systemctl enable resize2fs.service
```

---

### **4. 重启设备并验证**

重启设备，让服务运行并调整文件系统大小：
```bash
reboot
```

重启后，运行以下命令检查根文件系统容量是否已扩展：
```bash
df -h
```

正常情况下，会看到根文件系统的容量接近分区大小（如 `116.3G`）,至此，设备的根文件系统将能够使用整个分区的空间。
