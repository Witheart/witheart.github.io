---
title: "命令行向内核dmesg临时打印日志方式（人为制造日志）"
date: 2026-08-20
last_modified_at: 2026-08-20
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/命令行向内核dmesg临时打印日志方式-人为制造日志/
toc: true
---

通常，内核日志（Kernel Ring Buffer）只能由内核态代码通过 `printk` 生成。但在测试日志采集系统、编写监控告警规则或复现生产环境故障时，我们往往需要**人为地制造一些内核日志**。

如果为了打印一条日志就去修改内核源码、编译模块并加载，成本未免太高。本文将介绍一种**轻量级、即时生效**的方法：通过向 `/dev/kmsg` 写入数据，直接向内核日志缓冲区注入消息。


## 一、原理解析：用户态与内核日志的桥梁

`/dev/kmsg` 是 Linux 系统中的一个**字符设备**，它是用户空间与内核日志系统（Kernel Ring Buffer）之间的桥梁。

- **读取**：`dmesg` 命令本质上就是读取 `/dev/kmsg` 来获取内核日志。
- **写入**：内核允许拥有写权限的用户向该设备写入数据。写入的内容会被**直接注入**到内核日志缓冲区中，仿佛它们是由内核代码中的 `printk` 打印出来的一样。

这意味着，任何具备 `root` 权限的脚本或命令行，都可以伪造出以假乱真的“内核日志”。

---

## 二、基础用法：写入一条错误日志

### 1. 命令格式

最简单的写入方式就是使用重定向或 `tee` 命令：

```bash
# 方法一：使用重定向（需要 root shell）
echo "<3>My Test Message" > /dev/kmsg

# 方法二：使用 sudo tee（推荐，无需切换 shell）
echo "<3>My Test Message" | sudo tee /dev/kmsg
```

### 2. 关键：日志级别（Log Level）

注意消息开头的 `<3>`，这是**日志级别（Priority）**。

内核日志级别决定了消息的严重程度。格式为 `<N>`，其中 `N` 是一个 0-7 的数字。

| 数值      | 宏定义       | 含义     | 说明                             |
| :-------- | :----------- | :------- | :------------------------------- |
| `<0>`     | KERN_EMERG   | 紧急     | 系统不可用                       |
| `<1>`     | KERN_ALERT   | 警告     | 必须立即处理                     |
| `<2>`     | KERN_CRIT    | 严重     | 严重错误（如硬件失效）           |
| **`<3>`** | **KERN_ERR** | **错误** | **常规错误条件（最常用于测试）** |
| `<4>`     | KERN_WARNING | 警告     | 警告条件                         |
| `<5>`     | KERN_NOTICE  | 通知     | 普通但需注意的事件               |
| `<6>`     | KERN_INFO    | 信息     | 信息性消息                       |
| `<7>`     | KERN_DEBUG   | 调试     | 调试级别信息                     |

**如果不指定级别**，系统通常会默认使用 `KERN_DEFAULT`（通常是 `KERN_WARNING` 或 `KERN_INFO`，取决于内核配置）。

**示例**：写入一条 Info 级别的日志

```bash
echo "<6>This is an info message from user space" | sudo tee /dev/kmsg
```

---

## 三、实战演练：模拟真实硬件驱动错误

既然目标是测试，我们就应该模拟得越像越好。以下是几个模拟真实驱动报错的案例。

### 1. 模拟 DisplayPort (DP) 驱动错误

模拟 `spacemit-inno-dp-drv` 的 AUX 通道错误：

```bash
echo "<3>spacemit-inno-dp-drv cac88000.dp1: AUX status error, cmd: 0x9, address: 0x0, size 15, status: 0x4, code: 0x6" | sudo tee /dev/kmsg
echo "<3>spacemit-inno-dp-drv cac88000.dp1: AUX status error, cmd: 0x1, address: 0x50, size 16, status: 0xfe, code: 0x6" | sudo tee /dev/kmsg
```

### 2. 模拟 I2C 总线通信失败

在嵌入式开发中，I2C 设备无响应是常见错误：

```bash
echo "<3>i2c i2c-3: transfer failed: I/O error, addr 0x50, flags 0x0" | sudo tee /dev/kmsg
echo "<3>i2c_designware 10010000.i2c: controller timed out" | sudo tee /dev/kmsg
```
