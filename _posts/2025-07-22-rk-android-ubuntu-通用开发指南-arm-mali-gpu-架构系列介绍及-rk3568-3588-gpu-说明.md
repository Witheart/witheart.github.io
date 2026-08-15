---
title: "ARM Mali GPU 架构系列介绍及 RK3568 3588 GPU 说明"
date: 2025-07-22
last_modified_at: 2025-07-22
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/arm-mali-gpu-架构系列介绍及-rk3568-3588-gpu-说明/
toc: true
---

## 一、Mali GPU 是什么

**Mali** 是 ARM 公司旗下的 GPU IP 品牌，与 ARM Cortex CPU 一样，采用**授权模式**，芯片厂商（如 Rockchip、MediaTek、Samsung）向 ARM 购买 Mali GPU 核心授权后集成到自己的 SoC 中。

Mali GPU 主要用于移动端、嵌入式、平板、机顶盒等场景，竞争对手包括 Imagination PowerVR、Qualcomm Adreno、Broadcom VideoCore 等。

---

## 二、Mali GPU 架构代际演进

ARM Mali GPU 按发布年代和架构，分为 **五大代际**：

```
Utgard  (2007~2012)    最早期的 Mali 架构
  └── Mali-200, Mali-400 MP, Mali-450 MP, Mali-470

Midgard (2013~2016)    首代统一着色器架构
  └── Mali-T604, T622, T624, T628, T678
  └── Mali-T720, T760, T820, T830, T860, T880

Bifrost (2016~2020)    引入全新标量/子句执行模型
  └── Mali-G31, G51, G52, G57(部分)
  └── Mali-G71, G72, G76

Valhall (2019~至今)    第二代标量架构，大幅提升效率
  └── Mali-G57(部分), G68, G77, G78
  └── Mali-G310, G510, G610, G710, G715

5th Gen (2023~至今)    第五代架构，引入硬件光追等
  └── Immortalis-G720, Mali-G720, Mali-G620
```

---

## 三、各架构特点详解

### 3.1 Utgard 架构（2007~2012）

首代 Mali GPU，采用**分离式顶点/像素着色器**（非统一着色器）。

| 型号            | 核心数 | 典型用途                                        |
| --------------- | ------ | ----------------------------------------------- |
| Mali-200        | 1      | 低端手机、功能机                                |
| **Mali-400 MP** | 1~4    | 广泛用于 RK3066、全志 A10/A20、三星 Exynos 4210 |
| Mali-450 MP     | 1~8    | Mali-400 升级版，提升顶点处理性能               |
| Mali-470        | 1~4    | 低功耗优化版，用于 IoT/可穿戴                   |

> 特点：仅支持 OpenGL ES 2.0，无 OpenCL 支持，是 ARM 切入 GPU 市场的早期产品。

### 3.2 Midgard 架构（2013~2016）

**首代统一着色器架构**（Unified Shader），支持 OpenGL ES 3.0/3.1，大幅提升图形能力。

| 型号      | 核心数 | 工艺 | 典型平台                   |
| --------- | ------ | ---- | -------------------------- |
| Mali-T604 | 1~4    | 32nm | 三星 Exynos 5250           |
| Mali-T760 | 1~16   | 28nm | 三星 Exynos 5433（Note 4） |
| Mali-T860 | 1~2    | 28nm | 联发科 MT6755              |
| Mali-T880 | 1~16   | 16nm | 三星 Exynos 8890（S7）     |

> 特点：首次支持 OpenCL 1.1/1.2 通用计算，引入 AFBC（帧缓冲压缩），三管线（T6xx/T7xx/T8xx）逐步成熟。

### 3.3 Bifrost 架构（2016~2020）🔥

**Bifrost 是 Mali GPU 的第一次重大架构重构**，从 Midgard 的 VLIW（超长指令字）转向**标量/子句（Clause）执行模型**，显著提升能效比。

Bifrost 按性能层级分为三档：

| 层级       | 型号 | 核心数 | 工艺    | 特点                     |
| ---------- | ---- | ------ | ------- | ------------------------ |
| **入门**   | G31  | 1~2    | 28/22nm | 超小面积，替代 Mali-450  |
| **中端**   | G52  | 1~6    | 12/7nm  | 双纹理管线，面积效率极高 |
| **中高端** | G51  | 1~6    | 16/14nm | G71 架构精简版           |
| **高端**   | G71  | 4~32   | 16/10nm | 首代 Bifrost 旗舰        |
| **高端**   | G72  | 4~32   | 10nm    | G71 优化版，能效 +25%    |
| **旗舰**   | G76  | 4~20   | 7nm     | 引入双纹理单元，性能翻倍 |

**关键技术创新：**

- **标量子句执行**：取代 Midgard 的 VLIW，编译器更简单，实际利用率更高
- **基于 Warp 的调度**：每个 Warp 8 线程，接近桌面 GPU 的 SIMT 模型
- **Index-Driven Vertex Shading (IDVS)**：减少顶点重复处理
- **AFBC 1.2**：无损帧缓冲压缩，节省带宽

> Bifrost 是 Mali 架构现代化的转折点，至今仍有大量芯片使用（如 RK3568 的 G52）。

### 3.4 Valhall 架构（2019~至今）🔥

**Valhall 是第二代标量架构**，在 Bifrost 基础上大幅改进超标量执行引擎：

