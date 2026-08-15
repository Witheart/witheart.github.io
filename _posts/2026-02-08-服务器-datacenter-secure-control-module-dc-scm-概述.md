---
title: "Datacenter-Secure Control Module (DC-SCM)概述"
date: 2026-02-08
last_modified_at: 2026-02-08
categories:
  - "服务器"
tags:
  - "服务器"
permalink: /服务器/datacenter-secure-control-module-dc-scm-概述/
toc: true
---

## 参考链接
- 官网 Server/MHS/DC-SCM-Specs-and-Designs：https://www.opencompute.org/w/index.php?title=Server/MHS/DC-SCM-Specs-and-Designs
- DC-SCM规范链接：https://www.opencompute.org/documents/ocp-dc-scm-rev2-2-ver1-0-pdf
- 戴尔 PowerEdge R770 安装和服务手册：https://www.dell.com/support/manuals/zh-cn/poweredge-r770/r770_ism_pub/datacenter-secure-control-module-dc-scm?guid=guid-99b3b498-ad9b-4a56-aa52-bd704f25a396&lang=zh-cn
- HPE Cray XD675 Server User Guide：https://support.hpe.com/hpesc/public/docDisplay?docId=sd00004985en_us&page=GUID-944385CE-B036-4896-BE08-4D0363CEA69E.html&docLocale=en_US

## 概述
DC-SCM（Datacenter-ready Secure Control Module，数据中心安全控制模块）是开放计算项目（OCP）硬件管理项目组提出的首个数据中心安全管理单元模块化的通用规范。
DC-SCI（Datacenter-ready Secure Control Interface，数据中心就绪的安全控制接口），指的是DC-SCM与HPM之间的连接器接口。

**核心概念**：
- DC-SCM 通过将常见的服务器管理、安全和控制功能从主板分离，转移到较小的通用外形模块中，实现计算单元与安全管理单元的解耦。该模块包含之前主板上容纳的所有固件状态，如 BMC（基板管理控制器）、TPM（可信平台模块）、Boot Flash、ROT（可信根）等。

![alt text](/assets/images/服务器/datacenter-secure-control-module-dc-scm-概述/PixPin_2026-02-08_17-14-19.png)
![alt text](/assets/images/服务器/datacenter-secure-control-module-dc-scm-概述/PixPin_2026-02-08_17-15-15.png)

## 框架
![alt text](/assets/images/服务器/datacenter-secure-control-module-dc-scm-概述/PixPin_2026-02-08_17-26-54.png)
![alt text](/assets/images/服务器/datacenter-secure-control-module-dc-scm-概述/PixPin_2026-02-08_17-17-19.png)
- 上图为一框架示例，可以看到，右侧的DC-SCM集成了AST2500BMC相关的安全模块，通过DC-SCI与南桥芯片组进行通信。

**主要特点**：

1. **模块化设计**：尺寸通常为 90mm×120.4mm，通过连接器与主板相连
2. **功能集成**：集成了管理（BMC 功能）、安全（ROT 等）和控制三大关键功能
3. **接口标准化**：支持 PCIe、USB3.0、I3C 等通用接口，DC-SCM 2.0 还引入了 LTPI（低电压差分信号通道协议和接口）

**核心优势**：

- **降低研发成本**：简化主板设计，支持使用成本更低的板材，减少重复验证时间
- **加速产品迭代**：实现 BMC/ROT 与 CPU 更新周期的解耦，支持跨平台兼容
- **提升可扩展性**：支持多节点服务器设计，增强数据中心平台的可扩展性和使用寿命
- **简化部署**：CPU/存储器板只需基本计算元件和高速存储器，管理功能独立开发

**应用价值**：DC-SCM 解决了数据中心平台多元化趋势下的兼容性问题，支持 Intel、AMD、ARM、Power 等多种平台共存，同时满足不同形态产品（单路、双路、四路等）的安全管理需求。目前已有浪潮信息、Intel、Ampere、Google、Microsoft 等公司参与 DC-SCM 2.0 规范的制定与完善。
