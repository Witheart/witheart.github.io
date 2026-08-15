---
title: "根文件系统扩展 - 使用systemd代替rc.local在早期扩展，解决扩展过慢带来的首次启动自动登录失效的问题"
date: 2026-06-30
last_modified_at: 2026-06-30
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/根文件系统扩展-使用systemd代替rc-local在早期扩展-解决扩展过慢带来的首次启动自动登录失效的问题/
toc: true
---

## 问题描述

基于ubuntu-base构建的镜像，配置了rc.local中进行根文件系统扩展，且自动登录桌面。但是由于首次启动，扩展的时机较慢，导致自动登录时还未扩展完成，进而导致桌面回退到登录界面。

## 解决方式

### 新建扩容服务

```bash
vim /etc/systemd/system/resize-rootfs.service

[Unit]
Description=Resize Root Filesystem
DefaultDependencies=no
After=local-fs.target
Before=display-manager.service lightdm.service
ConditionPathExists=!/etc/.rootfs_resized

[Service]
Type=oneshot
ExecStart=/usr/local/bin/resize-rootfs.sh
ExecStartPost=/usr/bin/touch /etc/.rootfs_resized
RemainAfterExit=yes

[Install]
WantedBy=sysinit.target
```

使能服务

```bash
systemctl enable resize-rootfs.service
```

- **`Description=Resize Root Filesystem`**
- **含义：** 服务的简短描述。在运行 `systemctl status resize-rootfs.service` 或查看日志时，会显示这个名称。

- **`DefaultDependencies=no`**
- **含义：** 禁用默认依赖。systemd 通常会为服务自动添加一些基本依赖（例如 `sysinit.target`）。对于这种需要在系统非常早期的阶段运行的底层服务，禁用默认依赖可以防止产生循环依赖或启动死锁。

- **`After=local-fs.target`**
- **含义：** 启动顺序。指定该服务必须在本地文件系统（`local-fs.target`）挂载完成**之后**才能启动。因为你需要扩容根目录，前提是根目录已经被系统识别并挂载。

- **`Before=display-manager.service lightdm.service`**
- **含义：** 启动顺序。指定该服务必须在图形界面（如 `display-manager` 或 `lightdm`）启动**之前**执行完毕。这可以防止在扩容过程中用户进行图形界面的高I/O操作。

- **`ConditionPathExists=!/etc/.rootfs_resized`**
- **含义：** 运行条件。这是该服务“仅执行一次”的核心逻辑。注意路径前面的感叹号 `!`，表示“不存在”**。只有当 `/etc/.rootfs_resized` 这个文件**不存在时，该服务才会被触发执行。

- **`Type=oneshot`**
- **含义：** 服务类型为“一次性”。意味着这个服务主要执行一个动作（运行脚本），执行完就退出了，没有常驻进程。systemd 会等待这个脚本完全执行完毕，才会继续启动后续排队的服务。

- **`ExecStart=/usr/local/bin/resize-rootfs.sh`**
- **含义：** 核心启动命令。服务启动时实际执行的脚本路径。真正的扩容逻辑（比如调用 `fdisk`、`resize2fs` 等）都写在这个 bash 脚本里。

- **`ExecStartPost=/usr/bin/touch /etc/.rootfs_resized`**
- **含义：** 启动后执行的命令。当 `ExecStart` 成功执行完毕后，运行 `touch` 命令创建一个名为 `/etc/.rootfs_resized` 的空文件。这个文件正是 `[Unit]` 区块中 `ConditionPathExists=!` 所检查的标记文件。一旦创建，下次重启时服务就不会再运行了。

- **`RemainAfterExit=yes`**
- **含义：** 退出后保留状态。因为是 `oneshot` 服务，执行完脚本进程就结束了。设置为 `yes` 可以让 systemd 在进程退出后依然认为该服务处于 "active (exited)"（激活并退出）的状态，而不是 "inactive"（未激活/失败），这对于依赖它的其他服务或查看状态时非常有用。

定义了运行 `systemctl enable` 时的行为。

