---
title: "Anlogic FPGA 编译 synlog 解读"
date: 2026-05-18
last_modified_at: 2026-05-18
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/anlogic-fpga-编译-synlog-解读/
toc: true
---

## 1 日志位置

- 编译后的syn log日志在此处查看
  ![alt text](/assets/images/fpga/anlogic-fpga-编译-synlog-解读/PixPin_2026-05-18_09-25-51.png)

## 2 示例内容

```log
IO Statistics
#IO                       327
  #input                   94
  #output                 184
  #inout                   49

LUT Statistics
#Total_luts              6037
  #lut4                  2763
  #lut5                   438
  #lut6                     0
  #lut5_mx41                0
  #lut4_alu1b            2836

Utilization Statistics
#lut                     6037   out of   9280   65.05%
#reg                     2083   out of   9280   22.45%
#le                         0
#dsp                        0   out of     16    0.00%
#bram                       0   out of     30    0.00%
  #bram9k                   0
  #fifo9k                   0
#pad                      327   out of    331   98.79%
  #ireg                     5
  #oreg                    88
  #treg                     0
#pll                        0   out of      2    0.00%

Report Hierarchy Area:
+---------------------------------------------------------------------------------------------------------+
|Instance                              |Module               |lut     |ripple  |seq     |bram    |dsp     |
+---------------------------------------------------------------------------------------------------------+
|top                                   |top                  |3201    |2836    |2176    |0       |0       |
|  u_base_pwr_seq                      |base_pwr_seq         |75      |62      |38      |0       |0       |
|  u_bmc_rst_ctrl                      |bmc_rst_ctrl         |41      |61      |37      |0       |0       |
|  u_filter_base_pg                    |GlitchFilter         |16      |0       |16      |0       |0       |
|  u_filter_fan                        |GlitchFilter         |8       |0       |8       |0       |0       |
|  u_filter_k3_signals                 |GlitchFilter         |120     |0       |120     |0       |0       |
|  u_filter_psu                        |GlitchFilter         |12      |0       |12      |0       |0       |
|  u_filter_switch_pg                  |GlitchFilter         |4       |0       |4       |0       |0       |
|  u_filter_x86                        |GlitchFilter         |6       |0       |6       |0       |0       |
|  u_i2c_slave_system_top              |i2c_slave_system_top |631     |52      |264     |0       |0       |
|  u_k3_nodes_top                      |k3_nodes_top         |1394    |2061    |461     |0       |0       |
|    gen_k3_nodes[13]$u_k3_node_ctrl_A |k3_node_ctrl         |58      |82      |17      |0       |0       |
|    gen_k3_nodes[13]$u_k3_node_ctrl_B |k3_node_ctrl         |53      |82      |17      |0       |0       |
|    gen_k3_nodes[14]$u_k3_node_ctrl_A |k3_node_ctrl         |52      |82      |17      |0       |0       |
|    gen_k3_nodes[14]$u_k3_node_ctrl_B |k3_node_ctrl         |56      |82      |17      |0       |0       |
|    gen_k3_nodes[15]$u_k3_node_ctrl_A |k3_node_ctrl         |57      |82      |17      |0       |0       |
|    gen_k3_nodes[15]$u_k3_node_ctrl_B |k3_node_ctrl         |62      |82      |17      |0       |0       |
|    gen_k3_nodes[16]$u_k3_node_ctrl_A |k3_node_ctrl         |55      |82      |17      |0       |0       |
|    gen_k3_nodes[16]$u_k3_node_ctrl_B |k3_node_ctrl         |62      |82      |17      |0       |0       |
|    gen_k3_nodes[17]$u_k3_node_ctrl_A |k3_node_ctrl         |57      |82      |17      |0       |0       |
|    gen_k3_nodes[17]$u_k3_node_ctrl_B |k3_node_ctrl         |60      |82      |17      |0       |0       |
|    gen_k3_nodes[18]$u_k3_node_ctrl_A |k3_node_ctrl         |52      |82      |17      |0       |0       |
|    gen_k3_nodes[18]$u_k3_node_ctrl_B |k3_node_ctrl         |53      |82      |17      |0       |0       |
|    gen_k3_nodes[19]$u_k3_node_ctrl_A |k3_node_ctrl         |54      |82      |17      |0       |0       |
|    gen_k3_nodes[19]$u_k3_node_ctrl_B |k3_node_ctrl         |52      |82      |17      |0       |0       |
|    gen_k3_nodes[20]$u_k3_node_ctrl_A |k3_node_ctrl         |52      |82      |17      |0       |0       |
|    gen_k3_nodes[20]$u_k3_node_ctrl_B |k3_node_ctrl         |61      |82      |17      |0       |0       |
|    gen_k3_nodes[21]$u_k3_node_ctrl_A |k3_node_ctrl         |55      |82      |17      |0       |0       |
|    gen_k3_nodes[21]$u_k3_node_ctrl_B |k3_node_ctrl         |55      |82      |17      |0       |0       |
|    gen_k3_nodes[22]$u_k3_node_ctrl_A |k3_node_ctrl         |51      |82      |17      |0       |0       |
|    gen_k3_nodes[22]$u_k3_node_ctrl_B |k3_node_ctrl         |54      |82      |17      |0       |0       |
|    gen_k3_nodes[23]$u_k3_node_ctrl_A |k3_node_ctrl         |56      |82      |17      |0       |0       |
|    gen_k3_nodes[23]$u_k3_node_ctrl_B |k3_node_ctrl         |57      |82      |17      |0       |0       |
|    gen_k3_nodes[24]$u_k3_node_ctrl_A |k3_node_ctrl         |55      |82      |17      |0       |0       |
|    gen_k3_nodes[24]$u_k3_node_ctrl_B |k3_node_ctrl         |62      |82      |17      |0       |0       |
|  u_por                               |power_on_reset       |1       |19      |19      |0       |0       |
|  u_power_fault_monitor               |power_fault_monitor  |6       |0       |3       |0       |0       |
|  u_pwr_btn_detect                    |pwr_btn_detect       |34      |77      |35      |0       |0       |
|  u_sgpio_dual_cpld                   |sgpio_dual_cpld      |331     |51      |484     |0       |0       |
|  u_switch_ctrl                       |switch_ctrl          |74      |92      |58      |0       |0       |
|    u_switch_ctrl_rtl8111h            |switch_ctrl_rtl8111h |37      |46      |29      |0       |0       |
|    u_switch_ctrl_rtl8127             |switch_ctrl_rtl8127  |37      |46      |29      |0       |0       |
|  u_top_fsm                           |top_fsm              |157     |108     |64      |0       |0       |
|  u_x86_pwr_seq                       |x86_pwr_seq          |129     |253     |85      |0       |0       |
+---------------------------------------------------------------------------------------------------------+
```

