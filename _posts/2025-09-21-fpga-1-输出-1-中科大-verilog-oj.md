---
title: "1 输出 1 —— 中科大 verilog OJ"
date: 2025-09-21
last_modified_at: 2025-09-21
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/1-输出-1-中科大-verilog-oj/
toc: true
---

## 1 题目链接

https://verilogoj.ustc.edu.cn/oj/problem/30

## 2 题目要求
### 2.1 题目要求
设计一个Verilog模块，使其输出信号始终为逻辑高电平（1），位宽为1，无输入端口。

### 2.2 题目代码模板
```verilog
module top_module(
  output out
);
  // Write your code here
endmodule
```

## 3 题解

### 3.1 错误示范分析

```verilog
module top_module(
  output out
);
  out <= 1'b1;  // 错误代码
endmodule
```

这段代码存在两个主要问题：
1. **赋值方式错误**：`<=` 是非阻塞赋值操作符，只能在 `always` 或 `initial` 过程块中使用
2. **缺少过程块**：非阻塞赋值不能在模块的顶层直接使用，必须包含在过程块中

### 3.2 正确解决方案

#### 方案1：使用连续赋值（推荐）
```verilog
module top_module(
    output out
);
    assign out = 1'b1;  // 持续驱动输出为逻辑1
endmodule
```

**实现原理：**
- 使用 `assign` 连续赋值语句将输出信号 `out` 直接连接到高电平
- `1'b1` 表示1位二进制数，值为1
- 这种实现方式最简洁高效，综合后生成一个直接连接到电源的电路

#### 方案2：使用过程块（备选）
```verilog
module top_module(
    output reg out  // 需要声明为reg类型
);
    always @(*) begin
        out = 1'b1;  // 阻塞赋值
    end
endmodule
```
![alt text](/assets/images/fpga/1-输出-1-中科大-verilog-oj/PixPin_2025-09-21_20-27-28.png)
- 实测该代码会报错，原因如下：
    使用 always @() 赋常量给 reg，会出现“@ 找不到敏感信号所以永不触发”的警告，并且在模块初始化/仿真开始时 out 可能是未定义（x），因为 always 块没有被触发去把 1 赋给 out。因此仿真中 time 0 时 out 为 x

### 3.3 电路实现原理
这个简单的电路在硬件上实现为一个直接连接到电源（VDD）的导线：
- 不需要任何逻辑门或寄存器
- 综合后生成一个恒定输出高电平的电路
- 功耗极低，面积最小

## 4 相关知识详解

### 4.1 Verilog 赋值方式详解

#### 4.1.1 连续赋值 (Continuous Assignment)
- 语法：`assign <信号> = <表达式>;`
- 用于驱动线网（wire）类型信号
- 右侧表达式变化时立即更新左侧信号
- 适用于组合逻辑设计

#### 4.1.2 阻塞赋值 (Blocking Assignment)
- 语法：`<信号> = <表达式>;`
- 只能在过程块（always 或 initial）中使用
- 立即计算并更新信号值
- 语句按顺序执行，后续语句等待前一句完成
- 主要用于组合逻辑设计

#### 4.1.3 非阻塞赋值 (Non-blocking Assignment)
- 语法：`<信号> <= <表达式>;`
- 只能在过程块（always 或 initial）中使用
- 在时钟边沿或事件触发时并行更新所有右侧表达式
- 语句同时执行，不等待前一句完成
- 主要用于时序逻辑设计（寄存器）

### 4.2 信号类型与赋值方式的关系

| 信号类型 | 可用的赋值方式 | 使用场景 |
|---------|--------------|---------|
| wire    | 只能使用assign连续赋值 | 组合逻辑输出、模块间连接 |
| reg     | 只能在过程块中使用=或<= | 时序逻辑中的寄存器、组合逻辑中的中间变量 |

Verilog 规定：​​未明确声明类型的输出端口默认为 wire类型​

### 4.3 过程块类型与使用场景

#### 4.3.1 always 块
- 语法：`always @(敏感列表) begin ... end`
- 敏感列表可以是电平敏感（组合逻辑）或边沿敏感（时序逻辑）
- `always @(*)` 表示对块内所有输入信号敏感

#### 4.3.2 initial 块
- 语法：`initial begin ... end`
- 仅在仿真开始时执行一次
- 主要用于测试平台（testbench）中的初始化
- 不可综合，不能用于实际电路设计
