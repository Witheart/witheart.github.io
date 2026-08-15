---
title: "Gstreamer工具以及MPP插件"
date: 2026-06-03
last_modified_at: 2026-06-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gstreamer工具以及mpp插件/
toc: true
---

本文来源于野火教程：https://doc.embedfire.com/linux/rk356x/quick_start/zh/latest/lubancat_rk_software_hardware/software/gstreamer/gstreamer.html#

## 1 Gstreamer简介

GStreamer是一个开源的多媒体框架，用于构建音频和视频处理应用程序。它提供了丰富的功能，可以处理各种格式的媒体流，包括录制、播放、编辑和流式传输。通过其插件架构，GStreamer支持许多编解码器和容器格式，使开发者能够轻松地构建复杂的多媒体应用，适用于桌面、嵌入式系统和服务器环境。

## 2 Gstreamer常⽤命令

**2.1 gst-launch-1.0**
`gst-launch-1.0` 是GStreamer框架中的一个命令行工具，用于快速创建和测试多媒体管道。它允许用户构建数据流管道，以处理音频和视频数据，进行实时流处理、编码、解码、转码等操作。简单示例如下：

```bash
#使⽤videotestsrc⽣成⼀段视频，并使⽤xvimagesink显⽰
gst-launch-1.0 videotestsrc ! xvimagesink
```

**2.2 gst-play-1.0**
`gst-play-1.0` 是GStreamer的一个简单媒体播放器工具，旨在快速播放音频和视频文件。它支持多种媒体格式，并能够使用GStreamer 的插件架构进行扩展。通过命令行参数，用户可以轻松地播放本地文件或流式媒体，非常适合测试和演示多媒体功能。

```bash
# 播放test.mp4，并通过xvimagesink显⽰
gst-play-1.0 test.mp4 --videosink=xvimagesink
```

**2.3 gst-inspect-1.0**
`gst-inspect-1.0` 是GStreamer 的一个工具，用于查看GStreamer 中可用的插件、元素和它们的属性。通过这个工具，用户可以获取有关特定插件的信息，例如支持的格式、属性、信号和功能。

```bash
# 不带任何参数，列出所有插件
gst-inspect-1.0

# 列出xvimagesink插件的所有信息
gst-inspect-1.0 xvimagesink
```

## 3 Gstreamer常用插件

**3.1 Source**
GStreamer的Source插件用于生成和提供媒体数据流。它们可以从不同的数据源读取音频或视频，比如文件、网络、设备等。常见的Source插件包括文件源（如`filesrc`）、网络源（如`tcpserversrc`）、设备源（如`v4l2src`），这些插件允许开发者灵活地构建多媒体管道，以满足不同的应用需求。通过配置Source插件，用户可以轻松获取和处理多种类型的媒体数据。

- **3.1.1 filesrc**
  从⽂件读取数据，示例如下：

```bash
#创建/tmp/test
echo 666 > /tmp/test
#读取文件数据到/tmp/test2
gst-launch-1.0 filesrc location=/tmp/test ! filesink location=/tmp/test2
#查看
cat /tmp/test2
```

- **3.1.2 videotestsrc**
  ⽣成视频数据，示例如下：

```bash
# 使⽤默认格式输出视频
gst-launch-1.0 videotestsrc ! xvimagesink
# 使⽤指定格式输出视频
gst-launch-1.0 videotestsrc ! "video/x-raw,width=1920,height=1080,format=(string)NV12" ! xvimagesink
```

- **3.1.3 v4l2src**
  从摄像头获取视频数据，示例如下：

```bash
#如果不指定摄像头编号，默认使用系统的第一个视频设备/dev/video0
gst-launch-1.0 v4l2src ! video/x-raw,width=1920,height=1080,format=NV12 ! xvimagesink
#如果需要使用特定的摄像头，可以通过device属性指定设备，例如
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,width=1920,height=1080,format=NV12 ! xvimagesink
```

