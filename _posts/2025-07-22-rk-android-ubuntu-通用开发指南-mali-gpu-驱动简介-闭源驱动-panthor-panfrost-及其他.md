---
title: "Mali GPU 驱动简介：闭源驱动、Panthor、Panfrost 及其他"
date: 2025-07-22
last_modified_at: 2025-07-22
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/mali-gpu-驱动简介-闭源驱动-panthor-panfrost-及其他/
toc: true
---

## 一、Mali GPU 驱动全景

ARM Mali GPU 的驱动程序分为两大阵营：**ARM 官方闭源驱动** 和 **社区开源驱动**。两者实现方式、架构差异巨大，适用于不同场景。

```
Mali GPU 驱动生态
│
├── ARM 官方闭源驱动 (DDK)
│   ├── rXpX 版本（旧版命名）
│   └── Bifrost/Valhall DDK（新版命名）
│
└── 社区开源驱动
    ├── Lima       → Utgard 架构 (Mali-400/450)
    ├── Panfrost   → Midgard + Bifrost 架构
    └── Panthor    → Valhall + 5th Gen 架构
```

---

## 二、ARM 官方闭源驱动 (DDK)

### 2.1 概述

ARM 向芯片厂商分发 **GPU DDK（Driver Development Kit）**，芯片厂商（Rockchip、MediaTek 等）集成到 BSP 后下发给设备厂商。最终用户拿到的就是一个闭源的内核模块 `mali.ko` + 用户空间的 `libGLES_mali.so` / `libMali.so`。

### 2.2 版本命名

| 时期 | 命名格式        | 适用范围                | 示例                     |
| ---- | --------------- | ----------------------- | ------------------------ |
| 旧版 | r`X`p`X`        | Utgard、早期 Midgard    | r6p0, r12p0, r28p0       |
| 新版 | 对应 GPU 架构名 | Midgard/Bifrost/Valhall | Bifrost DDK, Valhall DDK |

> Rockchip SDK 常见闭源驱动版本：r12p0~r18p0（适用 Mali-T860/T760），后续逐步更新至 G 系列对应版本。

### 2.3 架构组成

```
┌─────────────────────────────────────────┐
│          用户空间 (Userspace)             │
│  libGLESv1_CM.so, libGLESv2.so           │
│  libEGL.so, libOpenCL.so                 │
│  libMali.so (厂商整合库)                  │
│  gralloc, hwcomposer *.so (Android)      │
├─────────────────────────────────────────┤
│          内核空间 (Kernel)                │
│  mali.ko (mali_kbase.ko 或 mali.ko)     │
│  与 Linux DRM/KMS 不直接交互             │
└─────────────────────────────────────────┘
```

### 2.4 特点

| 优点                                 | 缺点                                        |
| ------------------------------------ | ------------------------------------------- |
| 性能最优，ARM 官方优化               | **代码不开放**，无法自行调试修改            |
| OpenGL ES / Vulkan / OpenCL 功能完整 | 内核模块与主线 Linux 脱节，**内核升级困难** |
| 芯片厂商提供技术支持                 | 不同内核版本需要对应 DDK 版本               |
| 稳定性经过验证                       | 安全漏洞无法自行修复                        |

---

## 三、社区开源驱动

### 3.1 Lima — Utgard 架构开源驱动

| 项目          | 详情                                                 |
| ------------- | ---------------------------------------------------- |
| **适用 GPU**  | Mali-200, Mali-400, Mali-450, Mali-470               |
| **维护方**    | 社区 + Mesa 项目                                     |
| **主线状态**  | 内核模块已合入 Linux 主线（`drivers/gpu/drm/lima/`） |
| **Mesa 支持** | OpenGL ES 2.0 完整实现                               |
| **现状**      | 成熟稳定，已替代闭源驱动                             |

> 对于 RK3066、全志 A20 等老平台，Lima 是唯一实际可用的主线驱动方案。

### 3.2 Panfrost — Midgard + Bifrost 开源驱动 ⭐

| 项目            | 详情                                                           |
| --------------- | -------------------------------------------------------------- |
| **适用 GPU**    | Mali-T6xx~T8xx（Midgard）、Mali-G31/G52/G71/G72/G76（Bifrost） |
| **维护方**      | Collabora 主导，社区贡献                                       |
| **主线状态**    | 内核模块已合入 Linux 主线（`drivers/gpu/drm/panfrost/`）       |
| **Mesa 支持**   | OpenGL ES 2.0/3.0/3.1，OpenGL 3.3+                             |
| **RK 平台适配** | **RK3568 (Mali-G52) 可用** ✅                                  |

**Panfrost 架构**：

```
Panfrost 由两部分组成：
┌────────────────────────────────┐
│  内核模块: panfrost.ko          │  ← 标准 DRM 驱动，合入主线
│  位于 drivers/gpu/drm/panfrost/ │
├────────────────────────────────┤
│  用户空间: Mesa Panfrost        │  ← Gallium3D 驱动
│  位于 src/gallium/drivers/panfrost/ │
└────────────────────────────────┘
```

