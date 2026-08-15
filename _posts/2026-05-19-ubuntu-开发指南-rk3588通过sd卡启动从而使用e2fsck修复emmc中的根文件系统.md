---
title: "RK3588通过SD卡启动从而使用e2fsck修复EMMC中的根文件系统"
date: 2026-05-19
last_modified_at: 2026-05-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588通过sd卡启动从而使用e2fsck修复emmc中的根文件系统/
toc: true
---

## 1 关于错误以及修复原理

### 1.1 错误原理

在 RK3588 平台上，根文件系统通常位于 eMMC​ 中。当系统异常断电、强制重启或存储出现坏块时，可能导致 ext4 根文件系统损坏。
此时系统可能出现：

- 启动时卡在 init/ mount rootfs阶段
- 进入 emergency mode或 read-only file system
- 内核日志中出现 EXT4-fs error相关信息

### 1.2 修复原理

```
┌─────────────────────────────────────────────┐
│                Superblock                   │ ← 文件系统的"身份证"
├─────────────────────────────────────────────┤
│          Block Group Descriptors            │ ← 块组描述符表
├──────────────┬──────────────┬───────────────┤
│ Block Bitmap │ Inode Bitmap │ Inode Tables  │ ← 每个块组的元数据区
├──────────────┴──────────────┴───────────────┤
│                                              │
│              Data Blocks                     │ ← 实际存储文件内容
│                                              │
└─────────────────────────────────────────────┘
```

- ext4关键元数据结构
  - 超级块（Superblock）：记录文件系统整体信息（总块数、总inode数、空闲计数等）
  - 块位图（Block Bitmap）：记录哪些数据块已被占用
  - inode位图（Inode Bitmap）：记录哪些inode已被使用
  - inode表：存储文件的元数据（权限、大小、时间、数据块指针等）
  - 数据块：实际存储文件内容

1. 日志重放（Journal Replay）
   1. ext4 是一个日志文件系统。在正常运行期间，系统在将实际数据写入磁盘的对应位置之前，会先把即将进行的操作记录在一个专门的“日志区（Journal）”中
   2. 对于 ext4，e2fsck 会首先去检查日志区。如果发现有已经完整记录但还未应用到文件系统主体的数据/元数据操作，e2fsck 会直接重放（Replay）这些日志，将操作补充完整。
2. 五次遍历（The 5 Passes）
   1. 检查 inode、块和大小 (Checking inodes, blocks, and sizes)。检查每个 inode 的格式、模式（比如是普通文件、目录还是符号链接）以及大小是否合理；检查 inode 指向的物理数据块列表。如果发现块号超出了磁盘范围，或者多个独立的 inode 指向了同一个数据块（交叉跨越），它会介入处理（通常是克隆或删除冲突）；e2fsck 会在内存中自行生成两张表：一张记录了所有“确实正在被 inode 使用的块”，另一张记录了“确实存在有效数据的 inode
   2. 检查目录结构 (Checking directory structure)。检查每个目录下的条目格式是否正确，名字长度是否合理；读取目录项中的 inode 号，去比对 Pass 1 中记录的有效 inode 列表。如果某个目录项指向了一个已经被标记为损坏或不存在的 inode，e2fsck 会将该目录项删除
   3. 检查目录连接性 (Checking directory connectivity)。主要处理“孤儿节点”：如果在 Pass 1 中发现了一个有效的 Inode（比如一个里面有代码或配置文件的 Inode），但在 Pass 2 中没有任何一个正常目录里的文件名指向它，这就成了一个“孤儿文件”。e2fsck 会把这种文件抢救出来，统一挂载到文件系统根目录的 lost+found 文件夹下，并以它的 inode 号命名（例如 #123456）
   4. 检查引用计数 (Checking reference counts)。每个 inode 内部都有一个计数器，记录有多少个目录项指向它。e2fsck 会将自己通过 Pass 2 和 Pass 3 实际统计出的指向该 inode 的数量，与 inode 本身内部记录的计数值进行比对。如果不一致，就以实际统计的值为准，强行覆盖重写 inode 里的计数值。如果计数为 0，则释放该 inode。
   5. 检查组摘要信息 (Checking group summary information)。ext4 使用块位图（Block Bitmap）和 Inode 位图（Inode Bitmap）来快速记录哪些块/Inode是空闲的，哪些是占用的。e2fsck 会把文件系统磁盘上的原生位图，与自己在 Pass 1 到 Pass 4 中于内存里亲手统计出来的实际使用情况进行最终对比；如果发现磁盘上的位图和实际情况不符（比如磁盘说某块空间被占用了，但实际没有任何文件在使用），e2fsck 会用内存中的正确位图去覆盖磁盘上的错误位图。同时，更新超级块（Superblock）中的空闲块总数和空闲 inode 总数

