---
title: "Ubuntu emmc 测试"
date: 2026-05-26
last_modified_at: 2026-05-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-emmc-测试/
toc: true
---

## 1. 第一步：检查系统底层日志

如果 eMMC 真的有硬件级故障，Linux 内核通常会直接报错。打开终端，运行以下命令查看是否有 I/O 错误：

```bash
dmesg | grep -iE "mmc|blk|error"

```

或者查看系统核心日志：

```bash
sudo journalctl -p err..emerg

```

**🔍 结果分析：**

- **正常情况：** 只显示 eMMC 的初始化信息（如 `mmc0: new HS400 Enhanced Strobes MMC card`）。
- **异常情况：** 如果看到类似 `I/O error`, `Buffer I/O error on dev mmcblk0`, `Timeout waiting for hardware interrupt`, 或者 `blk_update_request: I/O error` 的字样，说明 **eMMC 确实存在硬件故障或严重不稳定**。

---

## 2. 第二步：读取 Smart/Health 状态（体检）

eMMC 芯片内部通常记录了自身的寿命和健康状态。我们可以通过 `mmc-utils` 工具来读取。

1. **安装工具：**

```bash
sudo apt-get update
sudo apt-get install mmc-utils

```

2. **查看 eMMC 寿命：**
   （注意：RK3588 的 eMMC 设备名通常是 `/dev/mmcblk0`）

```bash
   sudo mmc extcsd read /dev/mmcblk0 | grep -i "life"

```

**🔍 结果分析：**
会看到类似 `DEVICE_LIFE_TIME_EST_A` 和 `DEVICE_LIFE_TIME_EST_B` 的输出：

- `0x01` 代表消耗了 0%~10% 的寿命。
- `0x0A` 代表消耗了 90%~100% 的寿命（需要更换）。
- 如果看到 `0x0B`，说明寿命已经耗尽，随时可能锁死或损坏。

---

## 3. 第三步：读写速度基准测试（性能测试）

有时候 eMMC 没有完全坏死，但读写速度会变得极慢。我们可以使用 `fio` 进行基准测试。

1. **安装 fio：**

```bash
sudo apt-get install fio

```

2. **测试随机读写（最能反映真实系统卡顿）：**

```bash
   # 测试随机写（注意：这会在当前目录下创建一个临时文件测试，请确保在 eMMC 分区下运行）
   fio --name=randwrite --ioengine=libaio --iodepth=32 --rw=randwrite --bs=4k --direct=1 --size=512M --numjobs=1 --runtime=30 --time_based

```

---

## 4. 第四步：全盘坏道扫描（深度扫描）

如果怀疑某些特定扇区损坏导致系统崩溃，可以使用 `badblocks` 工具进行**只读扫描**（非破坏性，安全）。

```bash
sudo badblocks -v -s /dev/mmcblk0

```

_参数解释：`-v` 显示详细进度，`-s` 显示扫描进度条。_

**🔍 结果分析：**

- 扫描过程可能会持续比较久。如果最后输出的 `Pass completed, 0 bad blocks found.`，说明没有物理坏道。
- 如果列出了一堆数字（代表坏道块号），说明 eMMC 已经有物理损伤。
