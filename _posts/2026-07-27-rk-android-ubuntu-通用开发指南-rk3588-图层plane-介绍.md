---
title: "RK3588 图层plane 介绍"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk3588-图层plane-介绍/
toc: true
---

## 参考
- 《Rockchip_Developer_Guide_DRM_Display_Driver_CN》3.2.4.2 指定图层分配策略
- https://github.com/ChisBread/linux-orangepi/commit/63eb2dd31f886dcdb3f8d4d595c41f2a12afce2f#diff-7121a0a1d045d232dce8fd3ad243a33ada0b276b0d2f8061e501a9d0f49f08c8

## 1. 图层的本质：实打实的物理硅片

在 RK3588 的世界里，Plane 绝对不是什么软件抽象出来的数据结构，而是**SOC 内部实打实的物理硬件电路**。

你可以把显示器想象成一个画板，而图层就是一张张可以独立渲染、最后由硬件瞬间合成的透明画纸。每一个物理图层模块内部，都集成了自己专属的硬件单元：

- **独立 DMA 通道：** 专门负责去系统主存或连续物理内存（CMA）里搬运像素数据。
- **硬件缩放器 (Scaler)：** 负责画面的放大缩小，完全不占 CPU 算力。
- **色彩空间转换 (CSC)：** 负责把 YUV 视频流硬解成显示器需要的 RGB 格式。

既然是物理硬件，那就意味着它的数量是定死的，且在同一时刻，一个图层只能给一个显示端口（Video Port，简称 VP）干活。

---

## 2. VOP2 的“八大金刚”：Esmart 与 Cluster

RK3588 的 VOP2 硬件内部直接焊死了 8 个物理图层。为了应对不同的显示需求，这 8 个图层被划分成了两大阵营，分工极其明确：

### Esmart 图层（共 4 个：Esmart0 ~ Esmart3）

- **特性：** 支持复杂的缩放、多级 Alpha 透明度混合，对五花八门的 RGB 和像素格式支持得极好。
- **DRM 角色：** 在 Linux 底层，它们通常被注册为 **Primary（主画面）** 图层。桌面环境（如 Mutter、Xorg）就是靠它们来绘制桌面背景、状态栏和应用程序窗口的。

### Cluster 图层（共 4 个：Cluster0 ~ Cluster3）

- **特性：** 数据吞吐带宽极大，专为高分辨率（4K/8K）、多窗口拼接以及 YUV 视频直通设计。
- **DRM 角色：** 通常被注册为 **Overlay（叠加层）**。当系统播放硬件解码的视频时，视频画面会作为一个补丁，直接由 Cluster 图层盖在 Esmart 画好的桌面之上，全程零 CPU 拷贝。

---

## 3. Video Port (VP) 与图层分配策略

RK3588 支持多屏异显，内部有 `vp0` 到 `vp3` 共 4 个视频输出通道（可以分别绑定到 HDMI、eDP、MIPI 等物理接口）。但这 8 个图层该怎么分给这 4 个 VP 呢？

这就全靠咱们在设备树（DTS）里立规矩了。通过 `rockchip,plane-mask` 属性，我们可以精准控制每个屏幕能调用哪些图层资源。

> 举个简单的分配例子：
> `rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER0 | 1 << ROCKCHIP_VOP2_ESMART0)>;`
> 这句话就是在硬件初始化时，给 `vp0` 通道下达死命令：你只能使用 `CLUSTER0` 和 `ESMART0` 这两个图层，其他的资源你碰都不能碰。

这种排他性的分配策略，保证了多屏同时输出时，底层 DMA 带宽不会因为抢夺资源而崩溃。

RK3588 常用配置：kernel/arch/arm64/boot/dts/rockchip/rk3588-evb.dtsi
```dts
&vp0 {
	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER0 | 1 << ROCKCHIP_VOP2_ESMART0)>;
	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART0>;
};

&vp1 {
	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER1 | 1 << ROCKCHIP_VOP2_ESMART1)>;
	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART1>;
};

&vp2 {
	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER2 | 1 << ROCKCHIP_VOP2_ESMART2)>;
	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART2>;
};

&vp3 {
	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER3 | 1 << ROCKCHIP_VOP2_ESMART3)>;
	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART3>;
};
```

---

## 4. 桌面环境的硬伤与光标 (Cursor) 突围

在 Android 系统的 HWC（Hardware Composer）下，这套机制跑得非常顺滑。但在纯正的 Linux 桌面环境下，经常会遇到一个恶心的问题：**鼠标光标狂闪、撕裂甚至消失**。

这就要扯到图层的类型定义了。Linux DRM 定义了三种图层类型：`Primary=1`、`Overlay=0`、`Cursor=2`。
默认情况下，Rockchip 的驱动**只注册 Primary 和 Overlay，根本不注册专属的 Cursor 图层**。

当老派的 Linux 桌面环境（比如 GNOME）向底层讨要 `Cursor` 图层来画鼠标时，发现根本没有。于是它要么退化成 CPU 的软件渲染，要么强行占用一个 Overlay。只要桌面负荷一高，主画面和光标的 V-Sync 刷新周期对不齐，画面当场撕裂。

**破局之道：**
咱们可以直接在 DTS 对应的 `vp` 节点下，强制征用一个 Cluster 图层，通过添加 `cursor-win-id` 属性，给它打上“专属鼠标”的思想钢印。

```dts
cursor-win-id = <ROCKCHIP_VOP2_CLUSTER0>;

```

这就等于在物理层面定死了规矩：`CLUSTER0` 从今往后就是 `type=2` 的专属光标层。桌面管理器拿到这个标准的独立硬件通道后，鼠标就会变得极致丝滑，完全不和主桌面抢夺渲染资源。当然，代价是当前屏幕会少一个用于视频硬解的 Overlay 叠加层。

参考修改如下：
```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/rk3588-evb.dtsi b/kernel/arch/arm64/boot/dts/rockchip/rk3588-evb.dtsi
index e5214182f..0c7e34ec9 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/rk3588-evb.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/rk3588-evb.dtsi
@@ -1208,19 +1208,23 @@
 &vp0 {
 	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER0 | 1 << ROCKCHIP_VOP2_ESMART0)>;
 	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART0>;
+	cursor-win-id = <ROCKCHIP_VOP2_CLUSTER0>;
 };
 
 &vp1 {
 	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER1 | 1 << ROCKCHIP_VOP2_ESMART1)>;
 	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART1>;
+	cursor-win-id = <ROCKCHIP_VOP2_CLUSTER1>;
 };
 
 &vp2 {
 	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER2 | 1 << ROCKCHIP_VOP2_ESMART2)>;
 	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART2>;
+	cursor-win-id = <ROCKCHIP_VOP2_CLUSTER2>;
 };
 
 &vp3 {
 	rockchip,plane-mask = <(1 << ROCKCHIP_VOP2_CLUSTER3 | 1 << ROCKCHIP_VOP2_ESMART3)>;
 	rockchip,primary-plane = <ROCKCHIP_VOP2_ESMART3>;
+	cursor-win-id = <ROCKCHIP_VOP2_CLUSTER3>;
 };

```
**这种修改方式有一定的问题，在单个屏幕上正常，但是光标在多个屏幕跨屏后光标会消失，根据官方文档是需要安装SDK中的libdrm-cursor包。**
