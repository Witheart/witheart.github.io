---
title: "3568 PCIe2CAN模块 F81601A_PCIe_CAN 适配指南"
date: 2026-07-29
last_modified_at: 2026-07-29
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-pcie2can模块-f81601a-pcie-can-适配指南/
toc: true
---

## 1. 芯片介绍
F81601A 是 Fintek 出品的 PCIe 转 2 路 CAN FD 芯片，基于自定义 SJA1000 兼容控制器实现。本文档记录在 RK3568 Android 11 平台（`NK_RK3568` 板卡）上完成 PCIe2x1 接口切换及驱动集成的完整过程。

## 2. 硬件前提

### 2.1 RK3568 Combophy 资源分配

RK3568 拥有 3 路组合 PHY（combophy），其中 `combphy2_psq` 被 **SATA2** 和 **PCIe2x1** 共享，两者互斥：

| Combophy | 复用功能 | 本方案使用 |
|----------|---------|-----------|
| `combphy0_us` | USB3_0 / SATA0 | — |
| `combphy1_usq` | USB3_1 / SATA1 / QSGMII | — |
| **`combphy2_psq`** | **PCIe2x1** / SATA2 / QSGMII | **PCIe2x1** |

> `pcie3x2` 走独立 PHY（`pcie30phy`），不与 SATA2 冲突，如有需要可单独开启。

### 2.2 F81601A 芯片信息

| 项目 | 值 |
|------|-----|
| PCI Vendor ID | `0x1c29` |
| PCI Device ID | `0x2004` |
| CAN 通道数 | 2（can0 / can1） |
| 支持模式 | CAN 2.0B / CAN FD |
| 驱动版本 | v1.02 |

---

## 3. 修改步骤

### 3.1 Device Tree：关闭 SATA、开启 PCIe2x1

**文件**：`kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi`

**3.1.1 关闭 SATA2**

将 `&sata2` 节点的条件编译从 `#if 1` 改为 `#if 0`：

```dts
#if 0      // <-- 原来是 #if 1
&sata2 {
    status = "okay";
};
#endif
```

**3.1.2 开启 PCIe2x1**

将 `&pcie2x1` 节点的条件编译从 `#if 0` 改为 `#if 1`：

```dts
//pciex2
#if 1      // <-- 原来是 #if 0
&pcie2x1 {
        reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_HIGH>;
        vpcie3v3-supply = <&vcc3v3_pcie>;
        status = "okay";
};
#endif
```

**无需改动**：
- `&combphy2_psq` 的 `status = "okay"` 保持不变（SATA 和 PCIe 共用该 PHY）
- `&pcie30phy` 的 `status = "okay"` 保持不变

### 3.2 驱动源码集成

**3.2.1 复制驱动源文件**

```bash
cp F81601A_Linux_Driver_v1.02/driver/f81601a.c \
   kernel/drivers/net/can/sja1000/
```

> 驱动使用 `USE_CUSTOM_SJA1000` 宏，内部实现了所有 SJA1000 寄存器操作函数，**不依赖内核的 `sja1000.ko`**。

**3.2.2 Kconfig 条目**

文件：`kernel/drivers/net/can/sja1000/Kconfig`

在 `endif`（CAN_SJA1000 子菜单结束）**之后**添加（独立于 `CONFIG_CAN_SJA1000`，因为驱动自带 SJA1000 实现）：

```kconfig
config CAN_F81601A
    tristate "F81601A PCIe CAN Card"
    depends on PCI
    ---help---
      This driver is for the F81601A PCIe CAN card which supports
      2 channels of CAN FD. The F81601A uses a custom SJA1000 compatible
      controller.
```

**3.2.3 Makefile 条目**

文件：`kernel/drivers/net/can/sja1000/Makefile`

在文件末尾添加：

```makefile
obj-$(CONFIG_CAN_F81601A) += f81601a.o
```

### 3.3 内核配置

**文件**：`kernel/arch/arm64/configs/NK_RK3568_defconfig`

在 CAN 相关配置后添加：

```
CONFIG_CAN_F81601A=y
```

确保以下 CAN 基础配置已开启（本平台已默认开启）：

```
CONFIG_CAN=y
CONFIG_CAN_RAW=y
CONFIG_CAN_BCM=y
CONFIG_CAN_GW=y
CONFIG_CAN_DEV=y
CONFIG_CAN_CALC_BITTIMING=y
```

## 4 验证驱动加载

```bash
# 查看 PCIe 设备是否识别（Vendor=0x1c29, Device=0x2004）
lspci

# 查看 CAN 网络接口
ip link show type can

# 或查看内核日志
dmesg | grep -i f81601a
dmesg | grep -i can
```

正常应看到 `can0` 和 `can1` 两个接口。

```bash
# 配置 CAN0，波特率 500kbps
ip link set can0 type can bitrate 500000
ip link set can0 up

# 配置 CAN1，波特率 500kbps
ip link set can1 type can bitrate 500000
ip link set can1 up

# 发送测试帧
cansend can0 123#DEADBEEF

# 接收测试
candump can0
```

---

## 5. 驱动模块参数（仅模块模式有效）

若编为 `.ko` 模块（`CONFIG_CAN_F81601A=m`），可传递以下参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable_msi` | bool | 1 | 启用 MSI 中断 |
| `max_msi_ch` | uint | 2 | MSI 通道数 |
| `internal_clk` | bool | 1 | 使用内部时钟（80MHz） |
| `external_clk` | uint | 80000000 | 外部时钟频率（`internal_clk=0` 时有效） |
| `bus_restart_ms` | uint | 0 | 总线自动恢复延时（ms） |