| 层级       | 型号            | 核心数 | 工艺  | 特点                                 |
| ---------- | --------------- | ------ | ----- | ------------------------------------ |
| **入门**   | G57（低端变体） | 1~2    | 28nm  | 低端低功耗                           |
| **中端**   | G68             | 1~6    | 6nm   | G78 精简版（仅 1 个 Shader Core）    |
| **中高端** | G57             | 1~6    | 7nm   | 首批 Valhall，被 Bifrost 版 G57 混淆 |
| **中高端** | G510            | 1~6    | 4nm   | 2021年发布，对标 Adreno 620          |
| **高端**   | G77             | 7~16   | 7nm   | 相比 G76 性能 +40%，能效 +30%        |
| **高端**   | G78             | 7~24   | 5nm   | G77 优化版，可堆更多核心             |
| **旗舰**   | G610            | 1~7    | 8/4nm | **RK3588 使用型号** ⭐               |
| **旗舰**   | G710            | 7~16   | 4nm   | 性能 +20%，支持光追                  |
| **旗舰**   | G715            | 7~16+  | 4nm   | 首款支持 VRS 的 Mali GPU             |

**关键技术创新：**

- **双倍超标量引擎**：每个执行引擎从 Bifrost 的 1 条流水线提升到 2 条
- **融合乘加（FMA）优化**：推理/图形负载效率大增
- **ASW（Asynchronous Space Warp）**：VR 场景帧合成加速
- **Command Stream Frontend (CSF)**：取代 Job Manager，更灵活的调度模型
- **Variable Rate Shading (VRS)**：G715 引入，分区域渲染节省算力

### 3.5 5th Gen 架构（2023~至今）

ARM 第五代 GPU 架构，首次推出 **Immortalis** 品牌，定位旗舰级支持硬件光线追踪。

| 型号            | 核心数 | 特点                              |
| --------------- | ------ | --------------------------------- |
| Immortalis-G720 | 10~16+ | 硬件光追，性能 +15%，带宽节省 40% |
| Mali-G720       | 6~10   | G720 无硬件光追版本               |
| Mali-G620       | 1~5    | 入门到中端的 5 代 GPU             |

> 特点：延迟顶点着色（DVS）、硬件光线追踪管线、更大寄存器堆。

---

## 四、RK3568 与 RK3588 的 GPU

### 4.1 RK3568

| 项目         | 详情                                                         |
| ------------ | ------------------------------------------------------------ |
| **GPU 型号** | **Mali-G52 MP2**（2 个 Shader Core）                         |
| **架构**     | Bifrost（第二款 Bifrost 中端系列）                           |
| **最大频率** | ~800 MHz                                                     |
| **API 支持** | OpenGL ES 1.1/2.0/3.0/3.1/3.2、OpenCL 2.0、Vulkan 1.0/1.1    |
| **性能水平** | 约 40~50 GFLOPS（FP32），适用于 UI 渲染、简单 3D、多媒体播放 |

> 定位：主流嵌入式应用，安防、平板、广告机等场景。与 RK3288 的 Mali-T764 相比，**G52 架构更先进**但核心数较少，综合图形性能相近，能效更高。

### 4.2 RK3588

| 项目               | 详情                                                      |
| ------------------ | --------------------------------------------------------- |
| **GPU 型号**       | **Mali-G610 MP4**（4 个 Shader Core）                     |
| **架构**           | Valhall（第三代 Valhall 架构）                            |
| **最大频率**       | ~850 MHz（可超频至 1GHz）                                 |
| **Shader Core 数** | 4                                                         |
| **执行引擎/核**    | 2 条（Valhall 双超标量）                                  |
| **API 支持**       | OpenGL ES 1.1/2.0/3.0/3.1/3.2、OpenCL 2.1、Vulkan 1.1/1.2 |
| **性能水平**       | 约 150~200 GFLOPS（FP32），接近入门级桌面 GPU             |

> 定位：RK3588 的 GPU 目前是 **Rockchip 平台最强 GPU**，可胜任 4K UI 渲染、中轻度 3D 游戏、AI 推理辅助（通过 OpenCL）、多屏异显等场景。

### 4.3 架构对比总结

```
RK3568                                     RK3588
Mali-G52 (Bifrost)                         Mali-G610 (Valhall)
    ↓ 架构跃升 2 代                              ↓
入门级 Bifrost 中端          →→→         旗舰级 Valhall 高端
1 条执行流水线/核                           2 条超标量执行引擎/核
2 Shader Core                              4 Shader Core
OpenCL 2.0                                OpenCL 2.1
Vulkan 1.1                                Vulkan 1.2
```

---

## 五、补充：ARM GPU 命名规则

ARM Mali GPU 的命名规则经历了几次变化：

| 时期      | 命名格式              | 示例                  |
| --------- | --------------------- | --------------------- |
| Utgard    | Mali-`数字`           | Mali-400 MP, Mali-450 |
| Midgard   | Mali-`T`+`数字`       | Mali-T860, Mali-T880  |
| Bifrost + | Mali-`G`+`数字`       | Mali-G52, Mali-G610   |
| 5th Gen   | Immortalis-`G`+`数字` | Immortalis-G720       |

- **T 系列** = Triple Pipeline（三管线架构）
- **G 系列** = Graphics（图形架构，不分管线代系）
- **MP** = Multi-Processor（多核心），如 "MP4" = 4 个 Shader Core
- **Immortalis** = 不死者（ARM 对旗舰带光追 GPU 的新品牌）
