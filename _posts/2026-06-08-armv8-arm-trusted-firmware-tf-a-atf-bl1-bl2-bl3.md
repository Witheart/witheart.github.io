---
title: "ARM Trusted Firmware (TF-A，ATF) BL1, BL2, BL3"
date: 2026-06-08
last_modified_at: 2026-06-08
categories:
  - "ARMv8"
tags:
  - "ARMv8"
permalink: /armv8/arm-trusted-firmware-tf-a-atf-bl1-bl2-bl3/
toc: true
---

在 ARMv8 架构（特别是引入了 TrustZone 安全扩展后）中，系统的启动不再是简单地把代码搬到内存里运行，而是有着严格的权限和安全等级划分。

为了统一和规范这个复杂的启动过程，ARM 官方推出了一套开源的底层软件架构：**ARM Trusted Firmware (TF-A，早期叫 ATF)**。在 TF-A 的规范中，启动过程被切分成了多个相互隔离的阶段（Boot Loader Stages），也就是你看到的 **BL1、BL2、BL31** 等。

## 启动阶段

### 1. BL1: 第一级引导 (AP ROM Code)

- **运行级别**：最高权限 EL3。
- **位置**：固化在芯片内部的只读存储器 (ROM) 中，出厂即不可更改。
- **核心职责**：这是系统上电后执行的第一行代码。它负责最基础的硬件初始化，并从外部存储（如 eMMC、SPI Flash、SD 卡）中寻找下一个阶段的代码 (BL2)，验证其签名（如果开启了安全启动），然后将其加载到芯片内部的 SRAM 中运行。
- **Rockchip 对应**：**MaskROM**。当你把板子变成“砖头”，无法从任何外部介质启动时，通过 USB 烧录工具看到的“MaskROM 模式”就是这个阶段在等待你通过 USB 灌入代码。

### 2. BL2: 信任引导固件 (Trusted Boot Firmware)

- **运行级别**：通常在 Secure EL1（或 EL3）。
- **位置**：存储在外部介质（如 eMMC），运行在芯片内部 SRAM。
- **核心职责**：由于 BL1 阶段可用的内部 SRAM 非常小，装不下复杂的代码。BL2 的核心任务就是**初始化主内存 (DDR)**。DDR 初始化成功后，BL2 会将后续的所有镜像（BL31、BL32、BL33）从外部存储器加载到广阔的 DDR 内存中，并将控制权交给 BL31。
- **Rockchip 对应**：通常对应 Rockchip 启动链中的 **TPL/SPL** 阶段，或者使用官方闭源的 **ddrbin** 和 **miniloader**。它负责把 DDR 跑起来。

### 3. BL31: 安全监控器 (Secure Monitor)

- **运行级别**：最高权限 EL3。
- **位置**：常驻内存。
- **核心职责**：**这是你之前关注的阶段。** 与 BL1 和 BL2 运行完就退出历史舞台不同，BL31 在引导完后续系统后，会**一直驻留在系统内存中**。它是安全世界和非安全世界之间的“桥梁”和“守门员”。当 Linux 内核（运行在 EL1）需要执行如 CPU 核心上下电 (PSCI)、或者访问加密硬件时，必须通过 SMC 指令陷入 EL3，由 BL31 来代为执行。
- **Rockchip 对应**：类似 `rk3568_bl31_v1.43.elf`。在打包时，它通常与其他安全组件一起被打包成 `trust.img`。

### 4. BL32: 可信操作系统 (Secure-EL1 Payload) - 可选

- **运行级别**：安全世界的 Secure EL1。
- **核心职责**：运行一个专门处理敏感信息的精简操作系统。比如处理指纹比对、人脸识别特征值提取、DRM 版权视频解密等。即使普通的 Linux/Android 彻底被黑客攻破，也无法直接读取 BL32 保护的数据。
- **Rockchip 对应**：通常是 **OP-TEE (Open Portable Trusted Execution Environment)**。它也包含在 `trust.img` 中。

### 5. BL33: 非可信引导程序 (Non-Trusted Firmware)

- **运行级别**：非安全世界的 EL2 或 EL1。
- **核心职责**：这就是我们最熟悉的常规 Bootloader。它的任务是初始化大部分非安全的硬件外设（如网卡、显示控制器），提供一个命令交互界面，并最终将 Linux 内核加载到内存中启动。从这里开始，系统彻底进入了“普通世界”。
- **Rockchip 对应**：**U-Boot**。对应的烧录文件通常是 `uboot.img`。

---

### 各阶段对应关系总览表

| TF-A 标准阶段 | 运行环境级别       | Rockchip 典型对应         | 核心使命                        |
| ------------- | ------------------ | ------------------------- | ------------------------------- |
| **BL1**       | EL3                | MaskROM                   | 上电第一条指令，找介质加载 BL2  |
| **BL2**       | Secure EL1/EL3     | ddrbin / miniloader (SPL) | 初始化 DDR 内存，加载后续镜像   |
| **BL31**      | EL3                | bl31.elf                  | 常驻 EL3 处理电源及安全世界切换 |
| **BL32**      | Secure EL1         | OP-TEE                    | 运行可信应用（加密、指纹等）    |
| **BL33**      | Non-Secure EL2/EL1 | U-Boot                    | 初始化外设，引导 Linux 内核     |

