---
title: "Linux 使用GPT分区表的标签索引指定的分区 —— by-partlabel"
date: 2026-05-07
last_modified_at: 2026-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-使用gpt分区表的标签索引指定的分区-by-partlabel/
toc: true
---

在 Linux 系统中，`/dev/disk/by-partlabel/` 是一个非常有用的目录，它存放着指向磁盘分区的**符号链接**（symbolic links）。

简单来说，这个目录能让你通过**分区的名字**（而不是设备号或文件系统标签）来找到对应的硬件设备。

---

## 1. 核心概念：什么是 Partlabel？

在深入之前，需要区分两个经常被搞混的概念：

- **PARTLABEL (Partition Label)**：这是存储在 **GPT 分区表**中的名称。它是分区表本身的一部分，与分区内格式化的文件系统（如 ext4, ntfs）无关。
- **LABEL (Filesystem Label)**：这是存储在**文件系统**（如磁盘里的数据层）里的名字。

`/dev/disk/by-partlabel/` 里的内容完全取决于你在创建分区时给它起的“名字”。

---

## 2. 目录里长什么样？

如果你进入这个目录并执行 `ls -l`，你会看到类似这样的结构：

```bash
$ ls -l /dev/disk/by-partlabel/
lrwxrwxrwx 1 root root 10 May  6 10:00 EFI-system -> ../../sda1
lrwxrwxrwx 1 root root 10 May  6 10:00 Linux-root -> ../../sda2
lrwxrwxrwx 1 root root 10 May  6 10:00 Recovery-data -> ../../sdb1
```

**这里的逻辑是：**

- 左侧的名字（如 `EFI-system`）是你在分区工具中定义的标签。
- 右侧的路径（如 `../../sda1`）是系统分配的具体块设备路径。

---

## 3. 为什么这个路径很有用？

在 Linux 中，设备名称（如 `/dev/sda` 或 `/dev/sdb`）是**不稳定**的。如果你插拔了新的硬盘，或者更换了主板上的 SATA 接口，原本的 `sda` 可能会变成 `sdb`。

使用 `/dev/disk/by-partlabel/` 有以下好处：

1.  **持久性**：只要分区表没改，名字就永远不变，即使你把硬盘换到另一台电脑上。
2.  **可读性**：比起 `/dev/nvme0n1p3` 这种冰冷的编号，`UserData` 或 `Backup` 显然更直观。
3.  **独立性**：即使分区没有格式化（没有文件系统），只要分区表里有名字，这个链接就会存在。

---

## 总结

`/dev/disk/by-partlabel/` 是 GPT 分区表提供的一种**人性化索引**。它不关心磁盘里装的是什么系统，只关心你在分区表里给这块“地皮”起的名字。

> **小贴士**：如果你在写 `/etc/fstab` 挂载配置，使用 `PARTLABEL=YourName` 或者通过这个目录下的路径进行挂载，能有效防止因为增加硬盘导致系统无法启动的尴尬局面。
