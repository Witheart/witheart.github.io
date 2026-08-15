---
title: "RTL级架构设计优化（LUT面积优化）—— 以时钟逻辑复用为例"
date: 2026-05-16
last_modified_at: 2026-05-16
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/rtl级架构设计优化-lut面积优化-以时钟逻辑复用为例/
toc: true
---

## 日志分析

查看日志

```log
+-----------------------------------------------------------------------------------------------------------------+
|Instance                              |Module               |le     |lut     |ripple  |seq     |bram    |dsp     |
+-----------------------------------------------------------------------------------------------------------------+
|top                                   |top                  |8109   |5910    |2131    |2633    |0       |0       |
|  u_k3_nodes_top                      |k3_nodes_top         |5600   |3795    |1805    |1044    |0       |0       |
|    gen_k3_nodes[13]$u_k3_node_ctrl_A |k3_node_ctrl         |236    |163     |73      |41      |0       |0       |
|    gen_k3_nodes[13]$u_k3_node_ctrl_B |k3_node_ctrl         |234    |161     |73      |46      |0       |0       |
...
```

程序不复杂，LUT 却这么多？

这里有一个非常明显的代码特征：**每个子模块里的 `ripple`（进位链）高达 73 个**。
在 FPGA/CPLD 中，`ripple` 代表加法器、减法器、计数器或大位宽的比较器。

一个模块里有 73 级的进位，这意味着你的 `k3_node_ctrl` 里面可能存在以下代码：

1. **大位宽的计数器/定时器**：比如为了实现几百毫秒或秒级的延时、超时检测，在每个 node 控制器里都写了一个 `reg [31:0] cnt`。
2. **大位宽的数值比较**：形如 `if (cnt >= 32'hXXXX)`。

当这种分布式的大位宽计数器被例化到十几个子节点（如 `gen_k3_nodes`）中时，FPGA 的寄存器和 LUT 资源就会被迅速吃光。

---

## 痛点分析：

以系统时钟 25MHz 为例，若要在状态机中实现一个 30 秒的超时等待和一个 10 秒的硬件下电等待，传统的直觉写法是在状态机内部直接对时钟进行计数：

```verilog
// 优化前：直接对 25MHz 时钟计数
reg [29:0] s7_timeout_cnt; // 25,000,000 * 30 = 750,000,000，需要 30 位宽
wire s7_timeout = (s7_timeout_cnt >= 30'd750_000_000);

always @(posedge clk or negedge rst_n) begin
    if (!rst_n) s7_timeout_cnt <= 30'd0;
    else if (st == S7_SOFT_SHUTDOWN) s7_timeout_cnt <= s7_timeout_cnt + 1'b1;
    else s7_timeout_cnt <= 30'd0;
end

```

这种做法存在严重的资源浪费：

- **高位宽进位链**：每个计数器都需要 30 位的寄存器，并且在加法和比较时会消耗大量的组合逻辑（LUT）与进位链（Ripple）。
- **无法复用**：若有多个状态需要不同的定时，或者存在多个并行例化的子模块，这些 30 位宽的计数器就会呈线性倍增，直接导致布局布线压力剧增。

---

## 优化策略：全局多粒度 Tick 发生器（时钟逻辑复用）

为了打破资源消耗的死循环，我们引入“全局级联同步时钟使能（Cascaded Clock Enable）”架构。核心思想是：**在顶层生成一套统一的、单周期脉冲的时间基准（Tick），底层模块只通过使能信号来做“微型计数”**。

### 1. 顶层设计：级联 Tick 发生器

在 `top.v` 中，我们设计一个多级递进的定时基准源。所有计数器都绑定在同一个系统时钟 `i_sys_clk` 上，确保整体仍处于**单一同步时钟域**内。