- **3.1.4 rtspsrc和rtspclientsink**
  rtspsrc和rtspclientsink是GStreamer中用于处理RTSP流的两个不同元素。
  - **rtspsrc**：这是一个源元素，用于接收RTSP流。它可以从RTSP服务器拉取音视频流，并将其传递给管道的下游元素进行处理。
  - **rtspclientsink**：这是一个接收元素，用于将处理后的音视频流发送到RTSP服务器。
    简单来说，rtspsrc用于接收流，rtspclientsink用于发送流。
    系统默认没有安装插件，需要进行安装：
  ```bash
  #安装插件
  sudo apt install gstreamer1.0-rtsp
  ```

**3.2 Sink**
GStreamer的Sink插件用于接收和处理媒体数据流，通常用于输出到不同的目标，例如文件、音频设备、视频显示等。常见的Sink插件包括文件接收器（如`filesink`）、音频输出（如`alsasink`）、视频显示（如`ximagesink`）。这些插件使开发者能够灵活地将媒体数据导出到所需的格式或设备，方便实现多媒体播放和录制功能。

- **3.2.1 filesink**
将收到的数据保存为⽂件，示例如下：

```bash
gst-launch-1.0 filesrc location=/tmp/test ! filesink location=/tmp/test2
```

- **3.2.2 fakesink**
将收到的数据全部丢弃，示例如下：
```bash
gst-launch-1.0 filesrc location=/tmp/test ! fakesink
```

- **3.2.3 xvimagesink**
视频Sink，接收视频并显⽰，使⽤X11接口实现，示例如下：

```bash
gst-launch-1.0 videotestsrc ! xvimagesink
```

- **3.2.4 kmssink**
视频Sink，接收视频并显⽰，使⽤kms接口实现，需要独占硬解图层，示例如下：
```bash
gst-launch-1.0 videotestsrc ! kmssink
# 常⽤命令
connector-id #指定屏幕
plane-id #指定硬件图层
render-rectangle #指定渲染范围
```

- **3.2.5 waylandsink**
  视频Sink，接收视频并显⽰，使⽤wayland接口实现，示例如下：

```bash
gst-launch-1.0 videotestsrc ! waylandsink
```

- **3.2.6 rkximagesink**
视频Sink，接收视频并显⽰，使⽤drm接口实现零拷⻉等功能，性能较好，但需要独占硬解图层。示例如下：
```bash
gst-launch-1.0 videotestsrc ! rkximagesink
```

- **3.2.7 fpsdisplaysink**
视频Sink，接收视频并统计帧率，同时会将视频中转⾄下⼀级Sink显⽰，示例如下：

```bash
#⽇志等级为TRACE(7)即可查看实时帧率，设置为DEBUG(5)则只显⽰最⼤/最小帧率
GST_DEBUG=fpsdisplaysink:7 gst-play-1.0 --flags=3 --videosink="fpsdisplaysink \
video-sink=xvimagesink signal-fps-measurements=true text-overlay=false \
sync=false" test.mp4
```

## 4 Rockchip MPP插件

基于MPP的硬件编解码插件，基于Gstreamer原有GstVideoDecoder类和GstVideoEncoder类开发。

- 解码⽀持的格式有JPEG，MPEG，VP8，VP9，H264，H265。
- 编码⽀持的格式有JPEG，H264，H265，VP8。

默认系统已经安装mpp插件：

```bash
#查看mpp插件
gst-inspect-1.0 | grep mpp

rockchipmpp:  mpph264enc: Rockchip Mpp H264 Encoder
rockchipmpp:  mpph265enc: Rockchip Mpp H265 Encoder
rockchipmpp:  mppjpegdec: Rockchip's MPP JPEG image decoder
rockchipmpp:  mppjpegenc: Rockchip Mpp JPEG Encoder
rockchipmpp:  mppvideodec: Rockchip's MPP video decoder
rockchipmpp:  mppvp8enc: Rockchip Mpp VP8 Encoder
rockchipmpp:  mppvpxalphadecodebin: VP8/VP9 Alpha Decoder
typefindfunctions: audio/x-musepack: mpc, mpp, mp+
```

