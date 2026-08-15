---
title: "Linux 内核崩溃日志收集机制 ramoops与pstore"
date: 2026-06-30
last_modified_at: 2026-06-30
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/linux-内核崩溃日志收集机制-ramoops与pstore/
toc: true
---

Linux 内核崩溃日志收集里的 pstore​ 与 ramoops，本质上就是内核的“黑匣子”。当系统发生 Panic/Oops 等致命错误时，传统磁盘日志往往来不及落盘，这套机制能把最后的现场（dmesg、console、栈回溯等）保存在一个重启不丢数据的区域里，等你重启后读出来复盘。注意，由于是保存在内存中，所以只有不断电重启，日志能保存在/sys/fs/pstore下，并由systemd-pstore.service自动转存到/var/lib/systemd/pstore下。

如果崩溃后没有重启就断电了，再次上电是看不到保存的日志的。

## 1. `/sys/fs/pstore`：内核级的“黑匣子”（临时暂存）

- **底层原理**：`pstore` (Persistent Storage) 是 Linux 内核提供的一种机制，在 ARM 等嵌入式架构中，通常结合 `ramoops` 功能使用。它会在系统的物理内存 (RAM) 中硬性保留一小块固定的、独立于操作系统常规管理的区域。
- **崩溃瞬间**：当内核发生 Panic 崩溃时，系统会绕过常规的文件系统栈，直接将最后的内核日志（dmesg 输出）迅速写入这块保留的内存区域中。
- **重启特性**：因为数据存在 RAM 中，如果系统是**热重启**（例如看门狗复位、软件触发的重启，即**不断电**的情况），这块内存的数据不会被清空。重启后，内核会读取这块内存，将其内容映射为虚拟文件系统，并挂载在 `/sys/fs/pstore` 目录下。
- **局限性**：由于物理内存的易失性，如果系统经历了**断电重启**（Cold Boot），这部分保留内存中的数据就会丢失，无法生成日志。

## 2. `/var/lib/systemd/pstore`：用户态的持久化归档

- **机制转交**：系统成功热重启并进入用户态后，`/sys/fs/pstore` 中的文件虽然可以查看，但依然面临下次断电丢失的风险，且 `ramoops` 分配的内存空间通常很小（比如几百 KB）。
- **systemd 介入**：系统的 `systemd-pstore.service` 服务会在开机启动早期介入，自动去检查 `/sys/fs/pstore` 目录。
- **持久化动作**：如果发现里面有暂存的崩溃日志，`systemd` 会将其内容“搬运”并转存到磁盘的持久化目录 `/var/lib/systemd/pstore` 中（通常会保存为 `dmesg-ramoops-0` 等文件），随后**清空** `/sys/fs/pstore`，以便为下一次可能发生的崩溃腾出空间。
- **时间戳的排查意义**：检查转存日志的**创建时间**非常重要。因为转存动作发生在新一次开机时，日志文件的创建时间基本等于系统从崩溃中恢复过来的启动时间。通过这个时间点，可以与外围设备的操作日志或业务日志对齐，从而推断崩溃发生前系统在执行什么操作。

## 3. 如何查看系统中的 pstore（特别是基于 RAM 的 ramoops 机制）是否正常开启

### 1. 检查内核启动日志 (dmesg)

系统启动时，内核会打印 `ramoops` 的初始化状态。这是最直观的检查方法：

```bash
dmesg | grep -i ramoops

[    2.237579] ramoops: dmesg-0 0x20000@0x0000000000110000
[    2.240251] ramoops: console 0x80000@0x0000000000130000
[    2.240762] ramoops: pmsg    0x50000@0x00000000001b0000
[    2.241564] printk: console [ramoops-1] enabled
[    2.241990] pstore: Registered ramoops as persistent store backend
[    2.242577] ramoops: using 0xf0000@0x110000, ecc: 0
[    5.153911] systemd[1]: Condition check resulted in Load Kernel Module ramoops being skipped.
```
- pstore: Registered ramoops as persistent store backend 这行日志，说明内核不仅识别到了 ramoops 配置，还成功把它注册为了持久化存储的后端
- 同时，内核已经成功在物理内存地址 0x110000 处圈出了地盘，并且合理分配了空间：dmesg 分配了 128KB (0x20000)，console 分配了 512KB (0x80000)。

