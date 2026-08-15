---
title: "嵌入式开发调试工具与协议 —— JTAG等"
date: 2026-06-04
last_modified_at: 2026-06-04
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/嵌入式开发调试工具与协议-jtag等/
toc: true
---

## 一、 通信协议

这些是目标芯片引脚上的物理接口和通信标准。

- **JTAG (Joint Test Action Group)**
- **定位**：行业老牌通用标准。
- **特点**：兼容性极强，ARM、FPGA、DSP等各种芯片都在用。最初用于测试电路板连通性，后广泛用于程序下载和在线调试。
- **缺点**：占用引脚较多（通常需4-5根线：TDI, TDO, TCK, TMS, 加上VCC和GND）。

- **SWD (Serial Wire Debug)**
- **定位**：ARM公司专为Cortex系列（如STM32）开发的替代协议。
- **特点**：极度精简，仅需2根线（SWDIO数据线，SWCLK时钟线，外加VCC和GND）。因为省引脚且速度快，目前绝大多数ARM微控制器优先使用SWD。

在 ARM 体系架构（RK3568 是基于 ARM Cortex-A55 的芯片）中，JTAG 和 SWD 的引脚是复用的。它们的对应关系如下：

- TMS (Test Mode Select) 复用为 ➡️ SWDIO (Serial Wire Data In/Out，数据线)
- TCK (Test Clock) 复用为 ➡️ SWCLK (Serial Wire Clock，时钟线)

## 二、 硬件仿真器/调试器

一头插电脑USB，另一头接芯片的JTAG/SWD引脚。

- **J-Link**
- **定位**：德国Segger公司推出的商业级调试器标杆。
- **特点**：速度极快、极其稳定，支持几乎全球所有主流芯片，同时兼容JTAG和SWD。正版昂贵，克隆版普及率高。

- **ST-Link**
- **定位**：ST（意法半导体）官方调试器。
- **特点**：专为STM32和STM8芯片打造。价格便宜、普及度极高，主要使用SWD协议，通常不支持非ST品牌的芯片。

- **DAPLink**
- **定位**：ARM官方推出的开源软硬件项目。
- **特点**：主打“三合一”全能：
  1. **调试烧录**（支持SWD/JTAG）。
  2. **虚拟串口**（自带USB转TTL功能）。
  3. **拖拽下载**（插电脑识别为U盘，直接拖入.bin/.hex文件即可烧录）。

## 三、 软件标准与底层工具

在你的IDE（如Keil, VS Code）背后默默工作的软件机制。

- **CMSIS-DAP**
- **定位**：ARM发布的软件接口标准。
- **特点**：DAPLink就是基于此标准的实体产品。只要硬件调试器支持该标准，电脑端即可**免驱使用**（Win10/11即插即用），无需像J-Link那样专门安装驱动。

- **GDB (GNU Debugger)**
- **定位**：真正的代码调试核心。
- **特点**：当你在代码里执行“打断点”、“单步运行”、“查看变量”时，其实都是编译器在后台调用GDB发出指令。

- **OpenOCD (Open On-Chip Debugger)**
- **定位**：开源的桥接软件。
- **特点**：因为市面上有J-Link、ST-Link等各种硬件，OpenOCD的作用就是把它们统一管理起来。它接收GDB发来的高级指令，翻译成特定调试器能懂的底层指令。

---

### 核心流程

当你在电脑上点击“Debug（调试）”按钮时，数据流向如下：

1. 你在IDE中操作 ➡️ 调用 **GDB** 生成调试指令
2. GDB 将指令发给 ➡️ **OpenOCD**
3. OpenOCD 翻译后通过USB发给 ➡️ **J-Link / DAPLink** (硬件调试器)
4. 硬件调试器通过 ➡️ **SWD / JTAG** (物理协议线缆)
5. 最终精准控制并读取 ➡️ **目标芯片 (MCU/FPGA)**
