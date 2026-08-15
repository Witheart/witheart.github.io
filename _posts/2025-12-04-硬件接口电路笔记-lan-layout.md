---
title: "LAN layout"
date: 2025-12-04
last_modified_at: 2025-12-04
categories:
  - "硬件接口电路笔记"
tags:
  - "硬件接口电路笔记"
permalink: /硬件接口电路笔记/lan-layout/
toc: true
---

- RK3588 官方设计要求

| 参数                           | 要求                                       |
| :----------------------------- | :----------------------------------------- |
| 走线阻抗                       | 单端 50ohm ±10%                            |
| (TXD{0-3}, TXEN) to TXCLK 等长 | < 120 mil                                  |
| (RXD{0-3}, RXDV) to RXCLK 等长 | < 120 mil                                  |
| 走线长度                       | < 5 inches                                 |
| RGMII 信号线之间间距 (airgap)  | 建议 ≥ 2 倍 RGMII 线宽                     |
| RGMII 与其它信号间距 (airgap)  | 建议 3 倍 RGMII 线宽，至少 2 倍 RGMII 线宽 |