### 1.3 修复效果

- 修复只能修复文件系统的完整性，至于文件的完整性无法保证。此处引用RK文档中的解释：
  - 文件系统的完整性：文件系统可正常挂载，所有的文件和目录都可正常访问，可以正常完成所有已实现的文件操作
  - 文件的完整性：文件可正常读写，并且功能正常，例如媒体文件要能正常播放，XML 文件要能正常解析，压缩文件要能正常解压

## 2 查看根文件系统是否有错误

- 方式一

```bash
tune2fs -l /dev/mmcblk0p7 | grep -i "state"
```

如果有错误，可能显示为`clean with errors`

- 方式二

```bash
journalctl -b 0 | grep -i "ext4"

May 18 11:12:34 user kernel: EXT4-fs (mmcblk0p7): warning: mounting fs with errors, running e2fsck is recommended
May 18 11:12:34 user kernel: EXT4-fs (mmcblk0p7): recovery complete
May 18 11:12:34 user kernel: EXT4-fs (mmcblk0p7): mounted filesystem with ordered data mode. Opts: (null)
May 18 11:12:34 user kernel: ext4 filesystem being mounted at /root supports timestamps until 2038 (0x7fffffff)
May 18 11:12:34 user kernel: VFS: Mounted root (ext4 filesystem) on device 179:7.
May 18 11:12:34 user systemd[1]: Started Periodic ext4 Online Metadata Check for All Filesystems.
May 18 11:12:34 user systemd[1]: Starting Remove Stale Online ext4 Metadata Check Snapshots...
May 18 11:12:35 user systemd[1]: Finished Remove Stale Online ext4 Metadata Check Snapshots.
```

可以看到`mounting fs with errors`

## 3 修复方式一：尝试在线修复

- 首先尝试挂载为只读

```bash
sudo mount -o remount,ro /
```

大概率报错mount point is busy

- 如果成功切换为只读，直接运行修复命令，然后重启

```bash
sudo e2fsck -fy /dev/mmcblk0p7
```

## 4 修复方式二：使用SD卡启动，修复EMMC根文件系统

- 注意，3588启动介质顺序，有两个步骤指定，LOADER和UBOOT阶段
- LOADER阶段改不了，但是UBOOT阶段可以改，通过源码修改
- 一般情况下，插入制作好的SD启动卡，启动的就是SD卡中的系统，不过可能会使用SD卡中的kernel挂载EMMC中的根文件系统。这种情况是因为EMMC和SD卡中的系统是同一个系统，其UUID一致，而EMMC又先探测到，故错误挂载了EMMC中的系统
- 解决方式是，修改EMMC根文件系统分区的PARTUUID

> 这里的PARTUUID，在`device/rockchip/rk3588/parameter.txt`中有指定
>![alt text](/assets/images/ubuntu-开发指南/rk3588通过sd卡启动从而使用e2fsck修复emmc中的根文件系统/PixPin_2026-05-19_15-48-35.png)

### 4.1 根文件系统PARTUUID修改方式

1. **进入 fdisk 专家模式：**

```bash
sudo fdisk /dev/mmcblk0
```

2. **依次输入以下指令（注意这次要把新 UUID 复制进去）：**

- 输入 **`x`** 并回车（进入专家模式）
- 输入 **`u`** 并回车（修改分区 UUID）
- 输入 **`7`** 并回车（选择第 7 分区）
- 当提示 `New UUID...` 时，使用下面的全新 UUID，然后回车：

```text
88883588-c122-4c22-9876-5a32a688b358
```

- 输入 **`r`** 并回车（返回主菜单）
- 输入 **`w`** 并回车（保存并退出）

3. 重启

```bash
sudo reboot
```

### 4.2 SD卡上执行EMMC修复

- 确认使用SD卡启动并成功挂载了SD卡的根文件系统
- 确认lsblk可以看到EMMC的根文件系统分区
- 执行修复

```bash
sudo e2fsck -fy /dev/mmcblk0p7
```