## 运行级别

### 1. 什么是运行级别 (Exception Levels, EL)？

在 ARMv8 架构中，为了保证系统的安全性、稳定性和虚拟化支持，引入了“异常级别”的概念。你可以把它想象成一个**权限不断降级的同心圆**或**洋葱模型**。数字越大，权限越高，能访问的硬件寄存器和内存区域就越核心。

ARMv8 定义了 4 个级别（EL0 到 EL3）：

- **EL3 (Secure Monitor - 安全监控器)**
- **权限最高**：拥有对整个芯片所有硬件（安全和非安全物理内存、外设）的绝对控制权。
- **对应软件**：我们之前聊到的 **BL31 (ARM Trusted Firmware)** 就运行在这里。它负责在“安全世界”和“非安全世界”之间进行上下文切换（World Switch），并处理底层的电源管理（CPU 核心的上下电）。

- **EL2 (Hypervisor - 虚拟化层)**
- **作用**：主要用于硬件级虚拟化支持。它允许多个独立的操作系统（Guest OS）运行在同一个物理 CPU 上，而彼此互不干扰。
- **对应软件**：KVM (Kernel-based Virtual Machine) 或者 Xen 虚拟机监控器。如果你的系统不需要跑虚拟机，这个级别通常会被直接跳过。

- **EL1 (Operating System - 操作系统内核)**
- **作用**：特权模式，负责管理系统资源、调度进程、驱动硬件设备。
- **对应软件**：你非常熟悉的 **Linux 内核**（比如 RK3568/RK3588 跑的 Linux 4.19 或 5.10）就运行在 EL1（通常是非安全世界的 Non-secure EL1）。

- **EL0 (User Application - 用户态程序)**
- **权限最低**：普通的应用程序不能直接操作硬件寄存器，必须通过系统调用（System Call）向 EL1 的内核申请。
- **对应软件**：比如你在系统中运行的 C# 程序、Python 脚本、或者用于进行内存压力测试的 `stressapptest` 等。

**工作逻辑示例**：
当你的用户态程序 (EL0) 想要让某个 CPU 核心休眠时，它会发起一个系统调用给 Linux 内核 (EL1)；内核发现自己没有权限直接断掉 CPU 的物理电源，于是通过一条 `SMC` (Secure Monitor Call) 指令触发异常，陷入到 BL31 (EL3)；最后由 BL31 去操作物理寄存器完成断电。

---

## 相关资料

### A. 核心理论：ARM 官方文档与开源社区

这是最权威的源头，虽然啃起来比较干，但极其严谨。

- **Trusted Firmware-A (TF-A) 官方文档**：
- 网站：`trustedfirmware.org`
- 必看章节：**"Firmware Design"** 和 **"Boot Flow"**。这里面详细定义了 BL1 -> BL2 -> BL31 -> BL32 -> BL33 的标准启动链模型。

- **ARM Architecture Reference Manual (ARM ARM)**：
- ARM 官方的架构手册。直接去 ARM 官网开发者专区搜索 ARMv8-A 的架构手册。重点看 **"AArch64 Exception model"** 这一章，里面详细定义了 EL 的切换机制和各类寄存器。

### B. 结合实践：芯片厂商资料 (以 Rockchip 为例)

理论落地到具体的 SoC 上会有定制化的调整。

- **Rockchip 官方 TRM (Technical Reference Manual)**：
- 在芯片的 TRM 手册中，通常会有一个专门的章节叫 **"Boot Mode"** 或 **"System Boot"**。里面会详细说明 MaskROM 是如何寻找启动介质的，以及不同启动引脚的电平定义。

- **Rockchip SDK 官方文档 (`docs/` 目录)**：
- 在你现有的 Linux SDK 中，`docs/` 目录下（或者通过厂商提供的内部资料库）通常会有《Rockchip_Developer_Guide_Linux_Boot_Architecture》或类似命名的 PDF。这份文档会用非常接地气的方式，解释 `ddrbin`、`miniloader`、`trust.img`、`uboot.img` 是怎么串联起来的。

### C. 代码级溯源：U-Boot 与 Kernel 源码

源码是最好的老师。

- **U-Boot 启动汇编**：去 U-Boot 源码里看 `arch/arm/cpu/armv8/start.S`。这是进入 U-Boot 的第一入口，你可以看到它是如何判断当前处于哪个 EL 级别，以及如何从 EL3（如果未经过 BL31）降级到 EL2 或 EL1 的。
- **TF-A 源码**：如果想看 BL31 是怎么实现的，可以去 Github 上拉取 `arm-trusted-firmware` 仓库，重点看 `plat/rockchip/` 平台相关的目录。
https://github.com/ARM-software/arm-trusted-firmware/blob/master/plat/rockchip/rk3568/platform.mk
