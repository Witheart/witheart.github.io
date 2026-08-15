---
title: "浏览器性能测试指南"
date: 2026-05-28
last_modified_at: 2026-05-28
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/浏览器性能测试指南/
toc: true
---

## 第一步：确认是否开启了 GPU 硬件加速

1. **如果使用 Chromium / Chrome：**

- 在地址栏输入 `chrome://gpu`。
- 查看 **Graphics Feature Status** 列表。如果 `Canvas`、`Rasterization`、`Video Decode`、`WebGL` 等显示为 `Software only. Hardware acceleration disabled`，说明没有调用 GPU。
- **如何强制开启：** 可以在终端中携带参数启动浏览器尝试开启：

```bash
chromium-browser --ignore-gpu-blocklist --enable-gpu-rasterization --enable-zero-copy

```

2. **如果使用 Firefox：**

- 在地址栏输入 `about:support`。
- 往下滚动到“图形（Graphics）”部分，查看“合成（Compositing）”是否为 `WebRender`，以及 WebGL 是否正常启用。

---

## 第二步：使用专业的浏览器性能测试网站

确认 GPU 状态后，可以使用以下业界公认的基准测试（Benchmark）网站来量化显示性能：

### 1. 图形与渲染性能专测

- **MotionMark (browserbench.org/MotionMark)**
- **侧重点：** 专门针对浏览器**图形显示能力**的权威测试（由苹果 WebKit 团队主导开发）。
- **测试内容：** CSS 动画、SVG 渲染、Canvas 绘图、DOM 几何变换等。
- **指标：** 最终会给出一个综合得分，分数越高，代表浏览器绘制图形的帧率越稳定、性能越强。

- **WebGL Aquarium (webglsamples.org/aquarium/aquarium.html)**
- **侧重点：** **WebGL 3D 渲染**性能。
- **测试内容：** 满屏游动的 3D 鱼。
- **指标：** 可以手动调节左上角的鱼的数量（比如从 500 调到 5000），观察右上角的 **FPS（每秒帧数）**。如果鱼很多但 FPS 还能保持在 30-60，说明 GPU 硬件加速表现优异。

### 2. 综合前端性能与流畅度测试

- **Speedometer 3.0 (browserbench.org/Speedometer)**
- **侧重点：** 衡量浏览器在复杂 Web 应用中的**交互响应速度**。
- **测试内容：** 模拟用户在网页上进行的大量操作（如点击、输入、列表滚动），涉及大量 DOM 树操作。它能很好地反映用户日常浏览网页的真实卡顿感。

- **Basemark Web 3.0 (web.basemark.com)**
- **侧重点：** 全面性测试，包含极重的图形负载。
- **测试内容：** 结合了底层 JavaScript 运算和高强度的 WebGL 1.0/2.0 图形渲染。

### 3. 纯 JavaScript 引擎计算性能（影响页面加载速度）

- **JetStream 2 (browserbench.org/JetStream)**
- **侧重点：** 纯看 CPU 和浏览器的 JS V8 引擎解析能力。
- **指标：** 分数越高，说明网页脚本执行越快。

---

## 第三步：辅助监控手段

1. **监控 CPU 使用率：**
   在终端运行 `htop`。如果在跑 MotionMark 或 WebGL 鱼缸时，CPU 四个核心全都满载（100%），且帧率很低，说明 GPU 加速大概率没有生效，是 CPU 在进行软渲染。
2. **开启浏览器自带的 FPS 实时监控：**

- Chrome/Chromium：按 `F12` 打开开发者工具 -> 按 `Ctrl + Shift + P` -> 输入 `Show rendering` -> 勾选 `Frame Rendering Stats`。网页左上角会出现一个实时的 FPS 监控浮窗。


## 测试结果
### RK3568
- 浏览器开启硬件加速
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/浏览器性能测试指南/截图_2026-05-28_18-49-56.png)

- 浏览器未开启硬件加速
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/浏览器性能测试指南/截图_2026-05-28_18-38-05.png)

### x86
- 配置
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/浏览器性能测试指南/PixPin_2026-05-28_18-53-31.png)

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/浏览器性能测试指南/PixPin_2026-05-28_18-54-01.png)
