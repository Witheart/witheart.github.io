---
title: "分立DC-DC layout 注意"
date: 2026-01-10
last_modified_at: 2026-01-10
categories:
  - "PCB layout"
tags:
  - "PCB layout"
permalink: /pcb-layout/分立dc-dc-layout-注意/
toc: true
---

1. 输入电容Cin和输出电容Cout应分别布置在Vin引脚、Vout引脚与DC/DC的GND引脚之间，并尽可能减小Vin、Vout与DC/DC地之间的环路面积，以降低电源的EMI干扰，从而显著提升DC/C电路的稳定性。
2. 此外，在输入电容Cin、输出电容Cout及DC/C的GND连接处，应尽量多地设置过孔，建议每个网络至少使用4个0503尺寸的过孔。若Vin或Vout电源走线涉及层间切换，也需在换层位置附近增加足够数量的过孔，同样建议不少于4个0503过孔。
3. 同时，功率电感应尽可能靠近DC/DC芯片放置，相关走线应力求粗短；反馈（FB）电阻的接地端则应远离可能引入噪声的干扰源。
![alt text](/assets/images/pcb-layout/分立dc-dc-layout-注意/PixPin_2025-12-17_18-28-30.png)