### 2. 检查 pstore 文件系统是否挂载

系统启动后，`pstore` 必须挂载到虚拟文件系统中才能被访问：

```bash
mount | grep pstore

pstore on /sys/fs/pstore type pstore (rw,nosuid,nodev,noexec,relatime)
```

- **正常现象**：输出类似 `pstore on /sys/fs/pstore type pstore (rw,nosuid,nodev,noexec,relatime)`。
- 如果未挂载，可以尝试手动挂载测试：`mount -t pstore pstore /sys/fs/pstore`。

### 3. 检查设备树 (Device Tree) 节点

在嵌入式 Linux 中，`ramoops` 需要在 DTS 中配置一块保留内存（`reserved-memory`）。可以通过 sysfs 直接查看当前系统解析到的设备树节点：

```bash
ls -l /sys/firmware/devicetree/base/reserved-memory/ | grep ramoops

drwxr-xr-x 2 root root  0 6月  30 14:07 ramoops@110000
```

### 4. 检查内核配置 (Kernel Config)

如果以上步骤都失败，可能内核在编译时根本没有开启相关选项。可以通过检查 config 文件（通常在 `/proc/config.gz` 或 `/boot/config-$(uname -r)`）来确认：

```bash
zcat /proc/config.gz | grep PSTORE

CONFIG_EFI_VARS_PSTORE=y
# CONFIG_EFI_VARS_PSTORE_DEFAULT_DISABLE is not set
CONFIG_PSTORE=y
CONFIG_PSTORE_DEFLATE_COMPRESS=y
# CONFIG_PSTORE_LZO_COMPRESS is not set
# CONFIG_PSTORE_LZ4_COMPRESS is not set
# CONFIG_PSTORE_LZ4HC_COMPRESS is not set
# CONFIG_PSTORE_842_COMPRESS is not set
# CONFIG_PSTORE_ZSTD_COMPRESS is not set
CONFIG_PSTORE_COMPRESS=y
CONFIG_PSTORE_DEFLATE_COMPRESS_DEFAULT=y
CONFIG_PSTORE_COMPRESS_DEFAULT="deflate"
CONFIG_PSTORE_CONSOLE=y
# CONFIG_PSTORE_PMSG is not set
CONFIG_PSTORE_RAM=y
# CONFIG_PSTORE_BOOT_LOG is not set
```

确保以下核心选项被设置为 `y`：

- `CONFIG_PSTORE=y` (开启 pstore 子系统)
- `CONFIG_PSTORE_RAM=y` (开启 ramoops 支持)
- `CONFIG_PSTORE_CONSOLE=y` (可选，将终端日志也保存进去)
- `CONFIG_PSTORE_PMSG=y` (可选，允许用户空间向 pstore 写入信息)

### 5. 终极验证：手动触发内核崩溃 (高危)

如果各项配置检查都正常，可以通过 SysRq 机制手动触发一次 Kernel Panic，来验证日志是否真的能保存下来。

> **警告：执行此操作会导致系统立即死机并重启，请确保正在运行的业务已暂停，且文件系统已同步（执行 `sync`）。**

```bash
# 1. 开启 SysRq 权限
echo 1 > /proc/sys/kernel/sysrq

# 2. 触发 Kernel Panic
echo c > /proc/sysrq-trigger

```

触发panic后，有时无法关机，此时可进入fiq中，输入reset进行关机。

系统重启后，检查 `/sys/fs/pstore/` 或者 `/var/lib/systemd/pstore` 目录下是否生成了 `dmesg-ramoops-0`（或其他类似命名）的文件。如果有，且里面包含了你刚才触发崩溃时的日志，说明 `pstore` 功能完全正常。
