---
title: "BGA layout"
date: 2025-10-13
last_modified_at: 2025-10-13
categories:
  - "PCB layout"
tags:
  - "PCB layout"
permalink: /pcb-layout/bga-layout/
toc: true
---

概要：本文详细介绍了BGA（Ball Grid Array）封装的布线设计方法，包括外层与中间层焊盘的扇出、盘中孔与狗骨结构的应用、PGD焊球识别与通道预留策略，以及电源供电路径的优化建议，辅以多张示意图辅助理解。


## 1. 外侧第一、二层焊盘

### 1.1 第一层信号  
- 最外圈的焊盘，可以直接水平或垂直拉出。

### 1.2 第二层信号  
- 次外圈的焊盘，通常以 45 度角或弧形从第一圈焊盘之间的“走廊”引出。  
- 扇出时，**不要用信号线把所有的通道都堵死**。

![外层焊盘扇出示意](/assets/images/pcb-layout/bga-layout/image.png)

### 1.3 识别 PGD 焊球  
- 在 BGA 球阵图中找到电源（Power）和地（Ground）焊球。

### 1.4 预留通道  
- 扇出时，有意地将 PGD 焊球旁边的过孔位置空出来，或者只从一侧走线，从而形成一个连续的、通往 BGA 内部的“通道”。
- 此通道后续将用于放置**大型的电源/地过孔**，为内核供电。

---

## 2. 中间层焊盘

### 2.1 盘中孔 Via-In-Pad  
- 直接在焊盘上打孔换层。  
- 与普通过孔的区别：
  - 盘中孔在孔内塞树脂，烤干后磨平，再进行电镀面铜工艺。
  - 若未处理塞孔，可能导致焊接面积小、孔内藏锡珠或爆油现象，进而造成虚焊。

![盘中孔示意图 1](/assets/images/pcb-layout/bga-layout/image-2.png)  
![盘中孔示意图 2](/assets/images/pcb-layout/bga-layout/image-3.png)

### 2.2 狗骨 Dog-bone  
- 一种常见的 BGA 焊球扇出方式，适用于标准过孔工艺。

![狗骨结构示意图](/assets/images/pcb-layout/bga-layout/image-1.png)

---

## 3. BGA 区域划分与扇出策略

### 3.1 四分区域扇出  
- 将 BGA 上下左右分成四个独立区域，过孔扇出呈现四个独立的扇形区域。  
- 从中间进行分割，分别往四边布线。

![四象限扇出示意图](/assets/images/pcb-layout/bga-layout/image-4.png)

---

## 4. 内层电源设计

### 4.1 中间十字通道  
- 利用中间的十字通道进行电源传输。

![电源通道示意图](/assets/images/pcb-layout/bga-layout/image-5.png)

### 4.2 规则放置过孔  
- 有规则地放置过孔，可使各种电源拥有尽量大的覆铜通道，有效提高电源供电质量。

![规则过孔排布](/assets/images/pcb-layout/bga-layout/PixPin_2025-10-13_10-44-22.png)
