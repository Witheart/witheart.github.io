---
title: "关于rk3568 rk3588 电源域配置 io domains"
date: 2026-05-27
last_modified_at: 2026-05-27
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/关于rk3568-rk3588-电源域配置-io-domains/
toc: true
---

## 1. 核心概念：什么是 IO Domain（IO 域）

主控芯片（SoC）的 GPIO 引脚在物理设计上会被划分为多个组，每组共享一个专门的电源输入引脚（即 **VCCIO** 或 **PMUIO**）。共享同一 VCCIO 供电的这组 GPIO 即构成一个 **IO 域（IO Domain）**。

**IO 域的核心作用是决定通信电平：** VCCIO 输入的物理电压（如 1.8V 或 3.3V），决定了该域内所有 GPIO 输出高电平的电压值，同时要求外部输入的信号电平必须与之匹配。

**注意区分“外设核心供电”与“IO 通信供电”：**
以 eMMC 为例，其运行需要两路供电：

1. **VCC（核心供电）：** 通常固定为 3.3V，用于驱动内部 NAND Flash 存储颗粒，与 SoC 的 IO 域无关。
2. **VCCQ（IO 通信供电）：** 用于数据线（CMD, CLK, DATA）通信，高速模式下通常为 1.8V。
   **匹配原则：** 主控 SoC 端连接 eMMC 的 GPIO 域（如 EMMCIO），其供电电压必须与外设的通信供电（VCCQ）保持严格一致。

---

## 2. 软硬件协同机制差异：RK3568 vs RK3588

不同代际的芯片在处理 IO 域电压适配时，机制存在根本差异：

- **RK3399 / RK3568（软件手动声明）：**
  芯片硬件无法感知外部实际供电电压。必须通过软件（Linux 设备树 `io-domains` 节点）显式配置，将内部电平转换器（Level Shifter）切换至与物理供电一致的挡位（1.8V 或 3.3V）。若软件配置与物理供电不符，会导致逻辑电平异常，严重时将烧毁 SoC 的 IO 接口。
- **RK3588（硬件自动识别）：**
  相关 VCCIO 引脚内部集成了**电压自动检测电路**。芯片通过硬件直接测量外部输入的物理电压，并自动完成内部电平挡位的切换适配。因此，**RK3588 在软件端（DTS）完全弃用了 `io-domain` 配置。**

参考`Rockchip RK3588 Hardware Design Guide`
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/关于rk3568-rk3588-电源域配置-io-domains/PixPin_2026-05-27_15-03-39.png)

`kernel/drivers/soc/rockchip/io-domain.c`文件中，也没有3588
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/关于rk3568-rk3588-电源域配置-io-domains/PixPin_2026-05-27_15-04-33.png)

---

## 3. RK3588 GPIO 电源域硬件设计规范

根据 RK3588 硬件设计手册，其 GPIO 电源域按特性分为“固定电平”与“自动识别”两类，具体管脚及电压规范如下表：

| 电源域类型         | 对应管脚名称                                     | 支持电压范围     | 说明                                       |
| ------------------ | ------------------------------------------------ | ---------------- | ------------------------------------------ |
| **固定电平电源域** | `PMUIO1`, `EMMCIO`, `VCCIO1`, `VCCIO3`           | **仅 1.8V**      | 硬件仅支持 1.8V 供电，不可配置为其他电压。 |
| **自动识别电源域** | `PMUIO2`, `VCCIO2`, `VCCIO4`, `VCCIO5`, `VCCIO6` | **1.8V 或 3.3V** | 芯片自动识别硬件物理电压，无需软件干预。   |

### 3.1 自动识别电源域的硬件接线要求

对于支持 1.8V/3.3V 双电压的电源域（如 `PMUIO2`，以及 `VCCIO[2, 4:6]`），硬件电路设计必须遵循以下基准电压（1V8）与主电压引脚的配合规则：

- **当配置为 1.8V 通信时：** `PMUIO2_1V8` 接 1.8V，且 `PMUIO2` 接 1.8V。
- **当配置为 3.3V 通信时：** `PMUIO2_1V8` 接 1.8V，且 `PMUIO2` 接 3.3V。

### 3.2 电源状态一致性要求 (S0/S3)

上述主电压引脚与基准电压（1V8）引脚的电源类型必须**保持同步**，禁止混合使用不同待机状态的电源：

- **规则：** 两个电源脚必须同为 **S0 电源**（待机时关闭），或者同为 **S3 电源**（待机时保持开启）。
- **禁忌：** 绝对不能出现一个引脚接 S0，另一个引脚接 S3 的情况。

## 4. 3568 io_domains配置
`kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi`
设备树中找到这个节点：
```dts
&pmu_io_domains {
	status = "okay";
	pmuio2-supply = <&vcc3v3_pmu>;
	vccio1-supply = <&vccio_acodec>;
	vccio3-supply = <&vccio_sd>;
	vccio4-supply = <&vcc_1v8>;
	vccio5-supply = <&vcc_3v3>;
	vccio6-supply = <&vcc_1v8>;
	vccio7-supply = <&vcc_3v3>;
};
```
