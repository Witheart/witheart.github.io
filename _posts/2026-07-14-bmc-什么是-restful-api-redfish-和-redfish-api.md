---
title: "什么是 RESTful API、Redfish 和 Redfish API？"
date: 2026-07-14
last_modified_at: 2026-07-14
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/什么是-restful-api-redfish-和-redfish-api/
toc: true
---

## 1. BMC (Baseboard Management Controller)

**基板管理控制器**是服务器主板上的一个独立微控制器（通常带有自己的独立 ARM 处理器、内存和网络接口）。

- **核心作用：** 它独立于服务器的主 CPU 和操作系统运行。只要服务器插上电源（哪怕处于关机状态），BMC 就在工作。
- **功能：** 它通过底层的总线（如 I2C、SPI、eSPI）与主板上的传感器、CPLD、电源模块通信。它负责监控温度和电压、记录硬件故障、以及执行电源循环（上电/断电/重启）。
- **意义：** 当服务器操作系统崩溃或主节点完全死机时，依然可以通过 BMC 网络接口强制重启机器或查看硬件级别的故障隔离日志。

## 2. RESTful API

表现层状态转换（REST）是一种软件架构风格，**API** 是应用程序接口。RESTful API 就是符合这种风格的网络接口。

- **工作原理：** 它将所有的实体（在服务器管理中，比如“电源状态”、“风扇转速”）视为**资源（Resources）**，并通过标准的 HTTP 协议对这些资源进行操作。
- **数据格式：** 通常使用轻量级的 JSON 格式传输数据。
- **核心动作：**
- `GET`：获取资源（如：读取当前电压传感器读数）。
- `POST`：执行动作（如：向服务器发送开机指令）。
- `PATCH` / `PUT`：修改配置（如：更新启动顺序）。
- `DELETE`：删除资源。

## 3. Redfish 与 Redfish API

过去，服务器管理主要依赖 **IPMI**（智能平台管理接口）。但随着集群规模扩大，IPMI 暴露了安全性差、基于晦涩的二进制指令、扩展性弱等问题。

- **Redfish（标准）：** 由 DMTF（分布式管理任务组）制定的下一代服务器硬件管理**行业标准**。它的核心思想是用现代互联网技术（HTTPS + JSON）来取代老旧的 IPMI。
- **Redfish API（接口）：** 也就是运行在 **BMC** 上的实际服务端程序。它把底层的硬件状态（比如 CPLD 里的电源时序状态或 I2C 寄存器里的温度值）映射成了符合 **RESTful API** 规范的 JSON 数据。

---

## 它们是如何协同工作的？

假设正在管理一个多节点集群服务器，并希望编写一个脚本来检查某个节点的电源状态并在需要时强制重启。

在没有 Redfish 之前，可能需要用底层的串口指令，或者发送复杂的 IPMI 二进制报文。而在现代架构下：

1. **发起请求：** 通过 Python 脚本或 `curl` 命令，向该节点 **BMC** 的 IP 地址发送一个标准的 HTTPS `GET` 请求（这就是 **RESTful API** 的调用）。

- _URL 示例：_ `https://<BMC-IP>/redfish/v1/Systems/1`

2. **BMC 处理：** 节点上的 BMC 收到请求，调用其内部的 **Redfish API** 服务。
3. **返回数据：** Redfish 服务查询底层硬件状态，然后返回一段清晰的 JSON 数据：

```json
{
  "@odata.id": "/redfish/v1/Systems/1",
  "Id": "1",
  "Name": "Compute Node 1",
  "PowerState": "On",
  "ProcessorSummary": {
    "Count": 2,
    "Model": "ARM Cortex-A76",
    "Status": {
      "Health": "OK"
    }
  }
}
```
