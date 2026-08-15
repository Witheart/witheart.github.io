---
title: "UUID、PARTUUID 的区别与 RK 平台启动位置指定"
date: 2025-08-03
last_modified_at: 2025-08-03
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/uuid-partuuid-的区别与-rk-平台启动位置指定/
toc: true
---

## 一、两种 UUID：一图搞懂

```
磁盘 /dev/mmcblk0
  │
  ├── GPT 分区表 ─────────────────────────────
  │   ├── 分区 1: /dev/mmcblk0p1  PARTUUID=111...
  │   ├── 分区 2: /dev/mmcblk0p2  PARTUUID=222...
  │   ├── ...
  │   └── 分区 7: /dev/mmcblk0p7  PARTUUID=888...
  │         │
  │         └── ext4 文件系统 ────────────────
  │               └── 超级块 (Superblock)
  │                     └── UUID=abc123...  ← 文件系统 UUID
  │
  └── LBA 第 1 个扇区是 GPT Header，第 2 个扇区开始分区表项
```

|              | 文件系统 UUID                                             | 分区 PARTUUID                                              |
| ------------ | --------------------------------------------------------- | ---------------------------------------------------------- |
| **存储在**   | ext4 超级块中                                             | GPT 分区表项中                                             |
| **谁生成**   | `mkfs.ext4` 格式化时                                      | `fdisk` / `gdisk` 写入分区表时                             |
| **查看命令** | `blkid /dev/sda1` 的 `UUID=xxx`<br>`tune2fs -l /dev/sda1` | `blkid /dev/sda1` 的 `PARTUUID=xxx`<br>`lsblk -o PARTUUID` |
| **修改命令** | `tune2fs -U random /dev/sda1`                             | `fdisk` 专家模式 `x → u`                                   |
| **影响范围** | 文件系统内部                                              | 分区层面                                                   |
| **被谁使用** | `root=UUID=xxx` 挂载                                      | `root=PARTUUID=xxx` 挂载                                   |

---

## 二、各自的存储位置和生命周期

### 2.1 文件系统 UUID

```bash
# 查看
$ blkid /dev/mmcblk0p7
/dev/mmcblk0p7: UUID="d8a3f52c-..." TYPE="ext4" PARTUUID="88883588-..."

$ tune2fs -l /dev/mmcblk0p7 | grep UUID
Filesystem UUID:          d8a3f52c-...

# 修改
tune2fs -U random /dev/mmcblk0p7       # 随机生成新 UUID
tune2fs -U 固定的值 /dev/mmcblk0p7     # 指定固定值
```

| 文件系统 | UUID 存储位置                    |
| -------- | -------------------------------- |
| ext4     | 超级块，偏移 0x68，16 字节       |
| btrfs    | 超级块，字段 `fsid`              |
| xfs      | 超级块，字段 `uuid`              |
| fat32    | 无文件系统 UUID，靠卷序列号      |
| NTFS     | Master File Table 中的 `$Volume` |

> **生命周期**：`mkfs` 创建时生成，**`cp`/`dd` 复制的镜像 UUID 完全相同**。重新 `mkfs` 就变了。rsync 同步不影响 UUID。

### 2.2 分区 PARTUUID

```bash
# 查看
$ lsblk -o NAME,SIZE,UUID,PARTUUID
NAME         SIZE UUID                                 PARTUUID
mmcblk0    29.1G
├─mmcblk0p7  10G d8a3f52c-...                         88883588-c122-4c22-9876-5a32a688b358

$ blkid /dev/mmcblk0p7
/dev/mmcblk0p7: UUID="d8a3f52c-..." PARTUUID="88883588-..."
```

| 分区表类型    | PARTUUID 格式                                          |
| ------------- | ------------------------------------------------------ |
| **GPT**       | 128 位 GUID，如 `88883588-c122-4c22-9876-5a32a688b358` |
| **MBR (DOS)** | 4 字节磁盘标识符 + 分区号，如 `a1b2c3d4-07`            |

> **生命周期**：分区表写入时分配。**即使重新 mkfs、dd 覆盖整个分区，PARTUUID 不变**——因为 PARTUUID 在分区表里，不在分区数据区里。

---

## 三、镜像烧录场景下的区别（关键！）

假设烧录同一份 `rootfs.img` 到两处：

```bash
# 同一份 img 烧到 EMMC 和 SD 卡
dd if=rootfs.img of=/dev/mmcblk0p7    # EMMC 第 7 分区
dd if=rootfs.img of=/dev/mmcblk1p7    # SD 卡第 7 分区
```

