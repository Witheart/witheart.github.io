---
title: "3588通过io命令操作dev mem直接软复位系统（无日志）"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/3588通过io命令操作dev-mem直接软复位系统-无日志/
toc: true
---

在 RK3588 平台上，你可以通过访问 CRU（Clock and Reset Unit，时钟与复位单元）的**全局软件复位寄存器**，来实现直接从硬件底层触发整机重启。

使用 `io` 工具操作 `/dev/mem` 进行复位的具体命令如下：

```bash
io -4 0xfd7c0c08 0xfdb9

```

如果你的系统中没有 `io` 命令，也可以使用 Linux 根文件系统更常见的 `devmem` 工具：

```bash
devmem 0xfd7c0c08 32 0xfdb9

```

### 原理说明

1. **CRU 物理基地址**：RK3588 的 CRU 模块在物理内存映射中的基地址为 `0xFD7C0000`。
2. **复位寄存器偏移**：第一个全局软件复位寄存器（`CRU_GLB_SRST_FST`）的偏移地址是 `0x0C08`。
* 因此该寄存器的绝对物理地址为：`0xFD7C0000` + `0x0C08` = **`0xFD7C0C08`**。


3. **复位魔数（Magic Value）**：根据 RK3588 的官方 TRM（技术参考手册）P2287，该寄存器的 `[15:0]` 位专门用于触发全局软件复位，需要写入特定的验证魔数 **`0xFDB9`** 才能激活复位逻辑并导致系统立即重启。

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/3588通过io命令操作dev-mem直接软复位系统-无日志/PixPin_2026-08-11_11-32-34.png)

> **补充信息**：RK3588 还提供了第二个全局软件复位寄存器（`CRU_GLB_SRST_SND`），其物理地址为 `0xFD7C0C0C`，对应的触发魔数为 `0xECA8`。通常情况下，使用上述的第一级复位（`0xFD7C0C08`）就已经足够完成重启了。
