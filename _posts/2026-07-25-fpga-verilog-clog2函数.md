---
title: "verilog $clog2函数"
date: 2026-07-25
last_modified_at: 2026-07-25
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/verilog-clog2函数/
toc: true
---

`$clog2` 是 Verilog-2005 标准引入的**系统函数**，全称 **ceiling of log base 2**，即「以 2 为底的对数向上取整」。

## 功能

计算表示某个数值所需的最小二进制位数：

```
$clog2(N) = ⌈log₂(N)⌉
```

## 示例

```verilog
localparam BIT_CNT_WIDTH  = $clog2(TOTAL_BITS);  // TOTAL_BITS = 156
```

- `$clog2(156)` → ⌈log₂(156)⌉ = ⌈7.285⌉ = **8**
- 因此 `bit_cnt` 被声明为 `reg [7:0]`，刚好覆盖 0~155 的计数范围（156 个值需要 8 位）

```verilog
localparam IDLE_CNT_WIDTH = $clog2(IDLE_TIMEOUT);  // IDLE_TIMEOUT = 250
```

- `$clog2(250)` → ⌈7.96⌉ = **8** 位

---

## 数值对照

| N   | $clog2(N) | 解释                                                                          |
| --- | --------- | ----------------------------------------------------------------------------- |
| 1   | 0         | 1 个值不需要位宽                                                              |
| 2   | 1         | 0~1 需要 1 bit                                                                |
| 3   | 2         | 0~2 需要 2 bits                                                               |
| 4   | 2         | 0~3 需要 2 bits                                                               |
| 5   | 3         | 0~4 需要 3 bits                                                               |
| 8   | 3         | 0~7 需要 3 bits                                                               |
| 156 | 8         | 0~155 需要 8 bits                                                             |
| 256 | 8         | **注意**：256 个值 (0~255) 是 8 位，但 `$clog2(256)` = 8（因为计数从 0 开始） |
