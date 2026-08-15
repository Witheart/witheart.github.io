---
title: "RK NPU 软硬件生态栈简介 —— rknpu、rknn-toolkit-librknnrt、rknpu driver"
date: 2026-06-19
last_modified_at: 2026-06-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk-npu-软硬件生态栈简介-rknpu-rknn-toolkit-librknnrt-rknpu-driver/
toc: true
---

## 仓库链接
https://github.com/rockchip-linux/rknpu2
https://github.com/airockchip/rknn-llm
https://github.com/airockchip/rknn-toolkit2

## 1. 硬件与底层架构：rknpu 与 rknpu2

这两个词主要代表了瑞芯微 NPU 硬件架构及对应软件栈的**代际更替**。

- **rknpu（第一代）**：指瑞芯微早期的 NPU 架构及配套体系。主要用于老一代的芯片，如 RK1808、RV1109、RV1126、RK3399Pro 等。
- **rknpu2（第二代）**：这是全面升级后的 NPU 架构体系。**RK3568 和 RK3588** 这类较新的核心 SoC 搭载的正是这种第二代 NPU（以及后续的 RV1106 等）。相比第一代，它的算力利用率更高，支持的算子更多，且底层驱动和 API 接口也发生了改变。
- **关系**：两代架构在模型格式和底层 API 上**不兼容**。为 RK3399Pro（rknpu）编译的模型无法直接在 RK3588（rknpu2）上运行，必须重新转换。

---

![alt text](/assets/images/ubuntu-开发指南/rk-npu-软硬件生态栈简介-rknpu-rknn-toolkit-librknnrt-rknpu-driver/image.png)

## 2. PC端开发工具：rknn-toolkit 与 rknn-toolkit2

这是运行在 **PC（通常是 x86 Linux 虚拟机或主机）** 上的 Python 工具包，作用是“翻译”和“压缩”。

- **它们是什么**：你在 TensorFlow、PyTorch 或 ONNX 里训练出来的标准 AI 模型，NPU 硬件是看不懂的。Toolkit 的作用就是把这些主流框架的模型，量化（比如 FP32 转 INT8）并编译成瑞芯微 NPU 专属的 `.rknn` 格式文件。同时，它还提供在 PC 上模拟运行、评估性能和精度（C-Model 仿真）的功能。
- **rknn-toolkit**：专门用来生成 **rknpu（第一代）** 芯片所需的 `.rknn` 模型。
- **rknn-toolkit2**：专门用来生成 **rknpu2（第二代）** 芯片（如 RK3568/RK3588）所需的 `.rknn` 模型。

---

## 3. 板端运行环境：librknnrt 与 rknpu driver

当你在 PC 上用 Toolkit 生成了 `.rknn` 模型后，需要把模型丢到开发板上运行。这时候就需要板端环境的配合。

- **librknnrt (rknn runtime library)**：
- **这是什么**：这是运行在用户空间（User Space）的 C/C++ 动态链接库（`.so` 文件）。
- **作用**：它为你编写的 AI 应用程序提供了 API 接口（如 `rknn_init`, `rknn_inputs_set`, `rknn_run`, `rknn_outputs_get`）。你的业务代码通过调用这些 API 来加载模型、传入图像数据，并获取推理结果。

- **rknpu driver**：
- **这是什么**：这是运行在 **Linux 内核空间（Kernel Space）** 的底层驱动程序。
- **作用**：硬件级别的“包工头”。`librknnrt` 只是软件接口，当它下达 `rknn_run` 指令时，真正负责分配物理内存（如连续的 DMA 内存 / IOMMU 映射）、控制 NPU 电源域、配置 NPU 硬件寄存器并触发 NPU 硬件进行矩阵运算的，就是 NPU 驱动。
