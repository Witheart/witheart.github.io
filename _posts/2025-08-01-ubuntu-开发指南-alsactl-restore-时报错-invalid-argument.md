---
title: "alsactl restore 时报错 Invalid argument"
date: 2025-08-01
last_modified_at: 2025-08-01
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/alsactl-restore-时报错-invalid-argument/
toc: true
---

## 问题描述

依据以下方法，设置并保存音量

- 打开 alsamixer 并设置音量

```sh
alsamixer
```

- 调整后 ESC 退出，然后保存当前设置

```sh
alsactl store -f /var/lib/alsa/asound.state
```

- 尝试执行下面的命令，加载保存的设置

```sh
alsactl restore -f /var/lib/alsa/asound.state
```

- 出现报错

```bash
alsactl: set_control:1461: Cannot write control '2:0:0:ALC Capture Target Volume:0' : Invalid argument
```

## 问题排查与解决过程

### **第一步：定位核心问题**

首先我们注意到系统报错信息：
`Cannot write control 'ALC Capture Target Volume' : Invalid argument`

这个错误提示很明确地告诉我们：
- 问题类型：参数值错误（不是权限、路径或服务问题）
- 可能原因：设置的参数值超出了硬件支持范围

### **第二步：确定设备位置**

从错误信息中的设备编号`2:0:0:...`可以推测：
- 系统可能存在多个声卡设备
- 问题出现在编号为2的声卡上

### **第三步：验证硬件支持范围**

我们首先尝试获取硬件实际支持的参数范围：

```bash
amixer -c 2 cget name='ALC Capture Target Volume'
```

但意外发现系统提示`Invalid card number.`，说明声卡编号可能有误。

于是我们查看系统中实际存在的声卡设备：

```bash
cat /proc/asound/cards
```

输出结果显示：
```
0 [rockchipes8316 ]: rockchip-es8316 - rockchip-es8316
                     rockchip-es8316
1 [rockchiphdmi0  ]: rockchip-hdmi0 - rockchip-hdmi0
                     rockchip-hdmi0
```

发现实际只有编号0和1的声卡，没有编号2的设备。

### **第四步：获取关键参数**

我们改用正确的设备编号0进行查询：

```bash
amixer -c 0 cget name='ALC Capture Target Volume'
```

输出结果显示：
```
values=11
min=0,max=10  # 硬件支持范围
```

这揭示了问题的根源：
1. 硬件限制：最大支持值为10
2. 当前配置值：11（超出硬件支持范围）
3. 错误原因：硬件拒绝执行超出范围的参数值

### **第五步：实施解决方案**

将参数值调整为硬件支持范围内的数值：

```bash
amixer -c 0 cset name='ALC Capture Target Volume' 5
```

这样就解决了参数值超出硬件限制的问题。

也可以打开alsamixer，直接调整ALC Capture Target，然后保存，再用alsactl restore。
