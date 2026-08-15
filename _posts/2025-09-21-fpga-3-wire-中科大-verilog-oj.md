---
title: "3 wire 中科大 verilog OJ"
date: 2025-09-21
last_modified_at: 2025-09-21
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/3-wire-中科大-verilog-oj/
toc: true
---

## 1 题目链接

https://verilogoj.ustc.edu.cn/oj/problem/136

## 2 题目要求

### 2.1 题目要求

使用 Verilog 的 `assign` 语句实现一个简单模块，将输入信号 `in` 直接连接到输出信号 `out`。模块名为 `top_module`，输入端口为 `in`，输出端口为 `out`。
![alt text](/assets/images/fpga/3-wire-中科大-verilog-oj/image.png)

### 2.2 题目代码模板

```verilog
module top_module(
  input in, output out
);
  // Write your code here
endmodule
```

## 3 题解

在 Verilog 中，`assign` 语句用于连续赋值，将输入信号直接连接到输出信号。代码如下：

```verilog
module top_module(
  input in, output out
);
  assign out = in; // 将输入 in 直接赋值给输出 out
endmodule
```

## 4 相关知识详解

- **`assign` 语句**：在 Verilog 中，`assign` 用于对线网（wire）类型进行连续赋值。它类似于物理连线，但具有方向性。赋值后，输出会随时跟随输入的变化而变化。
- **模块端口**：模块声明中的 `input` 和 `output` 定义了端口的输入输出方向。本例中，`in` 是输入端口，`out` 是输出端口。
- **连续赋值**：使用 `assign` 语句时，赋值是持续的，而不是在特定事件触发时执行。这适用于组合逻辑设计。

此题目是 Verilog 入门基础，帮助理解简单信号连接和 `assign` 语句的使用。
