---
title: "分割端接 split termination"
date: 2025-11-24
last_modified_at: 2025-11-24
categories:
  - "硬件接口电路笔记"
tags:
  - "硬件接口电路笔记"
permalink: /硬件接口电路笔记/分割端接-split-termination/
toc: true
---

概要：本文介绍了差模信号终端匹配中常见的两种方式，重点对比了标准终端电阻与分割端接（Split Termination）在共模噪声处理方面的区别，并通过CAN总线电路示例分析RC滤波的截止频率计算。


## 1. 差模信号终端匹配方式解析  

![alt text](/assets/images/硬件接口电路笔记/分割端接-split-termination/image.png)

左图的 100 欧姆电阻用于终端匹配，但是在实际应用中，更常用右边这种方式。

### 1.1 差模信号下的等效性  

对于差模的信号来说，两种方式的终端电阻是等效的。

### 1.2 共模噪声下的差异  

- 左图：由于是一个单一的 100 欧姆电阻，在共模噪声（两路信号同步变化）作用下，电阻两端无法产生电压差，因此无法形成电流路径，相当于噪声可以直接进入终端。
- 右图：共模噪声在两个并联的 50 欧姆电阻路径中间通过电容泄放到地，相当于形成一个 RC 滤波器，有效抑制共模干扰。

---

## 2. CAN 电路中的 Split Termination 应用  

### 2.1 电容作用分析  

如下图所示的 CAN 总线电路中，使用了 3.3nF 的电容作为中点电容：

![alt text](/assets/images/硬件接口电路笔记/分割端接-split-termination/image-1.png)

### 2.2 截止频率计算  

根据 RC 滤波器的公式计算其截止频率：

\[
f_c = \frac{1}{2\pi RC} = \frac{1}{2\pi \times 50 \times 3.3 \times 10^{-9}} \approx 643\, \text{kHz}
\]

问：为什么使用该电容？普通CAN速率有1Mbps，CAN FD为8Mbps。
---

## 3. 参考  

https://community.silabs.com/s/share/a5U1M000000ko0gUAA/timing-101-the-case-of-the-split-termination?language=en_US
https://electronics.stackexchange.com/questions/590942/purpose-of-split-termination-in-differential-pairs
