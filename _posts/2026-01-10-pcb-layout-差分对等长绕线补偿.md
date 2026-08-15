---
title: "差分对等长绕线补偿"
date: 2026-01-10
last_modified_at: 2026-01-10
categories:
  - "PCB layout"
tags:
  - "PCB layout"
permalink: /pcb-layout/差分对等长绕线补偿/
toc: true
---

## 基本原则
- 核心是要尽早在不等长处绕线
![alt text](/assets/images/pcb-layout/差分对等长绕线补偿/PixPin_2025-12-16_18-17-29.png)

- 首选在“短端”加一段连续的、形状良好的蛇形（serpentine）来补偿长度，而不是把补偿拆成很多零散的小段散布在整条线上
- 尽量避免过长或过密的蛇形

> 参考：https://www.intel.com/content/www/us/en/docs/programmable/683864/current/pcb-traces.html

> Minimize serpentine layouts, making them transparent to the signal, because serpentine layouts introduce discontinuity to the differential channel. You can minimize them by making electrical lengths shorter than the signal rise time. In general, keep the serpentine routing length <100 mils with arcs and bends of 45 degrees, for 112G PAM4, keep the serpentine routing length <70mils. A loosely coupled differential pair is less affected by serpentine lines.
尽量减少蛇形布线，使其对信号透明，因为蛇形布线会给差分通道引入不连续性。可以通过使电气长度小于信号上升时间来减少蛇形布线。通常，蛇形布线长度应小于 100 mil，弧度和弯曲角度应为 45 度；对于 112G PAM4，蛇形布线长度应小于 70 mil。松耦合差分对受蛇形布线的影响较小。

- 蛇形绕线示例
![alt text](/assets/images/pcb-layout/差分对等长绕线补偿/PixPin_2025-12-16_18-34-15.png)


## 参考链接
一些参考：
https://resources.altium.com/p/differential-pair-length-matching-best-practices-signal-integrity
https://www.ti.com/lit/an/spraar7j/spraar7j.pdf
