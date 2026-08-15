---
title: "Ubuntu根文件系统分区扩展指南 - 修订版"
date: 2025-03-25
last_modified_at: 2025-03-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu根文件系统分区扩展指南-修订版/
toc: true
---

概要：本指南提供了一个用于扩展Ubuntu根文件系统的分区脚本，并解决了之前版本中的两个主要问题：残留标志文件导致扩展不生效，以及脚本中分区硬编码的问题。通过动态获取根设备和分区，该脚本可以在不同机器上使用。


## 1. 问题描述  

### 1.1 问题一：残留标志文件  
由于工作流是：脚本配置->根文件系统导出->系统镜像打包，导致在根文件系统中会残留已经扩展了根文件系统的标志文件，导致根文件系统扩展不生效的问题。

### 1.2 问题二：分区硬编码  
扩展根文件系统的脚本中需要扩展的分区被硬编码在脚本中，脚本在不同机器上使用时需要进行脚本的修改。

---

## 2. 解决方式  

### 2.1 不进行首次扩展检测  
由于`resize2fs`命令对已经扩展的分区不会再执行操作，所以不进行首次扩展检测。

### 2.2 动态获取需要扩展的分区  
通过动态获取根设备，避免了分区硬编码的问题。

---

## 3. 完整脚本  

### 3.1 脚本位置  
脚本统一位置：  
`/usr/local/bin/resize-rootfs.sh`

### 3.2 脚本内容  
该脚本通过开机`autorun`运行。

> 脚本可使用$(findmnt -n -o SOURCE /)来寻找要扩展的分区，也可使用/dev/disk/by-partlabel/下的软链接
- **开机脚本1：只扩展根分区**
```sh
#!/bin/bash

# 作者：吴思含（Witheart）
# 更新时间：20260612
# github.com/Witheart

# 直接使用 udev 生成的 partlabel 软链接
ROOT_DEVICE="/dev/disk/by-partlabel/rootfs"

# 检查设备软链接是否存在
if [ ! -e "$ROOT_DEVICE" ]; then
    echo "[witheart] resize-rootfs: Error: Device $ROOT_DEVICE not found!" | sudo tee /dev/kmsg
    exit 1
fi

# 记录到 dmesg
echo "[witheart] resize-rootfs: Resizing $ROOT_DEVICE" | sudo tee /dev/kmsg

# 执行扩展
resize2fs "$ROOT_DEVICE" 2>&1 | while read line; do
    echo "[witheart] resize-rootfs: $line" | sudo tee /dev/kmsg
done

# 完成提示
echo "[witheart] resize-rootfs: Operation completed" | sudo tee /dev/kmsg
```

- **开机脚本2：扩展根分区、var、home**
```sh
#!/bin/bash

# 作者：吴思含（Witheart）
# 更新时间：20260506
# github.com/Witheart
# 功能：开机自动扩展根分区、home分区和var分区的文件系统

# 定义一个扩容函数
resize_partition() {
    local mount_point=$1
    
    # 动态获取挂载点对应的设备路径
    local device=$(findmnt -n -o SOURCE "$mount_point" 2>/dev/null)
    
    if [ -z "$device" ]; then
        echo "[witheart] resize-fs: Warning: Device for $mount_point not found or not mounted! Skipping." | sudo tee /dev/kmsg
        return 1
    fi
    
    echo "[witheart] resize-fs: Resizing $mount_point on $device" | sudo tee /dev/kmsg
    
    # 执行扩展
    resize2fs "$device" 2>&1 | while read line; do
        echo "[witheart] resize-fs: [$mount_point] $line" | sudo tee /dev/kmsg
    done
}

echo "[witheart] resize-fs: Starting filesystem resize operations..." | sudo tee /dev/kmsg

# 依次扩展根分区、home 分区和 var 分区
resize_partition "/"
resize_partition "/home"
resize_partition "/var"

# 完成提示
echo "[witheart] resize-fs: All resize operations completed" | sudo tee /dev/kmsg
```

- **给予执行权限**
```bash
chmod +x /usr/local/bin/resize-rootfs.sh
```


- **可以在终端执行的单行命令：**
```bash
sudo resize2fs /dev/disk/by-partlabel/rootfs
```

**记得给予执行权限！！！**

### 3.3 脚本输出示例  
这个脚本会在`dmesg`中打印`resize2fs`的相关信息，如下：
dmesg | grep -i "resize-rootfs"

```sh
[   25.314294] resize-rootfs: Resizing /dev/mmcblk2p7
[   25.519616] resize-rootfs: resize2fs 1.45.5 (07-Jan-2020)
[   25.717709] resize-rootfs: 文件系统已经为 30355424 个块（每块 1k）。无事可做！
[   25.942760] resize-rootfs:
[   26.129143] resize-rootfs: Operation completed
```
