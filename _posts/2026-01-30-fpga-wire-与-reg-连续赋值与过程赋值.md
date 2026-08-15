---
title: "wire 与 reg、连续赋值与过程赋值"
date: 2026-01-30
last_modified_at: 2026-01-30
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/wire-与-reg-连续赋值与过程赋值/
toc: true
---

## 一、为什么要区分 wire 和 reg

### 根本原因：**硬件建模的需要**

Verilog 是**硬件描述语言**，不是编程语言。它需要精确描述：

- **连线**：信号传输的路径
- **寄存器**：存储数据的元件
- **组合逻辑**：无记忆的电路
- **时序逻辑**：有时钟记忆的电路

## 二、wire 和 reg 的区别详解

| 特性         | **wire（线网）**      | **reg（寄存器）**           |
| ------------ | --------------------- | --------------------------- |
| **物理意义** | 连线、导线            | 存储元件、触发器            |
| **赋值方式** | 只能用`assign`        | 只能用`=`或`<=`             |
| **存储能力** | ❌ 无记忆，值随时变化 | ✅ 有记忆，保持值直到被更新 |
| **默认值**   | 高阻态`z`             | 不定态`x`                   |
| **使用位置** | 只能在过程块外        | 只能在过程块内              |
| **综合结果** | 连线或组合逻辑        | 触发器或组合逻辑            |

## 三、三种赋值方式的对比

| 特性         | **连续赋值 assign** | **阻塞赋值 =** | **非阻塞赋值 <=**  |
| ------------ | ------------------- | -------------- | ------------------ |
| **执行时机** | 立即，实时更新      | 立即，顺序执行 | 时钟边沿，并行执行 |
| **硬件对应** | 连线或组合逻辑      | 组合逻辑       | 时序逻辑（触发器） |
| **使用场景** | wire 变量，简单连线 | 组合逻辑建模   | 时序逻辑建模       |
| **示例**     | `assign y = a & b;` | `y = a & b;`   | `q <= d;`          |

## 四、实际例子对比

### 示例 1：wire 的使用

```verilog
wire result;                // 声明一个连线
assign result = a & b;     // 连接a和b的与运算结果
// 相当于：result = a AND b
// 只要a或b变化，result立即变化
```

### 示例 2：reg 的使用

```verilog
reg q;  // 声明一个寄存器
// 时序逻辑：D触发器
always @(posedge clk) begin
    q <= d;  // 在时钟上升沿存储d的值
end
// q在时钟之间保持其值
```

## 五、深入理解

### 为什么需要非阻塞赋值（<=）？

**模拟并行硬件行为**：

```verilog
// 示例：交换两个寄存器的值
always @(posedge clk) begin
    a <= b;  // 同时执行
    b <= a;  // 同时执行
end
// 结果：a和b正确交换
```

**对比阻塞赋值（=）**：

```verilog
always @(posedge clk) begin
    a = b;   // 立即执行
    b = a;   // 这时a已经是b的值了
end
// 结果：a和b都变成b的旧值，交换失败！
```

## 六、综合（硬件实现）视角

### wire 的硬件实现：

```verilog
wire out = a & b;
// 综合为：
//   a ───┐
//         & ── out
//   b ───┘
```

### reg 的硬件实现：

```verilog
reg q;
always @(posedge clk) begin
    q <= d;
end
// 综合为：
//   d ───D─Q─── q
//         ↑
//       clk
// 一个D触发器
```

## 七、常见误解澄清

### 误解 1：reg 一定对应触发器

**真相**：不一定！

```verilog
// 这个reg是组合逻辑，不生成触发器
reg y;
always @(*) begin
    y = a & b;  // 组合逻辑
end
// 综合为与门，不是触发器
```

### 误解 2：wire 比 reg 简单

**真相**：wire 是连线，reg 是变量，用途不同

- wire 用于连接
- reg 用于存储或在 always 块中计算

## 八、设计原则

### 1. 端口声明规则

- 输入端口：默认为 wire
- 输出端口：
  ```verilog
  output reg q;     // 在always块中赋值
  output wire y;    // 用assign赋值
  ```

### 2. 推荐的编码风格

```verilog
module example(
    input  wire clk, rst,
    input  wire [7:0] data_in,
    output reg  [7:0] data_out,  // 时序逻辑，用reg
    output wire       valid       // 组合逻辑，用wire
);

    // 组合逻辑：用assign
    assign valid = (state == IDLE);

    // 组合逻辑：也可以用always块
    reg [7:0] temp;
    always @(*) begin
        temp = data_in + 1;  // 阻塞赋值
    end

    // 时序逻辑：必须用非阻塞赋值
    always @(posedge clk) begin
        if (rst)
            data_out <= 8'b0;
        else
            data_out <= temp;  // 非阻塞赋值
    end
endmodule
```

## 九、示例

```verilog
module flow_led(
    input  wire I_clk,     // 时钟是连线输入
    input  wire I_rst,     // 复位是连线输入
    input  wire key_flag_0,// 按键脉冲是连线输入

    output wire led_0,     // LED输出是连线
    // ...
);

    reg [7:0]  led;        // LED状态需要存储，用reg
    reg [24:0] delay_cnt;  // 计数器需要记忆，用reg
    reg key_trig;          // 触发标志需要记忆，用reg

    // 时序逻辑：用非阻塞赋值
    always@(posedge I_clk or posedge I_rst)begin
        if(I_rst)
            led <= 8'b1111_1100;  // 非阻塞赋值
        else
            led <= ...;           // 非阻塞赋值
    end

    // 组合逻辑连接：用assign
    assign led_0 = led[0];  // 简单连线
    assign led_1 = led[1];  // 简单连线
    // ...
```
