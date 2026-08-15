---
title: "Android 音频相关命令"
date: 2025-12-25
last_modified_at: 2025-12-25
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-音频相关命令/
toc: true
---

概要：本文整理了在 Android 系统中查看和操作音频设备的常用命令，包括声卡与 PCM 设备的查看、音频控制项的读取与配置等，适用于调试与开发场景下的音频相关操作。  


## 1. 查看声卡与 PCM 设备  

### 1.1 查看所有声卡（硬件设备）  

使用以下命令查看系统中所有的声卡信息：  
```bash
cat /proc/asound/cards
```

示例输出：  
```
 0 [rockchiprk809co]: rockchip_rk809- - rockchip,rk809-codec
                      rockchip,rk809-codec
 1 [rockchiphdmi   ]: rockchip_hdmi - rockchip,hdmi
                      rockchip,hdmi
 2 [Camera         ]: USB-Audio - USB 2.0 Camera
                      Generic USB 2.0 Camera at usb-fd800000.usb-1.1, high speed
```

---

### 1.2 查看所有 PCM 设备（音频流设备）  

使用以下命令查看播放/录音通道信息：  
```bash
cat /proc/asound/pcm
```

示例输出：  
```
00-00: fe410000.i2s-rk817-hifi rk817-hifi-0 : fe410000.i2s-rk817-hifi rk817-hifi-0 : playback 1 : capture 1  
01-00: rockchip,hdmi i2s-hifi-0 : rockchip,hdmi i2s-hifi-0 : playback 1  
02-00: USB Audio : USB Audio : capture 1  
```

> 提示：一个声卡可以对应多个 PCM 设备。

### 1.3 查看 ALSA 驱动创建的声音设备文件
```bash
ls /dev/snd/
```

示例输出：
```
controlC0  controlC1  controlC2  pcmC0D0c  pcmC1D0c  pcmC1D0p  pcmC2D0p  timer
```
> control是控制设备，分别对应三块逻辑声卡，以p结尾是播放设备，以c结尾是录音设备。

---

## 2. 查看与配置音频控制项  

### 2.1 查看声卡的音频控制项  

#### 查看第 0 个声卡的控制项  
```bash
tinymix -D 0
```

示例输出：  
```
Mixer name: 'rockchip,rk809-codec'  
Number of controls: 2  

ctl     type    num     name                                     value  
0       ENUM    1       Playback Path                            OFF  
1       ENUM    1       Capture MIC Path                         Main Mic  
```

> 说明：音频输出路径是关闭的，麦克风输入是开启的。

---

### 2.2 手动配置音频路径  

- **开启麦克风输入**  
```bash
tinymix -D 0 "Capture MIC Path" "Main Mic"
```

- **关闭麦克风输入**  
```bash
tinymix -D 0 "Capture MIC Path" "MIC OFF"
```

---

### 2.3 查看第 2 个声卡的控制项  

```bash
tinymix -D 2
```

示例输出：  
```
Mixer name: 'USB 2.0 Camera'  
Number of controls: 5  

ctl     type    num     name                                     value  
0       INT     2       Capture Channel Map                      0 0  
1       BOOL    1       Mic Capture Switch                       On  
2       INT     1       Mic Capture Volume                       12  
3       BOOL    1       Loudness                                 On  
4       BOOL    1       Keep Interface                           Off  
```

---

### 2.4 查看输入的数值范围  

```bash
tinymix -D 2 "Mic Capture Volume"
```

示例输出：  
```
Mic Capture Volume: 12 (dsrange 0->24)
```

---