| 属性          | EMMC (mmcblk0p7) | SD 卡 (mmcblk1p7) | 是否相同                                  |
| ------------- | ---------------- | ----------------- | ----------------------------------------- |
| 文件系统 UUID | `d8a3f52c-...`   | `d8a3f52c-...`    | ✅ **相同**（img 镜像里的超级块被复制了） |
| 分区 PARTUUID | `88883588-...`   | `88883588-...`    | ⚠️ **取决于分区表是否一起烧录**           |

- 如果分区表由 `parameter.txt` 统一写入：PARTUUID 也相同
- 如果手动分区并用 `gdisk` 分别分配：PARTUUID 不同

**问题**：EMMC 和 SD 卡烧了同一份固件，文件系统 UUID 和 PARTUUID 都相同；如果是不同固件，但是parameter.txt中指定的UUID没改，那么文件系统UUID不同，PARTUUID相同。

- 内核bootargs用 `root=PARTUUID=xxx` 匹配时两个都命中，EMMC 先探测到就挂 EMMC。
- 参考《05.3 RK (Android&Ubuntu) 通用开发指南\RK SD 卡启动\RK SD 卡启动.md》

---

## 四、RK 平台启动位置指定

### 4.1 `root=` 参数支持的写法

| 写法                  | 匹配方式                      | 示例                                                 |
| --------------------- | ----------------------------- | ---------------------------------------------------- |
| `root=PARTUUID=xxx`   | 按 **GPT 分区 PARTUUID** 匹配 | `root=PARTUUID=88883588-c122-4c22-9876-5a32a688b358` |
| `root=UUID=xxx`       | 按 **文件系统 UUID** 匹配     | `root=UUID=d8a3f52c-xxxx`                            |
| `root=/dev/mmcblk0p7` | 按 **固定设备路径** 匹配      | `root=/dev/mmcblk0p7`                                |
| `root=LABEL=xxx`      | 按 **文件系统卷标** 匹配      | `root=LABEL=rootfs`                                  |

### 4.2 RK 的 `parameter.txt` 指定

```bash
# device/rockchip/rk3588/parameter.txt 中
# 分区的 PARTUUID 在此通过 ROCKCHIP SDK 写入 GPT 分区表

mtdparts=rk29xxnand:...
```

> `parameter.txt` 定义的是 **分区布局和 PARTUUID**，不涉及文件系统 UUID。文件系统 UUID 由 `mkfs.ext4` 生成。

### 4.3 用 PARTUUID 定位根分区

在 RK 平台上，一般使用 `root=PARTUUID=xxx`：

```bash
# U-Boot 中的 bootargs
setenv bootargs "root=PARTUUID=88883588-c122-4c22-9876-5a32a688b358 rw ..."
```

| 方式                  | 优点                               | 缺点                                                    |
| --------------------- | ---------------------------------- | ------------------------------------------------------- |
| `root=PARTUUID=xxx`   | 分区表级稳定，不受 dd 镜像覆盖影响 | 换分区表就失效                                          |
| `root=UUID=xxx`       | 文件系统级标识                     | **同一镜像烧到多设备会冲突**                            |
| `root=/dev/mmcblk0p7` | 最直观                             | **设备路径可能不固定**（多盘场景 mmcblk0/mmcblk1 会变） |

---

## 五、实战：SD 卡启动修复 EMMC 时的 UUID 冲突处理

### 5.1 问题

```
EMMC (mmcblk0p7)  ← 同一份固件 →  SD 卡 (mmcblk1p7)
  文件系统 UUID 相同          文件系统 UUID 相同
  PARTUUID 相同               PARTUUID 相同
     ↓ 内核 root=PARTUUID=xxx 匹配时 ↓
    两个都匹配，EMMC 先被扫到 → 挂载 EMMC 的根文件系统
    本来应该起 SD 卡的系统，结果起了 EMMC 的
```

### 5.2 解决方式

只用 `fdisk` 改 EMMC 的 **分区 PARTUUID**（不动文件系统 UUID），让 `root=PARTUUID=xxx` 不再匹配 EMMC：

```bash
sudo fdisk /dev/mmcblk0
# x  →  专家模式
# u  →  修改分区 UUID
# 7  →  选择第 7 分区
# 输入新 UUID，如: 88883588-c122-4c22-9876-5a32a688b358
# r  →  返回主菜单
# w  →  保存并退出

# 验证
blkid /dev/mmcblk0p7
# PARTUUID 变了，UUID 不变
```

> 这个方法之所以生效，前提是 `parameter.txt` 中 `root=` 用的是 `PARTUUID=` 而不是 `UUID=`。如果用的是文件系统 UUID，就得改 `tune2fs -U`。
