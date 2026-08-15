---
title: "M.2 Bkey PCIe 与 USB 复用设计"
date: 2026-03-25
last_modified_at: 2026-03-25
categories:
  - "硬件接口电路笔记"
tags:
  - "硬件接口电路笔记"
permalink: /硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/
toc: true
---

## 概述
- M.2 Bkey 可以接入PCIe信号、SATA信号、以及USB信号
- 接入PCIe信号和USB信号时，该槽可识别插入的模块类型，切换不同的信号
- 比如插入USB的4G模块（WWAN设备），那么就走USB信号
- 如果插入PCIe的设备，那么就出PCIe信号
![alt text](/assets/images/硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/PixPin_2026-03-25_10-56-07.png)

## 分析
- 下面这个切换芯片，根据Pin 6进行切换

![alt text](/assets/images/硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/PixPin_2026-03-25_11-11-52.png)

- Pin 6被外部上拉拉高，则切换为MUX-B，此时M.2 Bkey的MUXA就没有PCIe信号，只有USB信号了

![alt text](/assets/images/硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/PixPin_2026-03-25_11-16-03.png)

- 此时MUX-B 在Mkey槽和原来的2x信号共同组成了4x信号
![alt text](/assets/images/硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/PixPin_2026-03-25_11-18-02.png)

- 切换芯片的Pin6 是连接到Bkey的Pin21的，插入PCIe时，Pin21被拉到地，此时M.2 Bkey切换为PCIe信号
- 具体参考如下
`PCI_Express_M.2_Spec_Rev3.0_Ver1.2_06262019_NCB.pdf` P148
![alt text](/assets/images/硬件接口电路笔记/m-2-bkey-pcie-与-usb-复用设计/PixPin_2026-03-25_11-19-57.png)
