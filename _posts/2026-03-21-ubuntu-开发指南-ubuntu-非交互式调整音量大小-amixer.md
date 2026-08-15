---
title: "Ubuntu 非交互式调整音量大小 amixer"
date: 2026-03-21
last_modified_at: 2026-03-21
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-非交互式调整音量大小-amixer/
toc: true
---

- 列出 ALSA 音频系统中所有可用的简单控制接口
```bash
amixer scontrols

```
运行该命令后，会得到一个类似 Simple mixer control 'Master'的列表。列表中每个控制项的名称（如 'Master'）非常重要，是后续使用 amixer sset或 amixer cset等命令来具体调节音量、开关静音时所必须指定的标识符。

输出如下
```bash
# amixer scontrols
Simple mixer control 'Playback Polarity',0
Simple mixer control 'ADC',0
Simple mixer control 'ADC PGA',0
Simple mixer control 'ADC PGA Gain',0
Simple mixer control 'ADC Ramp Rate',0
Simple mixer control 'ALC',0
Simple mixer control 'ALC Capture Recovery Level',0
Simple mixer control 'ALC Capture Target Level',0
Simple mixer control 'ALC Capture Winsize',0
Simple mixer control 'CROSSTALK1',0
Simple mixer control 'CROSSTALK2',0
Simple mixer control 'DAC',0
Simple mixer control 'DAC Ramp Rate',0
Simple mixer control 'DRC Recovery Level',0
Simple mixer control 'DRC Target Level',0
Simple mixer control 'DRC Winsize',0
Simple mixer control 'HPL',0
Simple mixer control 'HPR',0
Simple mixer control 'HPVol SPKVol',0
Simple mixer control 'SPKL',0
Simple mixer control 'SPKR',0
```

- 调整麦克风输入大小，尝试使用`ADC`这个标识符
```bash
amixer get ADC
```
如果可以调整，将会看到取值范围

- 调整为255
```bash
amixer set ADC 255
```

- 另一个调整耳机音量的示例
```bash
# amixer get 'HPVol SPKVol'
Simple mixer control 'HPVol SPKVol',0
  Capabilities: enum
  Items: 'HPVOL: HPL+HPL, SPKVOL: HPL+HPL' 'HPVOL: HPL+HPR, SPKVOL: HPL+HPR' 'HPVOL: HPL+HPL, SPKVOL: SPKL+SPKR' 'HPVOL: HPL+HPR, SPKVOL: SPKL+SPKR'
  Item0: 'HPVOL: HPL+HPL, SPKVOL: HPL+HPL'
# amixer get HPL
ixer get SPKLSimple mixer control 'HPL',0
  Capabilities: pvolume pvolume-joined
  Playback channels: Mono
  Limits: Playback 0 - 191
  Mono: Playback 191 [100%] [0.00dB]
```

可以看到，HPVol SPKVol不是音量控制：它是一个路由选择开关，用于决定将哪个音频信号（HPL/HPR/SPKL/SPKR）发送到耳机和扬声器。它本身不调节音量大小。真正的音量控制是 HPL。

降低音量：
```bash
amixer set HPL 153
```