## 3 日志解读

### 3.1 IO Statistics：管脚统计

这一部分记录了芯片引脚的使用情况。

```text
IO Statistics
#IO                       327
  #input                    94
  #output                  184
  #inout                    49

```

- **#IO (327)：** 整个设计一共使用了 327 个物理管脚。
$94 (\text{input}) + 184 (\text{output}) + 49 (\text{inout}) = 327 (\text{IO})$。

---

### 3.2 LUT Statistics：查找表统计（组合逻辑）

LUT（Look-Up Table，查找表）是FPGA实现组合逻辑的核心。这里的统计揭示了逻辑链条的复杂程度。

```text
LUT Statistics
#Total_luts              6037
  #lut4                  2763
  #lut5                   438
  #lut6                     0
  #lut5_mx41                0
  #lut4_alu1b            2836

```

- **#lut4 / #lut5：** 分别代表4输入和5输入的查找表。数字越大，说明设计中存在一些较复杂的逻辑判断。
- **#lut4_alu1b (2836)：** 这是一个关键指标。它代表**配置为算术逻辑单元（ALU）模式的4输入LUT**。通常用于实现加法器、计数器或比较器等“加法链/流水线”逻辑。从数据上看，这个设计中有大量的数学运算或计数器。

---

### 3.3 Utilization Statistics：整体资源利用率

```text
Utilization Statistics
#lut                     6037   out of   9280   65.05%
#reg                     2083   out of   9280   22.45%
#le                         0
#dsp                        0   out of     16    0.00%
#bram                       0   out of     30    0.00%
  #bram9k                   0
  #fifo9k                   0
#pad                      327   out of    331   98.79%
  #ireg                     5
  #oreg                    88
  #treg                     0
#pll                        0   out of      2    0.00%

```

1. **逻辑利用率 (#lut: 65.05%)**
   使用了 6037 个，总共有 9280 个。这是一个非常健康的数字。通常建议逻辑利用率控制在 **70%~80% 以下**，留有余量可以避免布线拥堵（Routing Congestion），保证时序收敛。
2. **寄存器利用率 (#reg: 22.45%)**
   使用了 2083 个。相比于 65% 的 LUT 利用率，寄存器用得较少。这说明这是一个**组合逻辑/运算较重，但时序状态机或流水线相对较浅**的设计。
3. **专用模块 (DSP / BRAM / PLL: 0%)**

- **DSP (0%):** 没有使用乘法器内核，说明没有复杂的数字信号处理（如大位数乘法、FFT、滤波器）。
- **BRAM (0%):** 没有使用块内存，意味着设计中没有大容量的FIFO、RAM或ROM。
- **PLL (0%):** 没有使用锁相环，说明该设计完全依赖外部输入的原始时钟，没有进行倍频或分频。

4. **管脚利用率 (#pad: 98.79%)**
   **331个可用管脚里用了327个，只剩4个空余！** 这是一个极度“IO受限（IO-bound）”的设计。


---

### 3.4 Report Hierarchy Area：模块资源层级报表

```text
+---------------------------------------------------------------------------------------------------------+
|Instance                              |Module               |lut     |ripple  |seq     |bram    |dsp     |
+---------------------------------------------------------------------------------------------------------+
|top                                   |top                  |3201    |2836    |2176    |0       |0       |
|  u_base_pwr_seq                      |base_pwr_seq         |75      |62      |38      |0       |0       |
|  u_bmc_rst_ctrl                      |bmc_rst_ctrl         |41      |61      |37      |0       |0       |
...
|  u_k3_nodes_top                      |k3_nodes_top         |1394    |2061    |461     |0       |0       |
|    gen_k3_nodes[13]$u_k3_node_ctrl_A |k3_node_ctrl         |58      |82      |17      |0       |0       |
...
|  u_sgpio_dual_cpld                   |sgpio_dual_cpld      |331     |51      |484     |0       |0       |
+---------------------------------------------------------------------------------------------------------+

```

- **表头含义：**
- `lut`：模块消耗的普通逻辑查找表。
- `ripple`：模块消耗的纹波进位链（即前面的 `lut4_alu1b`，用于加法/计数）。
- `seq`：时序逻辑元件（寄存器数量）。
