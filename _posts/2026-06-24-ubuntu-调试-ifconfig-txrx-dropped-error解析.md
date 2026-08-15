---
title: "ifconfig TXRX dropped error解析"
date: 2026-06-24
last_modified_at: 2026-06-24
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/ifconfig-txrx-dropped-error解析/
toc: true
---

```bash
enp1s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.0.22  netmask 255.255.255.0  broadcast 192.168.0.255
        inet6 fe80::832b:2f5f:47e5:656a  prefixlen 64  scopeid 0x20<link>
        ether 50:0a:52:00:00:08  txqueuelen 1000  (Ethernet)
        RX packets 2006703442  bytes 2253073982707 (2.2 TB)
        RX errors 0  dropped 3130997  overruns 808  frame 0
        TX packets 2385923254  bytes 1327052593596 (1.3 TB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device memory 0xdf100000-df11ffff
```

## 1. RX / TX (Receive / Transmit)：内核态的数据吞吐

RX 和 TX 统计的不仅仅是“数据量”，而是**以太网帧（Ethernet Frames）在网卡（NIC）与系统主存（RAM）之间通过 DMA（直接内存访问）成功拷贝的次数和字节数**。

- **RX (接收)：****流程：** 网卡 PHY 芯片将模拟信号解调为数字信号 -> MAC 芯片成帧 -> 通过 PCIe 或 SDIO 等总线，利用 DMA 直接写入预先分配的内核内存环形缓冲区（RX Ring Buffer） -> 触发硬中断（Hard IRQ） -> 触发软中断（Soft IRQ，通常通过 NAPI 轮询）通知内核协议栈处理 `sk_buff`（套接字缓冲区）结构体。
- **指标意义：** RX counter 增加，意味着物理层握手成功，且数据帧已成功驻留在系统内存中等待内核协议栈剥离头部（MAC/IP/TCP）。

- **TX (发送)：**
- **流程：** 用户态应用发起 `send()` 系统调用 -> 数据从用户态拷贝到内核态组装成 `sk_buff` -> 经过网络层路由和传输层封装 -> 交给网络设备的排队规则（Qdisc） -> 放入 TX Ring Buffer -> 通知网卡驱动 -> 网卡通过 DMA 读取内存数据 -> MAC 芯片转换为串行比特流 -> PHY 芯片发送到物理介质。
- **指标意义：** TX counter 增加，代表内核成功将一个以太网帧的发送任务交接给了网卡硬件。

---

## 2. Errors：L1/L2 物理与链路层异常

**Errors 永远是硬件层面的问题。** 它发生在 OSI 模型的第一层（物理层）和第二层（数据链路层）。这意味着网卡在接收或发送数字信号时，发现了**结构性损坏**。

- **RX Errors (接收错误)：**
- **FCS / CRC 校验错误：** 网卡 MAC 层在计算接收到的帧的帧校验序列（FCS）时，发现与包尾的 CRC 码不匹配。说明数据在传输介质中（电缆、空气）发生了比特翻转（Bit-flip）或截断。
- **帧对齐错误 (Alignment Error)：** 接收到的比特流无法凑成完整的字节（通常也是由于干扰导致丢失了某些比特）。
- **长度异常 (Length Error)：** 接收到了过小的帧（Runts，小于 64 字节）或超大帧（Giants，超过 MTU 限制），这通常是由于物理层冲突或对端网卡故障引起的。
- **排查方向：** 硬件链路。检查 PHY 芯片状态、射频天线匹配、网线屏蔽层、接口时序（如 RGMII 接口的时序偏移配置错误）。

- **TX Errors (发送错误)：**
- **载波丢失 (Carrier Sense Error)：** 发送时物理层未检测到载波（例如网线突然断开，或无线信道被严重阻塞完全无法抢占）。
- **冲突 (Collisions)：** 在半双工网络中检测到了传输冲突。
- **FIFO 欠载 (FIFO Underrun)：** 系统总线（如 PCIe）带宽被严重占用，导致 DMA 向网卡 TX FIFO 搬运数据的速度，赶不上网卡向外发送信号的速度，导致发送了一半的“断头帧”。

---

## 3. Dropped：L3/L4 内核协议栈与资源调度异常

**Dropped 绝大多数情况下是软件层面的问题。** 数据帧是完整的（L2 FCS 校验通过），也成功进入了系统或网卡，但由于**系统资源枯竭**或**软件策略拦截**，被 Linux 内核主动或被动丢弃。

- **RX Dropped (接收丢包)：**
- **Ring Buffer 溢出 (Overrun/Drop)：** 这是高并发下最常见的性能瓶颈。网卡接收数据的速度极快，但 CPU 处理软中断（`ksoftirqd`）的速度跟不上，导致 RX Ring Buffer 被填满，后续到达的合法物理帧由于没有内存空间存放，被网卡硬件直接丢弃（此过程系统甚至没有感知，只能靠查网卡内部寄存器统计）。
- **协议栈不匹配：** 接收到了未知的以太网协议类型（如不是 IPv4/IPv6/ARP），内核不知道交由哪个模块处理。
- **Netfilter/防火墙拦截：** 数据包进入 IP 层后，触碰到了 `iptables` / `nftables` 的 DROP 规则，被内核安保机制销毁。
- **VLAN/MAC 过滤：** 处于混杂模式下的无线网卡，或者收到了目标 MAC 地址不是自己的单播包，在底层被快速路径直接释放。

- **TX Dropped (发送丢包)：**
- **Qdisc 拥塞 (Queueing Discipline Drop)：** 系统的发送队列（如 `pfifo_fast` 或 `fq_codel`）长度达到了上限（由 `txqueuelen` 参数控制，如图中的 1000）。当上层应用疯狂调用 socket 发送数据，而底层网卡发送速率受限（比如无线信号差导致物理层降速协商），发送队列就会填满，内核只能丢弃新的发送请求。
- **流量整形 (Traffic Shaping)：** 配置了 `tc` (Traffic Control) 限制发包速率，超额的流量会被主动丢弃。

## 例子

- **3588 网络崩溃，经查Errors偏多：** 最后发现问题是WiFi模组休眠后概率性无法唤醒，导致网络崩溃。WiFi在唤醒过程中，应该是存在sdio不稳定的情况，导致error偏多。
