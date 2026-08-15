---
title: "Intel CPU 微架构版本命名 —— lake"
date: 2026-02-25
last_modified_at: 2026-02-25
categories:
  - "服务器"
tags:
  - "服务器"
permalink: /服务器/intel-cpu-微架构版本命名-lake/
toc: true
---

Intel 的 CPU 代号习惯使用“Lake”作为后缀，这已成为其区分不同微架构版本的重要标识。

### 1. Intel 至强（Xeon）Scalable 处理器（1-5代）

至强 Scalable 系列主要用于数据中心，其代号从“Skylake”开始进入“Lake”时代。

| 至强代次    | 架构代号 (Codename)        | 特点描述                                                          |
| ----------- | -------------------------- | ----------------------------------------------------------------- |
| **第 1 代** | **Skylake-SP**             | 开启了全新的至强可扩展处理器时代                                  |
| **第 2 代** | **Cascade Lake**           | 在 Skylake 基础上优化，引入了深度学习加速指令集                   |
| **第 3 代** | **Cooper Lake / Ice Lake** | Cooper Lake 针对多路服务器；Ice Lake 采用 10nm 工艺，性能提升显著 |
| **第 4 代** | **Sapphire Rapids**        | 采用了小芯片（Chiplet）封装，支持 DDR5 和 PCIe 5.0                |
| **第 5 代** | **Emerald Rapids**         | Sapphire Rapids 的演进版，拥有更大的缓存和更高的能效              |

---

### 2. Intel 消费级处理器（主要 Lake 代表）

消费级处理器（Core 系列）的“Lake”命名非常密集，通常对应不同的桌面（Desktop）或移动（Mobile）架构。

| 架构代号 (Codename) | 常见世代/应用      | 备注                                |
| ------------------- | ------------------ | ----------------------------------- |
| **Skylake**         | 第 6 代            | Intel 历史上长寿的架构之一          |
| **Kaby Lake**       | 第 7 代            | Skylake 的优化版                    |
| **Coffee Lake**     | 第 8/9 代          | 核心数提升，引入了 i9 系列          |
| **Comet Lake**      | 第 10 代           | 进一步优化制程，核心数增加          |
| **Ice Lake**        | 第 10 代 (移动端)  | 早期 10nm 尝试                      |
| **Tiger Lake**      | 第 11 代 (移动端)  | 移动端性能大幅跃升                  |
| **Rocket Lake**     | 第 11 代 (桌面端)  | 桌面端重回 Willow Cove 架构         |
| **Alder Lake**      | 第 12 代           | 引入大小核（P-Core/E-Core）混合架构 |
| **Raptor Lake**     | 第 13/14 代        | Alder Lake 的改良与提升             |
| **Meteor Lake**     | Core Ultra (第1代) | 引入 Tile 模块化设计与 NPU          |
| **Arrow Lake**      | Core Ultra (第2代) | 进一步优化封装，提升能效            |

---

### 命名规律说明

- **架构 vs. 产品名：** “Lake”代号通常指**微架构**开发代号。一个代号可能跨越多个产品系列，或者同一个世代可能会有不同的代号（例如 11 代桌面用 Rocket Lake，移动端用 Tiger Lake）。
- **演进方向：** 近年来的“Lake”趋向于模块化（Chiplet）设计，将 CPU 计算核心、I/O 模块和图形核心分离，以提高生产灵活性。
