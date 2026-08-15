---
title: "fallocate 快速分配文件空间原理与用法"
date: 2026-07-24
last_modified_at: 2026-07-24
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/fallocate-快速分配文件空间原理与用法/
toc: true
---

## 一、fallocate 是什么

`fallocate` 是 Linux 下用于**直接操纵文件系统空间分配**的命令，可以在瞬间创建一个指定大小的文件，而不实际写入数据。

```bash
# 瞬间创建一个 1GB 的空洞文件
fallocate -l 1G ./big_file.bin
```

它不归 `dd`、`cp` 这些通用 I/O 工具管，而是走的 `fallocate(2)` 系统调用，直接对文件系统说"给我预留这么大空间"。

---

## 二、为什么 fallocate 这么快

### 2.1 传统方式：逐字节写入

```
dd if=/dev/zero of=./big_file.bin bs=1M count=1024
```

这个过程是：

```
┌─────────┐   write()    ┌──────────┐   分配 block   ┌──────────┐
│   dd    │ ───────────→ │  内核 VFS │ ────────────→ │ 文件系统  │
│ (用户态) │              │ (写页面缓存) │               │ (ext4/xfs)│
└─────────┘              └──────────┘               └──────────┘
                                │                         │
                          ① 每次 write 都触发               ② 逐块分配并标记
                          用户态↔内核态切换                    ③ 更新 inode 元数据
                          ② 写入数据到 page cache            ④ 更新 block bitmap
                          ③ 文件系统逐块分配                  ⑤ 写入 1G 的真实零数据
                          ④ 反复更新元数据
```

**1GB 文件 = 1024 次 `write()` 调用 × 1024 次块分配**，每一步都要走 I/O 栈。

### 2.2 fallocate 方式：元数据批量操作

```
fallocate -l 1G ./big_file.bin
```

这个过程是：

```
┌───────────┐  fallocate()  ┌──────────┐   一次性预留   ┌──────────┐
│ fallocate │ ────────────→ │  内核 VFS │ ────────────→ │ 文件系统  │
│  (用户态)  │               │          │     extent     │ (ext4/xfs)│
└───────────┘               └──────────┘               └──────────┘
                                                              │
                                                       ① 一次系统调用搞定
                                                       ② 文件系统直接分配 extent
                                                       ③ 只更新元数据，不写数据！
                                                       ④ 数据区标记为"未写"
```

**关键差异**：

| 操作              | `dd` 写入          | `fallocate`            |
| ----------------- | ------------------ | ---------------------- |
| 系统调用次数      | 上千次 `write()`   | **1 次 `fallocate()`** |
| 用户态/内核态切换 | 频繁               | 1 次                   |
| 数据实际写入      | 写入 1GB 零数据    | **不写任何数据**       |
| 块分配方式        | 逐块分配           | 一次性 extent 分配     |
| 元数据更新        | 每分配一块更新一次 | 分配完统一更新         |

> **根本原因**：`fallocate` 只在文件系统元数据层操作——告诉文件系统"这文件占这么多块"，而不实际碰数据区。就像酒店管理系统标记所有房间"已预订"，但服务员根本不进房间。

---

## 三、内核如何实现 fallocate

### ext4 的实现

ext4 使用 **extent（区段）** 来管理文件数据块，`fallocate` 的核心操作就是：

```
① 检查文件系统是否有足够空闲块
② 在 block bitmap 中标记目标块为"已用"
③ 创建 extent 记录加入文件的 extent tree
④ 更新 inode 中的文件大小和块计数
⑤ 数据块内容不做任何处理（保持原有残留数据）
```

**extent 示意**：

```
文件 data.bin (fallocate -l 4G)
    │
    inode
    └── extent[0]: 块 1024 ~ 块 1024+1M-1（连续 1M 块 ≈ 4G）
        不需要逐块记录，一个 extent 搞定！
```
---

## 四、和 dd / truncate 的对比

### 4.1 三种方式对比

| 特性               | `fallocate`        | `dd if=/dev/zero`   | `truncate -s`       |
| ------------------ | ------------------ | ------------------- | ------------------- |
| **速度**           | ⚡ 极快（毫秒级）  | 🐢 慢（秒到分钟级） | ⚡ 极快             |
| **是否真正分配块** | ✅ 是（立即占用）  | ✅ 是（写零数据）   | ❌ 否（稀疏文件）   |
| **磁盘空间被占用** | ✅ 立即占用        | ✅ 立即占用         | ❌ 不占（按需分配） |
| **读出来的内容**   | 残留数据（脏数据） | 全零                | 全零（空洞被补零）  |
| **安全风险**       | ⚠️ 可能泄露旧数据  | 安全                | 安全                |

### 4.2 实际测试对比

```bash
# 1. fallocate —— 瞬间完成
$ time fallocate -l 10G test_falloc.bin
real    0m0.003s        # 3 毫秒！

# 2. dd 写零 —— 需要真实 I/O
$ time dd if=/dev/zero of=test_dd.bin bs=1M count=10240
real    0m12.456s       # 12 秒

# 3. truncate —— 瞬间完成，但是稀疏文件
$ time truncate -s 10G test_sparse.bin
real    0m0.002s

# 查看实际占用
$ du -h test_*.bin
10G     test_falloc.bin   # fallocate：真实占用 10G
11G     test_dd.bin        # dd：真实占用 10G + 元数据
0       test_sparse.bin    # truncate：稀疏文件，不占空间
```

> `fallocate` 和 `truncate` 速度接近，但 `truncate` 创建的是稀疏文件（不占实际磁盘），`fallocate` 是真实占用块。

### 4.3 各自适用场景

| 场景                                   | 推荐工具              |
| -------------------------------------- | --------------------- |
| 紧急填满分区做测试                     | `fallocate`           |
| 需要保证写入全零数据                   | `dd if=/dev/zero`     |
| 创建大文件但不急着用空间（如 VM 镜像） | `truncate -s`（稀疏） |
| 预留磁盘配额                           | `fallocate`           |
| 基准测试 I/O 性能                      | `dd`                  |

---

## 五、实际场景：用普通用户身份快速填盘

### 5.1 情景

需要测试磁盘满时的系统行为，但不想用 `root`（以免把 `root` 的保留 inode 也耗光，更贴近真实场景）。

```bash
# 用普通用户身份填，避免把 inode 也耗光（更贴近真实场景）
sudo -u KangHua bash -c '
cd /home/KangHua/HTY1600
# 每次写1G，写20次，留一点余地
for i in $(seq 1 20); do
    fallocate -l 1G ./fill_file_${i}.bin
    echo "已写入 ${i}G"
done
'
```

### 5.2 逐步解读

```bash
sudo -u KangHua bash -c '
# ↑ 以 KangHua 身份执行，避免用 root
# root 有 5% 保留空间，用普通用户可以更真实地触发磁盘满

cd /home/KangHua/HTY1600

for i in $(seq 1 20); do
    fallocate -l 1G ./fill_file_${i}.bin
    #    ↑ 每次 1G，瞬间分配不写数据

    echo "已写入 ${i}G"
done
'
```
