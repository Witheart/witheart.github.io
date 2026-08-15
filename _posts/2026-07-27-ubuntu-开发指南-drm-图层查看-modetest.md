---
title: "DRM 图层查看 —— modetest"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/drm-图层查看-modetest/
toc: true
---

## 用 `modetest` 扒开底层图层

`modetest` 可以直接读取内核显示驱动的真实状态，告诉你 VOP2 到底吐出了几个图层 (Plane)。

1. **安装工具：**

```bash
sudo apt update
sudo apt install libdrm-tests

```

2. **查看 Rockchip 的图层信息：**

```bash
modetest -M rockchip -p

```

_(注意：如果提示找不到命令，包名可能是 `drm-info`，可以用 `sudo apt install drm-info`，然后执行 `drm_info`)_

**怎么看结果：**
向下滚动，找到 **Planes** 这一节。仔细看每个 Plane 的 `type` 字段：

- 如果有 `type: Cursor`，说明 VOP2 硬件确实划出了一个专属的光标图层，你的系统具备硬件光标能力。
- 如果只有 `Primary`（主画面）和 `Overlay`（视频/3D叠加层），说明设备树里压根没开硬件光标，系统只能用软件光标。
- **判断当前谁在干活：** 找到 `Cursor` 那个 Plane，看它的 `CRTC_ID`。如果等于 0，说明当前没在使用硬件光标；如果有具体的数字（且和你的屏幕 CRTC ID 一致），说明硬件光标正在生效。

## 以RK3588为例

查找关键字Esmart0-win0、Cluster0-win0，RK3588的8个图层一版是平均分配给4个VP的：

1. **四个 Primary（主画面）图层：**

- Plane 57 (Esmart0-win0) -> `value: 1`
- Plane 79 (Esmart1-win0) -> `value: 1`
- Plane 101 (Esmart2-win0) -> `value: 1`
- Plane 123 (Esmart3-win0) -> `value: 1`

2. **四个 Overlay（叠加/视频）图层：**

- Plane 145 (Cluster0-win0) -> `value: 0`
- Plane 159 (Cluster1-win0) -> `value: 0`
- Plane 173 (Cluster2-win0) -> `value: 0`
- Plane 187 (Cluster3-win0) -> `value: 0`

![alt text](/assets/images/ubuntu-开发指南/drm-图层查看-modetest/PixPin_2026-07-27_10-26-31.png)
