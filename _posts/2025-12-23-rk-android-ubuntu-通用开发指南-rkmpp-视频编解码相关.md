---
title: "RKMPP 视频编解码相关"
date: 2025-12-23
last_modified_at: 2025-12-23
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rkmpp-视频编解码相关/
toc: true
---

## MPP简介
MPP（Media Process Platform）全称为媒体处理平台，它是 RK 提供的一个用于进行视频硬编解码的库。通过 MPP，我们就可以使用 RK 芯片的 VPU（Video Process Unit，视频处理单元）对我们的视频进行硬件编解码，从而减少 CPU 的负担，加快编解码速度。

架构如下
```
                +---------------------------------------+
                |                                       |
                |      OpenMax / gstreamer / libva      |
                |                                       |
                +---------------------------------------+

            +-------------------- MPP ----------------------+
            |                                               |
            |   +-------------------------+    +--------+   |
            |   |                         |    |        |   |
            |   |        MPI / MPP        |    |        |   |
            |   |   buffer queue manage   |    |        |   |
            |   |                         |    |        |   |
            |   +-------------------------+    |        |   |
            |                                  |        |   |
            |   +-------------------------+    |        |   |
            |   |                         |    |        |   |
            |   |          codec          |    |  OSAL  |   |
            |   |    decoder / encoder    |    |        |   |
            |   |                         |    |        |   |
            |   +-------------------------+    |        |   |
            |                                  |        |   |
            |   +-----------+ +-----------+    |        |   |
            |   |           | |           |    |        |   |
            |   |  parser   | |    HAL    |    |        |   |
            |   |  recoder  | |  reg_gen  |    |        |   |
            |   |           | |           |    |        |   |
            |   +-----------+ +-----------+    +--------|   |
            |                                               |
            +-------------------- MPP ----------------------+

                +---------------------------------------+
                |                                       |
                |                kernel                 |
                |       RK vcodec_service / v4l2        |
                |                                       |
                +---------------------------------------+
```

## FFmpeg
RK应该是向FFmpeg提交过一些代码了，但是后来mpp库被指出其中一些代码抄袭了FFmpeg的代码，然后把许可证由LGPL改为Apache/MIT。
详见
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/rkmpp-视频编解码相关/PixPin_2025-12-23_10-40-56.png)
https://x.com/FFmpeg/status/1761005762233413654

https://github.com/rockchip-linux/mpp/issues/530

FFmpeg的代码应该是合不进去了，在上文提到的框架中，GStreamer一栏本来是有FFmpeg的，后面被RK删除了：
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/rkmpp-视频编解码相关/PixPin_2025-12-23_10-42-59.png)

不过，我找到了另一个定制的库，貌似是个人开发者开发的，而不是rk官方的
https://github.com/nyanmisaka/ffmpeg-rockchip

- 确认FFmpeg是否支持rkmpp解码器
```bash
$ ffmpeg -decoders | grep "rkmpp"

 V..... h264_rkmpp           h264 (rkmpp) (codec h264)
 V..... hevc_rkmpp           hevc (rkmpp) (codec hevc)
 V..... vp8_rkmpp            vp8 (rkmpp) (codec vp8)
 V..... vp9_rkmpp            vp9 (rkmpp) (codec vp9)
```

