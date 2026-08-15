---
title: "目录下有多个分区挂载，如何只统计单个分区而不穿越 —— Linux du find sync`-x` 参数技术解析"
date: 2026-08-03
last_modified_at: 2026-08-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/目录下有多个分区挂载-如何只统计单个分区而不穿越-linux-du-find-sync-x-参数技术解析/
toc: true
---

## 1. 问题从哪来？

Linux 有一个独特的文件系统设计：多块物理磁盘、多个分区，全部挂在**同一棵目录树**下（VFS）。对用户来说，`/home` 和 `/usr` 看起来只是两个普通目录，但它们背后很可能完全是两块不同的硬盘、两个不同的文件系统。

```bash
$ lsblk
NAME         MOUNTPOINT
mmcblk2p8    /                ← rootfs 分区
mmcblk2p9    /home/KangHua    ← userdata 分区

$ df /
Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/mmcblk2p8   8301283 4371733   3545326  56% /
```

这就带来一个很实际的问题：当你对 `/` 执行 `du`、`find` 或 `rsync` 时，它们到底应该停在 `/home/KangHua` 的边界，还是一路穿越过去把所有子分区也算进来？

`-x` 参数的存在，就是为了回答这个问题。

---

## 2. 底层原理：st_dev 设备号

Linux 内核为每一个挂载的文件系统分配一个唯一标识，叫做**设备号（device ID）**。每次你调用 `stat()` 查看一个文件，返回的 `st_dev` 字段就是这个值。

```c
struct stat buf;
stat("/", &buf);
printf("dev = %lu\n", buf.st_dev);      // 输出: 2049 (major=8, minor=8)

stat("/home/KangHua", &buf);
printf("dev = %lu\n", buf.st_dev);      // 输出: 2057 (major=8, minor=9)
```

同一个文件系统内所有文件的 `st_dev` 完全相同；一旦跨过挂载点，`st_dev` 立刻变化。

`-x` 参数做的事极其简单：

> **遍历目录树时，每进入一个子目录，检查它的 `st_dev` 是否与起点一致。不一致就跳过。**

这就是"不跨越文件系统边界"的全部秘密。

---

## 3. 各工具的 `-x` 用法

不同的命令行工具对这个功能有不同的命名，但行为完全一致。

### 3.1 `du -x`

```bash
# ❌ 会进入所有子挂载点
du -sh /          # 可能输出 25G（包含 userdata 分区的 20G）

# ✅ 只在当前文件系统内统计
du -sh -x /       # 只输出 4.2G（仅 rootfs 分区）
```

使用场景：准确计算某个分区的实际磁盘占用，不受其他挂载点干扰。

### 3.2 `find -xdev`

```bash
# ❌ 查找所有 .conf 文件，会匹配到子挂载点里的
find / -name "*.conf"

# ✅ 只在 rootfs 分区内查找
find / -xdev -name "*.conf"
```

使用场景：你想搜索 `/etc/` 下的配置，但不希望搜到 `/home/` 下用户自己放的 `foo.conf`；或者你想统计 rootfs 分区的 inode 数量用于 `mkfs.ext4 -N`。

### 3.3 `rsync -x`

```bash
# ❌ 不加 -x，会把 userdata 分区内容也复制过来
rsync -a / /mnt/image/

# ✅ 加了 -x，userdata 分区被跳过
rsync -ax / /mnt/image/
```

使用场景：制作根文件系统镜像时，只想打包 `rootfs` 分区，不打包 `/home` 的用户数据分区。这就是打包脚本的核心保障。

### 3.4 `df -x`（注意：含义不同！）

`df` 也接受 `-x`，但逻辑正好相反——它是**按文件系统类型排除**：

```bash
df -x tmpfs -x devtmpfs    # 不显示 tmpfs 类型的挂载
df -t ext4                 # 只显示 ext4 类型
```

这是个容易搞混的地方。

### 3.5 `mount -x`（注意：同样不同！）

`mount` 的 `-x` 也不是 one-file-system，而是实验性 xfs 相关选项，日常不会用到。

---

## 4. 速查表

| 工具    | 参数                       | 含义               | 典型场景                   |
| ------- | -------------------------- | ------------------ | -------------------------- |
| `du`    | `-x` / `--one-file-system` | 不统计其他文件系统 | 计算分区占用               |
| `find`  | `-xdev`                    | 不进入其他文件系统 | 分区内文件搜索、inode 统计 |
| `rsync` | `-x` / `--one-file-system` | 不复制其他文件系统 | 制作根文件系统镜像         |
| `tar`   | `--one-file-system`        | 不打包其他文件系统 | 备份单分区                 |
| `cp`    | `-x`                       | 不复制其他文件系统 | 分区级复制                 |

---

## 5. 实战演示

以一个嵌入式设备为例，它的分区布局如下：

```
/          → /dev/mmcblk2p8  (8G, ext4, rootfs)
/home/data → /dev/mmcblk2p9  (21G, ext4, userdata)
```

### 不加 `-x` 的灾难

```bash
$ du -sh /
25G    /          # 8G rootfs + 21G userdata，全混在一起！

$ find / -xdev 2>/dev/null | wc -l
213847            # 包含 userdata 里的十几万个文件
```

如果用这两个错误的值去算 `mkfs.ext4` 的 block 和 inode 参数，生成出来的镜像会严重偏大。

### 加了 `-x` 之后

```bash
$ du -sh -x /
4.3G   /          # 这才是 rootfs 分区的真实大小

$ find / -xdev 2>/dev/null | wc -l
48923             # 这才是 rootfs 分区真实的文件数
```

## 6. 什么时候必须用 `-x`？

- **制作根文件系统镜像**：必须在 `du`、`find`、`rsync` 三个工具上全部加 `-x`，否则会错误打包子分区数据。
- **备份单个分区**：`tar --one-file-system -czf backup.tar.gz /`
- **查找根分区文件不干扰其他分区**：`find / -xdev -name "xxx"`
- **磁盘空间排查**：`du -hx / --max-depth=1 | sort -h` 可以准确看到根分区里哪个目录吃空间，不会被 `/home` 分区干扰。
