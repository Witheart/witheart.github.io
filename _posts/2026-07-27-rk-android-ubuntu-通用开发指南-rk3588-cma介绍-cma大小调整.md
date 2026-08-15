---
title: "RK3588 CMA介绍，CMA大小调整"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk3588-cma介绍-cma大小调整/
toc: true
---

## 简介

CMA 全称是 **Contiguous Memory Allocator（连续内存分配器）**。在 Linux 系统里，它会在系统刚启动时，强行圈出一块连续的物理内存。平时这块内存可以像普通内存一样被系统拿去用，但是一旦某些硬件外设开口要，系统就必须立刻把里面的东西清空挪走，把这块连续的物理内存完完整整地交给硬件使用。

## 为什么 RK3588 离不开 CMA？

8K 硬件编解码的 VPU、6 TOPS 的 NPU、以及 RGA 图形加速引擎等这些模块在干重活（比如用 GStreamer 做 MPP 硬件解码、或者跑 AI 算法）的时候：**它们处理的大块数据缓冲，在物理内存上必须是连续的**。

如果系统跑久了，内存全变成了碎片，虽然总空间还剩很多，但找不出连在一起的大块内存。这时候如果没有 CMA 提前圈好的自留地，VPU 或者 NPU 申请内存就会直接失败，你的视频解码或硬件算法就会当场崩溃报错。

## 怎么查看和修改 CMA？

如果你在做定制化的 Ubuntu Base 固件，调整 CMA 是必修课。

### 1. 查看当前状态

在板子上直接运行：
`cat /proc/meminfo | grep -i "cma"`
你能看到 `CmaTotal`（总分配了多少）和 `CmaFree`（还剩多少可用）。

### 2. 怎么调整大小
```dts
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
index f638cd6b8..c3fe66143 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
@@ -17,13 +17,13 @@
 		#size-cells = <2>;
 		ranges;
 
-		/* Reserve 128MB memory for hdmirx-controller@fdee0000 */
-		cma {
-			compatible = "shared-dma-pool";
-			reusable;
-			reg = <0x0 (256 * 0x100000) 0x0 (128 * 0x100000)>;
-			linux,cma-default;
-		};
+		/* Reserve 384MB memory for hdmirx-controller@fdee0000 */
+        cma {
+            compatible = "shared-dma-pool";
+            reusable;
+            reg = <0x0 (256 * 0x100000) 0x0 (384 * 0x100000)>;
+            linux,cma-default;
+        };
 	};
 
 	es8316_sound: es8316-sound {

```