- 测试解码
```bash
ffmpeg -y -c:v h264_rkmpp -i /usr/local/test.mp4 -an output.yuv

ffmpeg version 4.4.2-0ubuntu0.22.04.2firefly1 Copyright (c) 2000-2021 the FFmpeg developers
  built with gcc 11 (Ubuntu 11.4.0-1ubuntu1~22.04)
  configuration: --prefix=/usr --extra-version=0ubuntu0.22.04.2firefly1 --toolchain=hardened --libdir=/usr/lib/aarch64-linux-gnu --incdir=/usr/include/aarch64-linux-gnu --arch=arm64 --enable-gpl --disable-stripping --enable-gnutls --enable-ladspa --enable-libaom --enable-libass --enable-libbluray --enable-libbs2b --enable-libcaca --enable-libcdio --enable-libcodec2 --enable-libdav1d --enable-libflite --enable-libfontconfig --enable-libfreetype --enable-libfribidi --enable-libgme --enable-libgsm --enable-libjack --enable-libmp3lame --enable-libmysofa --enable-libopenjpeg --enable-libopenmpt --enable-libopus --enable-libpulse --enable-librabbitmq --enable-librubberband --enable-libshine --enable-libsnappy --enable-libsoxr --enable-libspeex --enable-libsrt --enable-libssh --enable-libtheora --enable-libtwolame --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx265 --enable-libxml2 --enable-libxvid --enable-libzimg --enable-libzmq --enable-libzvbi --enable-lv2 --enable-omx --enable-openal --enable-opencl --enable-opengl --enable-sdl2 --enable-pocketsphinx --enable-librsvg --enable-libdc1394 --enable-libdrm --enable-libiec61883 --enable-chromaprint --enable-frei0r --enable-libx264 --enable-libdrm --disable-librga --enable-rkmpp --enable-version3 --disable-libopenh264 --disable-vaapi --disable-vdpau --disable-decoder=h264_v4l2m2m --disable-decoder=vp8_v4l2m2m --disable-decoder=mpeg2_v4l2m2m --disable-decoder=mpeg4_v4l2m2m --enable-shared
  libavutil      56. 70.100 / 56. 70.100
  libavcodec     58.134.100 / 58.134.100
  libavformat    58. 76.100 / 58. 76.100
  libavdevice    58. 13.100 / 58. 13.100
  libavfilter     7.110.100 /  7.110.100
  libswscale      5.  9.100 /  5.  9.100
  libswresample   3.  9.100 /  3.  9.100
  libpostproc    55.  9.100 / 55.  9.100
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from '/usr/local/test.mp4':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2avc1mp41
    creation_time   : 1970-01-01T00:00:00.000000Z
    encoder         : Lavf52.64.2
  Duration: 00:00:10.00, start: 0.000000, bitrate: 6836 kb/s
  Stream #0:0(und): Video: h264 (Constrained Baseline) (avc1 / 0x31637661), yuv420p, 1920x1080 [SAR 1:1 DAR 16:9], 6664 kb/s, 24 fps, 30 tbr, 30 tbn, 60 tbc (default)
    Metadata:
      creation_time   : 1970-01-01T00:00:00.000000Z
      handler_name    : VideoHandler
      vendor_id       : [0][0][0][0]
  Stream #0:1(und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 166 kb/s (default)
    Metadata:
      creation_time   : 1970-01-01T00:00:00.000000Z
      handler_name    : SoundHandler
      vendor_id       : [0][0][0][0]
Stream mapping:
  Stream #0:0 -> #0:0 (h264 (h264_rkmpp) -> rawvideo (native))
Press [q] to stop, [?] for help
[h264_rkmpp @ 0x55b5cbb530] Decoder noticed an info change (1920x1080), format=0
Output #0, rawvideo, to 'output.yuv':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2avc1mp41
    encoder         : Lavf58.76.100
  Stream #0:0(und): Video: rawvideo (I420 / 0x30323449), yuv420p(progressive), 1920x1080 [SAR 1:1 DAR 16:9], q=2-31, 746496 kb/s, 30 fps, 30 tbn (default)
    Metadata:
      creation_time   : 1970-01-01T00:00:00.000000Z
      handler_name    : VideoHandler
      vendor_id       : [0][0][0][0]
      encoder         : Lavc58.134.100 rawvideo
frame=  300 fps= 35 q=-0.0 Lsize=  911250kB time=00:00:10.00 bitrate=746496.0kbits/s dup=61 drop=1 speed=1.18x
video:911250kB audio:0kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: 0.000000%

```

## GStreamer
目前，RK应该是将开发重心转到了GStreamer上，详见
https://github.com/rockchip-linux/mpp

## 一些使用方式
来自：https://yadom.in/archives/rk3588-startup.html
如何确认自己能使用 mpp 的插件？
```bash
gst-inspect-1.0 |grep mpp
typefindfunctions: audio/x-musepack: mpc, mpp, mp+
rockchipmpp:  mppjpegdec: Rockchip's MPP JPEG image decoder
rockchipmpp:  mppvideodec: Rockchip's MPP video decoder
rockchipmpp:  mppjpegenc: Rockchip Mpp JPEG Encoder
rockchipmpp:  mppvp8enc: Rockchip Mpp VP8 Encoder
rockchipmpp:  mpph265enc: Rockchip Mpp H265 Encoder
rockchipmpp:  mpph264enc: Rockchip Mpp H264 Encoder
```

如何使用 gstreamer 编解码（桌面环境下调用），会打开一个窗口播放视频
```bash
gst-launch-1.0 filesrc location=test.mp4 ! qtdemux ! queue ! h264parse ! mppvideodec ! videoconvert ! autovideosink
```

编码（这个没有测试过）
```bash
gst-launch-1.0 videotestsrc ! mpph265enc ! filesink location=test.mp4
```
