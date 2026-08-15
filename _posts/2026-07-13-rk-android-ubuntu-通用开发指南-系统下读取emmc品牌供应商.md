---
title: "系统下读取EMMC品牌供应商"
date: 2026-07-13
last_modified_at: 2026-07-13
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/系统下读取emmc品牌供应商/
toc: true
---

## 1. 基础查询：通过 `sysfs` 提取出厂信息

在绝大多数 Linux 系统中，无需安装第三方工具，直接通过 `sysfs` 虚拟文件系统即可读取 eMMC 内部寄存器的数据。

### 1.1 确认 eMMC 块设备节点

通常 eMMC 会被分配为 `/dev/mmcblk0`（部分设备树配置下可能为 `mmcblk1` 或 `mmcblk2`）。可通过以下命令确认：

```bash
cat /sys/block/mmcblk0/device/type
# 输出应为 MMC（若为 SD 则代表 SD 卡）
```

### 1.2 读取关键的出厂寄存器节点

确认设备后，可以直接读取以下文件来获取 eMMC 的“电子身份证”：

- **Manufacturer ID (制造商 ID):** `cat /sys/block/mmcblk0/device/manfid`
- **Product Name (产品料号):** `cat /sys/block/mmcblk0/device/name`
- **OEM ID (代工厂/应用 ID):** `cat /sys/block/mmcblk0/device/oemid`

**常见 eMMC 制造商 ID 映射表（基于 JEDEC JEP106 规范）：**
- 下载地址：
https://www.jedec.org/standards-documents/docs/jep-106ab?destination=node/8594

也可以从本笔记的同目录下获取 —— 《JEP106BO.pdf》

- 我司颗粒对照
2C -> 海康
d6 -> 江波龙
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/系统下读取emmc品牌供应商/746d59691658037fb6d6829bcb92864f.png)
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/系统下读取emmc品牌供应商/0492fa285422c40d8d13b79afea3be9f.png)

## 2. 透过丝印看本质：CID 寄存器到底是什么？

以上通过 `sysfs` 读取到的离散信息，实际上都来源于 eMMC 内部极其重要的一个 128 bit（16 字节）硬件寄存器 —— **CID (Card Identification Register)**。

系统上电初始化时，主控（如 RK3588）发送 `CMD2` (ALL_SEND_CID) 指令，eMMC 便会回复这 128 bit 的数据。我们可以直接读取完整的 CID 原始数据：

```bash
cat /sys/block/mmcblk0/device/cid
# 示例输出：d6290343394e37353110dc0afbcb4d00
```

这串十六进制字符包含了制造商、OEM 信息、ASCII 码转换的产品料号、硬件修订版本、全球唯一出厂序列号（Serial）以及生产年月。无论芯片外壳打着海康还是其他厂家的丝印，只要其内部固件和封装源自美光等原厂，其 CID 信息就会诚实地上报原厂的 ID。**对于底层驱动开发者而言，永远只相信寄存器，不相信丝印。**

## 3. 硬核探秘：eMMC 的物理限制与 Linux 内核源码解析

### 3.1 JEDEC 的 Bank 分页扩容机制

JEDEC 官方的 JEP106 标准定义了全球芯片制造商的代码。最初只分配了 8-bit（1 个字节，容量 127 家）。为了扩容，JEDEC 引入了延续码（Continuation Code）**`0x7F`**。

- 读到 `0x2C` 代表 Bank 1 的美光。
- 如果连续读到 10 个 `0x7F` 再加上 `0xD6`，才代表 Bank 11 的江波龙。

### 3.2 为什么 Linux 读不到 `0x7F` 延续码？

如果你查询江波龙（Longsys）的 `manfid`，你会发现系统直接输出了 `0xD6`，而没有前面的 `0x7F`。这并非 Linux 驱动做了跳过处理，而是受限于 **eMMC 的物理硬件限制**。

在 128 bit 的 CID 寄存器标准中，留给 Manufacturer ID 的物理空间**被严格焊死在了 8 bit（1 个字节）**。它根本装不下多达十几个字节的延续码。因此，新兴的存储厂商在烧录 eMMC 时，只能被迫丢弃所有的 `0x7F` 延续码，将核心特征码（如 `0xD6`）直接烧入这仅有的 8 bit 空间。

### 3.3 Linux MMC 子系统的“无情裁剪”

查阅 Linux 内核源码 `drivers/mmc/core/mmc.c` 中解析 eMMC CID 的函数 `mmc_decode_cid`，可以清晰看到这一物理约束的软件体现：

```c
static int mmc_decode_cid(struct mmc_card *card)
{
    u32 *resp = card->raw_cid;
    /* ... 略过部分代码 ... */
    case 4: /* MMC v4 */
        // 直接从第 120 位开始，硬性提取 8 个 bit 作为 manfid
        card->cid.manfid    = unstuff_bits(resp, 120, 8);
        card->cid.oemid     = unstuff_bits(resp, 104, 16);
        card->cid.prod_name[0]  = unstuff_bits(resp, 96, 8);
        // ...
}
```

结合之前的 CID 原始值 `d6290343394e37353110dc0afbcb4d00`，内核精准地切下了最高位的 8 个 bit（即 `d6`），呈现给用户层的就是 `0x0000d6`。
