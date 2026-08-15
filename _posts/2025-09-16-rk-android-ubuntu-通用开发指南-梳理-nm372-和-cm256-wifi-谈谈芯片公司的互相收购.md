---
title: "梳理 nm372 和 cm256 WiFi，谈谈芯片公司的互相收购"
date: 2025-09-16
last_modified_at: 2025-09-16
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/梳理-nm372-和-cm256-wifi-谈谈芯片公司的互相收购/
toc: true
---

`nm372` 和 `cm256` 是 **海华科技（AzureWave）** 推出的 WiFi 模组，分别采用了 **CYW43438（或 CYW43430）** 和 **CYW43455** 这两款无线芯片。那么，这些芯片究竟出自哪家公司？这背后涉及一连串复杂的历史收购与品牌变迁。

## 一、芯片组的来源追踪

从芯片型号来看，**CYW** 是 Cypress（赛普拉斯）的命名方式。然而，如果你深入查看驱动包、固件、VID（Vendor ID）等信息，就会发现远不止这么简单：

- **芯片型号**：CYW43438、CYW43455 —— 带有 "CYW" 前缀，明显为 Cypress 命名风格；
- **驱动包**：FAE 提供了两版驱动，一版命名为 Infineon 风格，另一版却是 Broadcom 风格；
- **固件名称**：对应的固件中也带有 `cyw` 字样；
- **SDIO VID（Vendor ID）**：通过 WikiDevi 查询发现，VID 为 `02d0`，这正是 **Broadcom** 的厂商 ID。

这就意味着：**芯片虽然被 Cypress 命名、Infineon 维护，但其底层的技术血统其实来自 Broadcom。**

## 二、从 Broadcom 到 Infineon：一连串的收购

### 1. Broadcom → Cypress

早在 2016 年，Broadcom 就将其无线 IoT 业务出售给了 Cypress。出售内容包括 Wi-Fi、蓝牙等连接类芯片。这也是为何原本属于 Broadcom 的芯片，如 CYW43438 等，后来被 Cypress 接手并重新命名。

参考：[Cypress Acquires Broadcom’s Wireless IoT Business](https://eepower.com/news/cypress-acquires-broadcoms-wireless-iot-business/#)

这一步收购，让 Cypress 成为 IoT 连网芯片的重要玩家，尤其是在嵌入式、消费电子和物联网设备领域。

### 2. Cypress → Infineon

2019 年，德国半导体巨头 **Infineon（英飞凌）** 宣布以 **每股 23.85 美元，总价 90 亿欧元** 收购 Cypress。交易于 2020 年初完成。


## 三、总结：一个芯片，三家公司

我们以 `CYW43438` 为例：

| 层级      | 公司     | 说明                                    |
| --------- | -------- | --------------------------------------- |
| 原始设计  | Broadcom | 最初由 Broadcom 开发，VID 为 02d0       |
| 命名/中继 | Cypress  | 收购后改为 CYW 前缀，自有命名体系       |
| 当前维护  | Infineon | 收购 Cypress 后，负责后续支持和驱动更新 |

这也是为什么你会在同一个芯片中，看到 Broadcom 的 VID、Cypress 的型号命名、Infineon 的驱动支持。
---

**参考资料：**

- [Cypress Acquires Broadcom’s Wireless IoT Business](https://eepower.com/news/cypress-acquires-broadcoms-wireless-iot-business/#)
- [Infineon 收购 Cypress 官方新闻稿](https://www.infineon.com)
- [WikiDevi.Wi-Cat.RU 芯片数据查询](https://wikidevi.wi-cat.ru/Main_Page)