**4.1 gstmppdec说明**
包含插件mppvideodec，mppjpegdec，主要属性说明：

- **rotation**： 旋转⻆度，默认为0°，可选0°，90°，180°，270°。
- **width / height**： 宽度/高度，默认为0，不进⾏缩放。
- **crop-rectangle**： 裁剪，使⽤⽅式为`<x, y, w, h>`，即裁剪源`<x, y>`为起点，宽⾼为`w * h`的图像送⾄下级。
- **arm-afbc**： AFBC压缩格式，默认不开启，开启后可以降低DDR带宽占⽤，部分芯⽚解码效率会有明显提⾼。
- **format**： 输出格式，默认为0 “auto”，不进⾏格式转换。
- **fast-mode**： 开启MPP Fast Mode，可以使部分解码流程并⾏，提升解码效率。默认开启。
- **ignore-error**： 忽略MPP解码错误，强制输出解码帧。默认开启。

**4.2 gstmppenc说明**
包含插件mpph264enc，mppvp8enc，mppjpegenc等。主要属性说明：

- **width / height**： 宽度/高度，默认为0，不进⾏缩放。
- **rc-mode**： 码率控制模式，可选VBR，CBR和Fixed QP。
- **bps / bps-max / bps-min**： ⽬标码率 / 最⾼码率 / 最低码率（在Fixed QP模式下忽略）。
- **gop**： Group Of Picture，即两I帧的间隔。
- **level**： 表⽰ SPS 中的 level_idc 参数。
- **profile**： 表⽰ SPS 中的 profile_idc 参数。
- **rotation**： 旋转输⼊buffer，可选0°，90°，180°，270°。

**4.3 播放视频**

```bash
#获取音频播放设备
aplay -l
#播放并指定音频设备
gst-play-1.0 --flags=3 --videosink="fpsdisplaysink video-sink=xvimagesink signal-fps-measurements=true text-overlay=false sync=false" \
--audiosink="alsasink device=hw:1,0" test.mp4

```

**4.4 多路视频播放**

```bash
# 使⽤xvimagesink的render-rectangle指定不同的渲染位置
gst-launch-1.0 filesrc location=/home/cat/test.mp4 ! parsebin ! mppvideodec ! \
xvimagesink render-rectangle='<0,0,400,400>' &
gst-launch-1.0 filesrc location=/home/cat/test.mp4 ! parsebin ! mppvideodec ! \
xvimagesink render-rectangle='<0,500,400,400>' &

```

**4.5 编码预览**
使⽤tee插件，将摄像头采集的数据拷贝为两路，其中⼀路送⾄mpph264enc进⾏编码，而后送⾄filesink保存⽂件。 另⼀路送⾄autovideosink显⽰。注意在tee插件后需要加上queue插件，会对数据进行缓存，防⽌出现卡死的情况。

```bash
#编码预览，并将视频流保存到/home/cat/out.h264
gst-launch-1.0 v4l2src ! 'video/x-raw,width=1920,height=1080,format=NV12' ! tee name=tv ! queue ! \
mpph264enc ! 'video/x-h264' ! h264parse ! 'video/x-h264' ! filesink \
location=/home/cat/out.h264 tv. ! queue ! autovideosink

```

**4.6 拆分码流**
部分插件如qtdemux，会出现多个Source Pad的情况，如⾳频流、视频流、字幕流等，则可以将该插件命名，并提取出需要的码流。
如将qtdemux命名为qt，则`qt.audio_0`就是第⼀个⾳频流，`qt.video_0`就是第⼀个视频流，可提取后分别做处理。同样建议在分流后加上queue插件。不同插件码流命名⽅式不同，可以通过gst-inspect命令查看命名⽅式，或直接使⽤类似`qt. ！ queue ! mppvidedec` 的形式进⾏构建。
