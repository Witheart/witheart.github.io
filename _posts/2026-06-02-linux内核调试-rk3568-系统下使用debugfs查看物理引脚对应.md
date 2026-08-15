---
title: "RK3568 系统下使用debugfs查看物理引脚对应"
date: 2026-06-02
last_modified_at: 2026-06-02
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/rk3568-系统下使用debugfs查看物理引脚对应/
toc: true
---

## 查找方式
**1. 确保挂载了 debugfs**
通常系统默认已经挂载，如果没有，执行：

```bash
mount -t debugfs none /sys/kernel/debug

```

**2. 以UART为例 —— 查找 UART 的引脚映射**
执行以下命令，直接过滤出所有与 `uart` 相关的引脚状态：

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl/pinmux-pins | grep -i uart

```

或者，如果你已经知道是 `ttyS2`（对应 `uart2`），可以直接 grep：

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl/pinmux-pins | grep uart2

```

**输出示例解析：**
你可能会看到类似这样的输出：

> `pin 43 (gpio1-11): device fe660000.serial function uart2m1_rx group uart2m1-rx`
> `pin 44 (gpio1-12): device fe660000.serial function uart2m1_tx group uart2m1-tx`

- **`device fe660000.serial`**: 表示这是设备树中寄存器基地址为 `fe660000` 的串口。
- **`function uart2m1_rx`**: 表示当前使用的是 `uart2` 的 `m1` 组引脚作为 RX 接收端。
- **`pin 43 (gpio1-11)`**: 这就是你需要的物理引脚信息！它代表这是 **GPIO1 组的第 11 号引脚**。换算成瑞芯微的硬件命名标准（A=0~7, B=8~15, C=16~23, D=24~31），11 号引脚属于 B 端口的第 3 个引脚（8+3=11），所以它的物理丝印通常是 **`GPIO1_B3`**。

## 换算方式（RK 系列 GPIO 命名规则）

当你在命令行查到 `gpioX-Y` 时（比如 `gpio3-27`）：

- **X** 就是 GPIO Bank（第 3 组，即 GPIO3）。
- **Y** 除以 8 获取端口字母：
- 0 ~ 7 为 A
- 8 ~ 15 为 B
- 16 ~ 23 为 C
- 24 ~ 31 为 D

- **Y** 对 8 取余获取端口号：
- 27 / 8 = 3 (对应 D)
- 27 % 8 = 3

- 所以 `gpio3-27` 对应的物理引脚是 **`GPIO3_D3`**。拿着这个名字去查阅你板子的硬件原理图，就能准确找到物理排针位置了。
