---
title: "Linux 命令行下串口测试"
date: 2026-06-02
last_modified_at: 2026-06-02
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-命令行下串口测试/
toc: true
---

## 一、 硬件接线：交叉连接

在敲击任何命令前，必须先完成物理引脚的接线。要验证两个串口的互通，将它们短接：

- **USB0 TX** <---> **USB1 RX**
- **USB0 RX** <---> **USB1 TX**
- **GND** <---> **GND**（如果从不同模块引出，共地必不可少）

---

## 二、 软件测试：开启双终端验证

为了直观观察收发情况，强烈建议**同时打开两个 SSH 终端窗口**（窗口 A 和窗口 B）进行操作。

### 方法一：使用轻量级工具

图形界面的本质是在后台帮你配好了参数，命令行下最稳妥的方式也是使用专用的串口终端工具，如 `microcom`、`picocom` 或 `minicom`。

**避坑指南：`microcom` 的语法差异**
在部分系统中（如 Ubuntu/Debian 的独立版本），使用 `microcom` 时**必须显式加上 `-p` 参数**指定端口。如果仅使用 `microcom -s 115200 /dev/ttyUSB0`，它会忽略后面的设备节点，直接退回连接系统默认的 `/dev/ttyS0`，导致测试完全无效。

注意，没有microcom工具则使用下面的命令安装：
```bash
sudo apt update
sudo apt install microcom
```

**命令演示：**

1. 在窗口 A 打开 USB0：

```bash
microcom -p /dev/ttyUSB0 -s 115200

```

2. 在窗口 B 打开 USB1：

```bash
microcom -p /dev/ttyUSB1 -s 115200

```

3. 在任意窗口输入字符，即可在另一个窗口实时看到回显。

> **替代工具：**
> 如果系统没有 `microcom`，也可以使用：
>
> - `picocom -b 115200 /dev/ttyUSB0`
> - `minicom -D /dev/ttyUSB0 -b 115200`

---

### 方法二：纯命令法（stty + cat + echo）

如果系统极其精简，没有任何串口工具可用，可以借助基础命令。

**错误示范：**
直接使用 `echo "test" > /dev/ttyUSB0` 极大概率会失败。因为这会导致系统瞬间打开设备、发送数据、然后立刻关闭设备。关闭过快会清空底层缓冲区，导致数据丢失。

**正确步骤：**

1. **初始化串口参数（极其关键）**
   在两边窗口分别执行，将波特率设为 115200，并配置为 `raw`（透传模式）：

```bash
stty -F /dev/ttyUSB0 raw speed 115200
stty -F /dev/ttyUSB1 raw speed 115200

```

2. **在窗口 A 开启持续监听**
   执行以下命令后，窗口会阻塞并保持串口文件的打开状态：

```bash
cat /dev/ttyUSB1

```

3. **在窗口 B 发送测试数据**
   打开另一终端向 USB0 写入数据（建议带上换行符以触发某些串口的中断）：

```bash
echo -e "Message from USB0\r\n" > /dev/ttyUSB0

```

此时，在保持监听的窗口 A 中，便能顺利看到打印出的测试字符串。