```verilog
// ==========================================
// 全局多粒度 Tick 发生器 (以 25MHz 主频为例)
// ==========================================
reg [14:0] tick_1ms_cnt;
reg        tick_1ms;
always @(posedge i_sys_clk or negedge g_rst_n) begin
    if (!g_rst_n) begin
        tick_1ms_cnt <= 0;
        tick_1ms     <= 0;
    end else if (tick_1ms_cnt >= 15'd24_999) begin // 25000个周期 = 1ms
        tick_1ms_cnt <= 0;
        tick_1ms     <= 1'b1; // 单周期脉冲
    end else begin
        tick_1ms_cnt <= tick_1ms_cnt + 1;
        tick_1ms     <= 1'b0;
    end
end

reg [3:0] tick_10ms_cnt;
reg       tick_10ms;
always @(posedge i_sys_clk or negedge g_rst_n) begin
    if (!g_rst_n) begin
        tick_10ms_cnt <= 0;
        tick_10ms     <= 0;
    end else if (tick_1ms) begin
        if (tick_10ms_cnt >= 4'd9) begin
            tick_10ms_cnt <= 0;
            tick_10ms     <= 1'b1;
        end else begin
            tick_10ms_cnt <= tick_10ms_cnt + 1;
            tick_10ms     <= 1'b0;
        end
    end else begin
        tick_10ms <= 1'b0;
    end
end

// ... 同理级联得到 tick_100ms

reg [3:0] tick_1s_cnt;
reg       tick_1s;
always @(posedge i_sys_clk or negedge g_rst_n) begin
    if (!g_rst_n) begin
        tick_1s_cnt <= 0;
        tick_1s     <= 0;
    end else if (tick_100ms) begin
        if (tick_1s_cnt >= 4'd9) begin
            tick_1s_cnt <= 0;
            tick_1s     <= 1'b1;
        end else begin
            tick_1s_cnt <= tick_1s_cnt + 1;
            tick_1s     <= 1'b0;
        end
    end else begin
        tick_1s <= 1'b0;
    end
end

```

> 注意看 `else begin tick_1s <= 1'b0; end` 的逻辑。因为它的触发源（如 `tick_100ms`）本身就是一个仅维持一周期的高电平脉冲，这百分之百保证了生成的 `tick_1s` 也是一个**绝对标准的单周期脉冲**。其余时间它都是 0，不会引起子模块的误计数。

---

### 2. 底层状态机重构：计数器极限瘦身

有了全局送入的 `tick_1s` 脉冲，底层状态机 `top_fsm.v` 的定时器就可以进行删减：

```diff
-// 10秒硬件下电等待计数器
-reg [29:0] s8_timeout_cnt;
-wire s8_timeout = (s8_timeout_cnt >= 30'd250_000_000);
+// 10秒硬件下电等待计数器 (基于 1s tick, 10 * 1s = 10s)
+reg [3:0] s8_timeout_cnt;                         // 30位缩减至4位！
+wire s8_timeout = (s8_timeout_cnt >= 4'd10);

```

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        s8_timeout_cnt <= 4'd0;
    end else if (st == S8_PWRDOWN_MOD) begin
        if (tick_1s && !s8_timeout) s8_timeout_cnt <= s8_timeout_cnt + 1'b1;
    end else begin
        s8_timeout_cnt <= 4'd0; // 退出状态时精准清零
    end
end

```

```verilog
S8_PWRDOWN_MOD: begin
    if (s8_timeout) nst = S9_PWRDOWN_BASE;
end
```

---

## 核心机制深度剖析

### 1. `if (tick_1s && !s8_timeout)` 的妙处

这行代码在硬件行为上可以拆解为两个控制维度：

- **`tick_1s`（决定什么时候加 1）**：由于主时钟每秒运行 25,000,000 次，加上该条件后，只有在“秒交替”的那一个时钟沿，计数器才被允许加 1。它成功把系统的“通用时钟”变成了低频的“秒表”。
- **`!s8_timeout`（决定什么时候停止）**：当计数器累加到 10 时，`s8_timeout` 变为 1，导致 `!s8_timeout` 变为 0。此时计数使能被**死死锁死**。
  _为什么要锁死？_ 因为如果不加限制，由于位宽只有 4 位（最大可表示 15），计数器会在数到 15 后的下一个脉冲发生**溢出归零（Overflow）**。一旦归零，超时信号就会诡异地消失，造成状态机逻辑彻底崩溃。

### 2. 完美的同步时钟域设计

很多 RTL 开发者在面对大周期定时时，倾向于自己写一个分频器产生一个新时钟 `clk_1s`，然后使用 `always @(posedge clk_1s)`。这种做法在 FPGA 设计中是大忌。它会引入可怕的时钟走线扭曲（Clock Skew）以及复杂的跨时钟域（CDC）时序违规。

本方案中，全片采用同一主时钟 `i_sys_clk` 驱动。所谓的 1ms、10ms、1s，本质上**不是时钟，而是时钟使能信号**。
