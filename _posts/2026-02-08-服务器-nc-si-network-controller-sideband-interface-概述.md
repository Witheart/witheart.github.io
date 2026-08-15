---
title: "NC-SI(Network Controller Sideband Interface)概述"
date: 2026-02-08
last_modified_at: 2026-02-08
categories:
  - "服务器"
tags:
  - "服务器"
permalink: /服务器/nc-si-network-controller-sideband-interface-概述/
toc: true
---

概要：本文介绍了 NC-SI（网络控制器边带接口）的基本概念、工作原理以及其支持的电气接口和流量类型。NC-SI 作为 DMTF 定义的标准协议，使 BMC 能够利用主网卡的物理网络口进行带外管理通信，是服务器远程管理系统的关键技术之一。


## 1. 什么是 NC-SI  

NC-SI，全称为网络控制器边带接口（Network Controller Sideband Interface），是由分布式管理任务组（DMTF）定义的一种电气接口和协议。  

NC-SI 允许将基板管理控制器（BMC）连接到服务器计算机系统中的一个或多个网络接口控制器（NIC），从而实现带外系统管理。这使得 BMC 除了可以处理常规主机流量外，还可以使用 NIC 端口的网络连接来传输管理流量。

---

## 2. NC-SI 的传输接口  

NC-SI 定义的基于 **RMII** 的传输（RBT）接口基于 RMII 规范，并进行了一些修改，允许将多个网络控制器连接到单个 BMC。  

此外，NC-SI 还可以通过多种其他电气接口运行，包括：

- **SMBus**
- **PCI Express**（当使用管理组件传输协议 MCTP 时）

---

## 3. NC-SI 的流量类型  

NC-SI 定义了两种基本类型的流量：

- **直通流量**：指 BMC 与网络之间通过 NC-SI 接口交换的数据。
- **控制流量**：用于清点和配置网卡运行的各个方面，以及控制 NC-SI 接口。