- **`WantedBy=sysinit.target`**
- **含义：** 当你执行 `systemctl enable resize-rootfs.service` 时，systemd 会在 `sysinit.target.wants/` 目录下创建一个指向此配置文件的软链接。这意味着该服务会被绑定到系统初始化流程（`sysinit.target`）中，在系统开机引导的早期阶段被自动拉起。

### 新建扩容脚本

```bash
vim /usr/local/bin/resize-rootfs.sh

#!/bin/bash

# 作者：吴思含（Witheart）
# 更新时间：20260808
# github.com/Witheart

# 检测是否为 overlayroot 环境，获取真实的根块设备
ROOT_FSTYPE=$(findmnt -n -o FSTYPE --target /)
if [ "$ROOT_FSTYPE" = "overlay" ] || [ "$ROOT_FSTYPE" = "overlayroot" ]; then
    ROOT_DEVICE=$(findmnt -n -o SOURCE --target /media/root-ro)
    echo "[witheart] resize-rootfs: Detected overlayroot, target device: $ROOT_DEVICE" | sudo tee /dev/kmsg
else
    ROOT_DEVICE=$(findmnt -n -o SOURCE --target /)
fi

if [ -z "$ROOT_DEVICE" ]; then
    echo "[witheart] resize-rootfs: Error: Cannot find source device for root!" | sudo tee /dev/kmsg
    exit 1
fi

echo "[witheart] resize-rootfs: Resizing $ROOT_DEVICE" | sudo tee /dev/kmsg

resize2fs "$ROOT_DEVICE" 2>&1 | while read line; do
    echo "[witheart] resize-rootfs: $line" | sudo tee /dev/kmsg
done

echo "[witheart] resize-rootfs: Operation completed" | sudo tee /dev/kmsg
```

给予执行权限

```bash
chmod +x /usr/local/bin/resize-rootfs.sh
```

- 注意：扩容位置如果使用/dev/disk/by-partlabel/rootfs软链接，会失败。原因是这个软链接并不是内核直接提供的，而是由用户空间的 systemd-udevd 守护进程在解析了块设备（mmcblk2p8）的分区表后，动态创建出来的。而我们把 resize-rootfs.service 的执行时机大幅提前了，在这个极其早期的启动阶段，udev 还没来得及生成 by-partlabel 目录下的软链接。

### 修改根文件系统打包脚本

- 加入删除/etc/.rootfs_resized的功能

```diff
diff --git a/hw_export_rootfs b/hw_export_rootfs
index 4088c1a..985f94a 100644
--- a/hw_export_rootfs
+++ b/hw_export_rootfs
@@ -25,9 +25,10 @@ function showhelp()

     版本说明：
       作者：Witheart
-      更新日期：2025-12-24
+      更新日期：2026-06-30

     版本历史：
+        1.0.9 - 增加了对 /etc/.rootfs_resized 文件的检测和清理，确保新镜像首次启动时能重新执行分区调整
         1.0.8 - 增加了对 systemd journal 日志的清理
         1.0.7 - 增加了对todesk注册文件的检测和删除，防止todesk识别码一致导致的顶号问题
         1.0.6 - 增加了对远程软件生成的/etc/fuse的检测，防止打包失败（只适用于本机打包）
@@ -117,6 +118,14 @@ function clead_target_rootfs()
         echo "ℹ️  未找到/etc/firstboot_done文件，跳过删除"
     fi

+    # 新增：检测并删除 /etc/.rootfs_resized 文件
+    if [[ -f "${ROOT_DIR}/etc/.rootfs_resized" ]]; then
+        echo "⚠️  检测到 rootfs 已调整大小标记文件，执行删除操作（确保新镜像首次启动时重新执行分区调整）"
+        rm -f "${ROOT_DIR}/etc/.rootfs_resized"
+    else
+        echo "ℹ️  未找到/etc/.rootfs_resized文件，跳过删除"
+    fi
+
     # 新增：检测并删除 ToDesk 注册文件
     if [[ -f "${ROOT_DIR}/etc/todesk/reg.conf" ]]; then
         echo "⚠️  检测到预装 todesk 注册文件，执行删除操作（重置识别码）"

```
