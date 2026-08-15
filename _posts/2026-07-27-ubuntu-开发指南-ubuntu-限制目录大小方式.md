---
title: "Ubuntu 限制目录大小方式"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-限制目录大小方式/
toc: true
---

本文提供几种思路，未实际验证。

## 1 使用虚拟镜像文件

这种方法的原理是创建一个固定大小的文件，将其格式化为文件系统，然后像挂载物理硬盘一样挂载到你的目标目录。问题是，直接用 dd if=/dev/zero 创建了一个 500MB 的物理文件，那么打包出来的固件确实会凭空多出 500MB 的体积。

1. **创建指定大小的镜像文件:** 例如创建一个 500MB 的文件.
   假设我们要把镜像存放在 `/root/dir_limit.img`，目标限制目录是 `/data/my_dir`。

```bash
sudo dd if=/dev/zero of=/root/dir_limit.img bs=1M count=500

```

2. **格式化镜像文件为 ext4 格式:**

```bash
sudo mkfs.ext4 /root/dir_limit.img

```

_(如果提示不是块设备，按 `y` 确认即可)_

3. **将镜像挂载到目标目录:**
   确保目标目录已经存在（`mkdir -p /data/my_dir`）。

```bash
sudo mount -o loop /root/dir_limit.img /data/my_dir

```

此时，`/data/my_dir` 的最大容量已被物理限制为 500MB。

4. **配置开机自动挂载:** 防止重启后失效.
   编辑 `/etc/fstab` 文件，将挂载信息写入：

```bash
echo "/root/dir_limit.img /data/my_dir ext4 loop 0 0" | sudo tee -a /etc/fstab

```

---

## 2 使用 tmpfs（适合高频写入的临时数据）

如果你限制该目录只是为了存放临时文件、缓存或运行时日志，使用 `tmpfs` 可以直接把数据写在 RAM（内存）中。**优点是速度极快且不消耗 eMMC 寿命，缺点是断电或重启后数据会清空。**

**临时挂载（测试用，限制为 100MB）：**

```bash
sudo mount -t tmpfs -o size=100m tmpfs /data/my_dir

```

**永久生效（写入开机挂载）：**
编辑 `/etc/fstab`，添加以下内容：

```text
tmpfs   /data/my_dir   tmpfs   size=100m   0   0

```

运行 `sudo mount -a` 即可立即生效。

---

## 3 关于 Quota 配额

> Linux 原生支持 ext4/xfs 的 **Project Quota** 功能来实现目录级别的限制。但 RK3568 的定制化 Ubuntu 内核（如 Firefly, Radxa 提供的 BSP 固件）有时会默认裁剪掉 Quota 模块以精简内核。如果你熟悉内核编译且上述两套方案无法满足需求，可以考虑开启内核 Quota 支持。

## 4 首次开机时动态创建（最推荐，固件零增量）

在打包 rootfs 时不包含这个镜像文件，而是写一个开机自启脚本。**设备第一次启动时，自动生成该文件并挂载。**这样打包出的镜像不会多出预留的大小。

你可以使用 `systemd` 或 `/etc/rc.local` 来实现。以 `/etc/rc.local` 为例：

```bash
#!/bin/bash

IMG_FILE="/root/dir_limit.img"
MOUNT_DIR="/data/my_dir"

# 1. 检查镜像文件是否存在，不存在则创建（只在第一次开机时执行）
if [ ! -f "$IMG_FILE" ]; then
    # 创建 500MB 镜像并格式化
    dd if=/dev/zero of="$IMG_FILE" bs=1M count=500
    mkfs.ext4 -F "$IMG_FILE"
fi

# 2. 确保挂载目录存在
mkdir -p "$MOUNT_DIR"

# 3. 挂载
mount -o loop "$IMG_FILE" "$MOUNT_DIR"

exit 0

```

_优势：打包的固件里只有这几行脚本代码，体积完全不增加。_

---

## 5 使用稀疏文件（Sparse File）

如果你必须在打包前就创建好这个文件，可以使用**稀疏文件**。稀疏文件会向系统“虚报”大小，但只占用实际写入数据的磁盘空间。

不要用 `dd`，改用 `truncate` 命令创建：

```bash
# 创建一个名义上 500MB，但实际占用为 0 的稀疏文件
truncate -s 500M /root/dir_limit.img

# 格式化（ext4 会写入一些元数据，实际占用会变成几 MB）
mkfs.ext4 /root/dir_limit.img

```

_优势：做好的镜像文件在初始状态下只占几 MB。_

> **⚠️ 风险提示：** 取决于你打包 rootfs 使用的工具（比如 `tar`、`make_ext4fs` 等）。如果打包工具不支持稀疏文件，打包时它可能会自动填充 `0`，将其重新膨胀回 500MB。如果你用 `tar` 打包，记得加上 `-S` (`--sparse`) 参数。

---

## 6 修改 Rockchip 分区表

如果你对 RK3568 的固件编译比较熟悉，限制目录大小最原生的方式是**不使用文件挂载，而是直接划分一个物理分区。**

1. 修改 RK3568 固件目录下的 `parameter.txt`（如果你用的是传统分区）或 GPT 分区配置文件。
2. 在分区表中切出一块固定大小（例如 500MB）的分区，命名为 `limit_data`。
3. 在系统的 `/etc/fstab` 中，将这个新分区直接挂载到 `/data/my_dir`。

_优势：完全物理隔离，对 rootfs 体积零影响，且文件系统性能最佳。_
_劣势：需要重新编译并完整烧录（烧录 parameter 表），门槛较高。_

参考：《05.2 Ubuntu 开发指南\Ubuntu 限制目录大小方式 —— 分区挂载法\Ubuntu 限制目录大小方式 —— 分区挂载法.md》
