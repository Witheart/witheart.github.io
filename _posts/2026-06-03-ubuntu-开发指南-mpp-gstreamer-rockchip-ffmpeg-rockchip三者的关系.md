---
title: "MPP、gstreamer-rockchip、ffmpeg-rockchip三者的关系"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/mpp-gstreamer-rockchip-ffmpeg-rockchip三者的关系/
toc: true
---

在 RK3588 芯片里面，有一块专门负责视频编解码的物理硅片，叫做 **VPU (Video Processing Unit)**。这三者的关系，就是如何把这块物理 VPU 的能力发挥出来。


## 1. 核心本质：为什么会有这三个东西？

在嵌入式 Linux 平台（如 RK3588/RK3568）上，芯片内部通常包含一块专门用于视频编解码的物理硬件——**VPU（Video Processing Unit）**。

这三者的本质关系，是“底层硬件驱动”**与**“上层不同多媒体软件生态”之间的桥接关系。为了让庞大的开源多媒体框架（GStreamer 或 FFmpeg）能够调动这块物理 VPU 真正跑起硬件加速，就必须有相应的“翻译官”将标准指令转化为私有硬件指令。
![alt text](/assets/images/ubuntu-开发指南/mpp-gstreamer-rockchip-ffmpeg-rockchip三者的关系/PixPin_2026-06-03_14-23-39.png)

---

## 2. 逐一拆解：各自的定位与角色

### ① MPP (Media Process Platform) —— 硬件的“直系控制层”

- **定位**：瑞芯微（Rockchip）官方提供的底层硬件视频编解码驱动库（核心产物为 `librockchip_mpp.so`）。
- **特性**：它是唯一能直接与 RK3588 VPU 硅片进行深度交互（分配 DMA 连续物理内存、下发寄存器指令、处理硬件中断）的软件层。
- **局限性**：它使用的是瑞芯微高度定制的私有 API。开源世界里的通用播放器、流媒体服务器默认根本不认识它。

- 开发参考：https://github.com/rockchip-linux/mpp/blob/develop/doc/Rockchip_Developer_Guide_MPP_CN.md
- 仓库：https://github.com/rockchip-linux/mpp
- 参考：《Rockchip_Developer_Guide_MPP_CN.pdf》

### ② gstreamer-rockchip —— GStreamer 阵营的“专属翻译官”

- **定位**：基于 GStreamer 框架标准的中间件/插件库。
- **特性**：由于系统级应用往往采用 GStreamer 构建复杂的音视频管道（Pipeline），这个插件库的作用就是把底层的 MPP 能力包装成 GStreamer 的标准插件（如 `mppvideodec`、`mpph264enc`）。
- **工作流**：GStreamer 调度器下发标准解码任务 ➡️ `gst-mpp` 插件接收并翻译成 MPP API ➡️ MPP 驱动 VPU 干活 ➡️ 返回标准的 `video/x-raw` 画面帧给管道下游。

- 仓库：SDK中external/gstreamer-rockchip
- 参考《Rockchip_User_Guide_Linux_Gstreamer_CN.pdf》

### ③ ffmpeg-rockchip —— FFmpeg 阵营的“专属翻译官”

- **定位**：开源界大佬 Nyanmisaka（喵斯卡）等人维护的 FFmpeg 定制分支补丁集。
- **特性**：FFmpeg 是另一个与 GStreamer 齐名的多媒体巨头框架。这个仓库的代码将瑞芯微的 MPP 接口完美缝合进了 FFmpeg 的内核逻辑中，注册了硬件编解码器（如 `h264_rkmpp`、`hevc_rkmpp`）。
- **应用场景**：常用于轻量级命令行转码工具、NAS 影音媒体库（如 Jellyfin/Plex 的硬件转码功能），以及基于 FFmpeg 库二次开发的 C/C++ 软件。

- 仓库：https://github.com/nyanmisaka/ffmpeg-rockchip

---

## 3. 架构调用关系图

无论上层多媒体业务是用什么语言、什么框架编写的，最终落实到芯片硬件加速时，都会收束到底层的 MPP 驱动上。其层级结构如下：

```text
                  【 上层业务应用 / 命令行测试工具 】
                                  │
      (路线A：基于流媒体管道设计)       (路线B：基于音视频文件/转码处理)
                 /                                    \
    【 GStreamer 多媒体框架 】                 【 FFmpeg 多媒体框架 】
     (标准插件体系：gst-launch 等)               (标准编解码体系：ffmpeg 命令等)
                 │                                      │
       [ gstreamer-rockchip ]                 [ ffmpeg-rockchip ]
(提供 mppvideodec 等 GStreamer 插件)       (提供 h264_rkmpp 等 FFmpeg 编解码器)
                 \                                     /
                  \                                   /
                   +------->【 MPP 底层驱动库 】<-------+
                            (librockchip_mpp.so)
                                      │
                          【 芯片物理硬件 (VPU) 】
                           (真正的硬解/硬编执行者)

```

---

## 4. 横向对比与工程选型建议

| 维度           | gstreamer-rockchip                                                                           | ffmpeg-rockchip                                                                    |
| -------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **依附框架**   | GStreamer                                                                                    | FFmpeg                                                                             |
| **底层依赖**   | Rockchip MPP                                                                                 | Rockchip MPP                                                                       |
| **架构特点**   | 管道式（Pipeline）设计，各个插件像乐高积木一样拼接。                                         | 集成式设计，强大的全能型音视频处理利器。                                           |
| **零拷贝支持** | 极佳。能通过 `rkximagesink` 或 `waylandsink` 与瑞芯微硬件图层（RGA/DRM）完美打通零拷贝链路。 | 一般。通常解码后需将数据回读到内存进行封装，更侧重纯转码场景。                     |
| **适用场景**   | 实时 RTSP/WebRTC 监控拉流播控、带屏幕的高端显示终端、零拷贝图层叠加、复杂流媒体路由。        | NAS 服务端媒体转码（Jellyfin）、批量视频文件压缩、离线视频切片、纯网络推流服务器。 |

**一句话总结：**
MPP 是负责干活的核心基石；`gstreamer-rockchip` 和 `ffmpeg-rockchip` 分别代表了开源多媒体领域的两座大山，它们的存在是为了让不同技术栈的开发者，都能以自己最熟悉的“框架语言”来调用这块芯片的强悍算力。