**关键特点**：

- 遵循 Linux DRM/KMS 框架，可与 Wayland/DRM 应用无缝集成
- **不需要特定内核版本**，随主线 Linux 更新
- 性能逐步逼近闭源驱动（部分场景差距约 10~20%）

### 3.3 Panthor — Valhall + 5th Gen 开源驱动 🔥

| 项目            | 详情                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------- |
| **适用 GPU**    | Mali-G57/G68/G77/G78/**G610**/G710/G715（Valhall）、Immortalis/Mali-G720/G620（5th Gen） |
| **维护方**      | Collabora + ARM 官方参与                                                                 |
| **主线状态**    | 内核模块已合入 Linux 6.9+（`drivers/gpu/drm/panthor/`）                                  |
| **Mesa 支持**   | OpenGL ES 2.0/3.0/3.1/3.2，Vulkan 1.0+（honeykrisp）                                     |
| **RK 平台适配** | **RK3588 (Mali-G610) 可用** ✅                                                           |

**为什么需要 Panthor（而非 Panfrost 续命）？**

| 对比        | Panfrost          | Panthor                            |
| ----------- | ----------------- | ---------------------------------- |
| 目标架构    | Midgard + Bifrost | **Valhall + 5th Gen**              |
| 调度模型    | Job Manager       | **CSF（Command Stream Frontend）** |
| FW 交互     | 传统 FW 接口      | **全新 FW 协议（CSF Firmware）**   |
| VirtIO 支持 | 无                | 原生支持 GPU 虚拟化                |
| 用户态驱动  | 直接操作 IOCTL    | 通过 Kernel 驱动 → FW 调度         |

> Valhall 架构引入了 CSF 固件调度模型，与 Bifrost 的 Job Manager 完全不同，因此需要从头设计的 **Panthor** 而不是在 Panfrost 上修修补补。

**Panthor 的命名**：Panthor 取自《指环王》中的 **潘托尔（Panthor）**——与 Panfrost（潘霜）、Lima（利马）一样，延续了 Mali 开源驱动以《指环王》角色命名的传统。

---

## 四、驱动对比总览

| 驱动         | 类型 | 适用架构          | 适用 RK 芯片         | 主线内核       | Mesa 支持         | 成熟度     |
| ------------ | ---- | ----------------- | -------------------- | -------------- | ----------------- | ---------- |
| **Lima**     | 开源 | Utgard            | RK3066 等老平台      | ✅ 已合入      | GLES 2.0          | 成熟       |
| **Panfrost** | 开源 | Midgard + Bifrost | **RK3568** (G52) ✅  | ✅ 已合入      | GLES 3.1          | 成熟       |
| **Panthor**  | 开源 | Valhall + 5th Gen | **RK3588** (G610) ✅ | ✅ 6.9+        | GLES 3.2 / Vulkan | 快速发展中 |
| **ARM DDK**  | 闭源 | 全系列            | 全系列 RK            | ❌ 需 BSP 内核 | GLES/Vulkan/OCL   | 成熟       |

---

## 五、Rockchip 平台选型建议

```
RK3568 (Mali-G52, Bifrost)
    ├── 主线内核 + Panfrost     ← 推荐（开源、主线化）
    ├── BSP 内核 + 闭源 DDK      ← 传统方案（功能全、需旧内核）
    └── Panthor ❌              ← Bifrost 架构不支持 Panthor

RK3588 (Mali-G610, Valhall)
    ├── Linux 6.9+ + Panthor    ← 未来趋势（ARM 官方也在参与！）
    ├── BSP 内核 + 闭源 DDK      ← 当前主流（功能最全）
    └── Panfrost ❌             ← Valhall 架构不支持 Panfrost
```

> **关键趋势**：ARM 官方已开始参与 Panthor 开发并开放 GPU 固件，未来主线内核 + Panthor 将成为 Mali GPU 的推荐方案，逐步减少对闭源 DDK 的依赖。

---

## 六、其他相关开源项目

| 项目                  | 说明                                             |
| --------------------- | ------------------------------------------------ |
| **Mesa honeykrisp**   | Panthor 对应的 Vulkan 开源驱动（Mesa 内）        |
| **libdrm**            | Panfrost/Panthor 依赖的 DRM 用户态库             |
| **kbase**             | ARM 闭源 DDK 内核模块的代码名（`mali_kbase.ko`） |
| **RKDrm**             | Rockchip 闭源 kernel 使用的特定 DRM 分支         |
| **mali-csf-firmware** | Panthor 需要的 CSF 固件二进制包                  |

---

## 七、参考链接

- [Panfrost 项目主页](https://docs.mesa3d.org/drivers/panfrost.html)
- [Panthor 内核文档](https://docs.kernel.org/gpu/panfrost.html)（同 Panfrost 文档，但有 Valhall 相关说明）
- [Collabora Blog — Panfrost/Panthor 开发日志](https://www.collabora.com/news-and-blog/)
