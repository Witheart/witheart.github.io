---
title: "查看 ttySx 基础波特率和运行时实际波特率"
date: 2025-02-19
last_modified_at: 2025-02-19
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/查看-ttysx-基础波特率和运行时实际波特率/
toc: true
---

### **1.1 `dmesg` 查看 UART 设备信息**
```sh
dmesg | grep -i "ttyS"
```
示例输出：
```
[    1.869027] fdd50000.serial: ttyS0 at MMIO 0xfdd50000 (irq = 17, base_baud = 1500000) is a 16550A
[    1.869512] fe670000.serial: ttyS1 at MMIO 0xfe670000 (irq = 63, base_baud = 1500000) is a 16550A
[    1.869878] fe680000.serial: ttyS2 at MMIO 0xfe680000 (irq = 64, base_baud = 1500000) is a 16550A
[    1.870203] fe690000.serial: ttyS3 at MMIO 0xfe690000 (irq = 65, base_baud = 1500000) is a 16550A
[    1.870513] fe6b0000.serial: ttyS4 at MMIO 0xfe6b0000 (irq = 66, base_baud = 1500000) is a 16550A
[    1.870850] fe6c0000.serial: ttyS6 at MMIO 0xfe6c0000 (irq = 67, base_baud = 1500000) is a 16550A
[    1.871165] fe6d0000.serial: ttyS5 at MMIO 0xfe6d0000 (irq = 68, base_baud = 1500000) is a 16550A
[  174.257599] ttyS6 - failed to request DMA, use interrupt mode
```
- 这里 `base_baud = 1500000`，表示 **UART 设备的基础波特率是 1.5 Mbps**，但这个值并不代表实际的运行波特率。

### **1.2 `stty` 查看 `ttySx` 当前波特率**
```sh
stty -F /dev/ttyS0
```
示例输出：
```
speed 9600 baud; line = 0;
hupcl clocal
-brkint ixon -imaxbel
```
- 这里 `speed 9600 baud` 表示 **当前 UART 波特率是 9600 bps**，与 `dmesg` 显示的 `base_baud = 1500000` 并不匹配。

---

## **2. `base_baud` vs `current-speed` 的区别**
| 参数          | 作用 |
|--------------|--------------------------------------------------|
| **`base_baud`** | 设备的 **基础波特率**，通常由硬件 UART 时钟源决定 |
| **`current-speed`** | UART **当前运行的波特率**，由驱动或用户空间设置 |

base_baud 代表串口控制器的基础时钟频率，它通常由主时钟 (UART_CLK) 经过分频得到。例如，在 RK3568 上，UART 的时钟来源可能是 24MHz 或 1.5MHz，然后通过 divisor 进行分频。串口的实际波特率是通过 base_baud 除以 divisor 计算得到的。
