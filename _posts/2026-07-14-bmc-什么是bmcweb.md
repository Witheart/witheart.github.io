---
title: "什么是bmcweb"
date: 2026-07-14
last_modified_at: 2026-07-14
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/什么是bmcweb/
toc: true
---

**`bmcweb` 是 OpenBMC 开源项目中的核心 Web 服务器组件，它主要负责在 BMC 上提供 Redfish API、Web 用户界面以及基于 WebSockets 的远程控制功能。**

下图是bmcweb的UI界面
![alt text](/assets/images/bmc/什么是bmcweb/PixPin_2026-07-14_22-37-17.png)

## 1. 它的核心定位：OpenBMC 的“大门”

目前，很多现代服务器的 BMC 都在运行 **OpenBMC**（一个基于 Linux 的开源 BMC 操作系统，由 Linux 基金会主导）。在这个 Linux 系统中，`bmcweb` 是一个运行在用户空间的守护进程（Daemon）。
任何来自外部网络、想要管理这台服务器的 HTTP/HTTPS 请求，第一个接触到的就是 `bmcweb`。

## 2. 它在底层是如何工作的？（D-Bus 转换器）

这是 `bmcweb` 最巧妙的技术设计。
在 OpenBMC 的架构中，底层的硬件传感器读取、风扇控制、电源时序状态等，是由许多独立的 C/C++ 守护进程负责的（比如 `dbus-sensors`）。这些进程之间通过 Linux 的 **D-Bus（进程间通信机制）** 交换数据。

`bmcweb` 扮演了一个**协议转换器**的角色：

1. **接收 RESTful 请求：** 您发送一个 `GET /redfish/v1/Chassis/1/Thermal` 的 HTTP 请求。
2. **转换为 D-Bus 调用：** `bmcweb` 解析这个 URL，发现您要查温度。它就会向 D-Bus 发送一个异步查询，询问负责温度传感器的底层进程。
3. **组装 JSON 响应：** 底层进程通过 D-Bus 返回原始的温度数据（比如一个 I2C 寄存器里读出的摄氏度），`bmcweb` 拿到数据后，将其包装成符合 **Redfish 标准**的 JSON 格式，通过 HTTP 响应发送给您。

## 3. bmcweb 的关键功能

除了作为 Redfish API 的服务端，`bmcweb` 还承担了以下任务：

- **承载 Web GUI：** 当你在浏览器里输入 BMC 的 IP 地址并看到一个可视化的管理后台（通常用 Vue.js 或 React 编写）时，这个静态前端页面就是由 `bmcweb` 托管和分发的。
- **WebSockets 代理：** 对于服务器管理，KVM（键盘、视频、鼠标）重定向和虚拟串口（Serial over LAN）是刚需。`bmcweb` 支持 WebSockets，这让管理员可以直接在网页浏览器里看到服务器接上显示器后的开机画面，并进行键盘输入。
- **轻量与高性能：** 考虑到 BMC 的硬件资源通常非常有限（比如只有几百兆内存的 ARM 芯片），`bmcweb` 是用现代 **C++** 编写的，并重度依赖 `Boost.Asio` 和 `Boost.Beast` 库来实现异步无阻塞的 I/O 模型。这保证了它在极低的 CPU 和内存占用下，依然能并发处理大量的管理请求。
