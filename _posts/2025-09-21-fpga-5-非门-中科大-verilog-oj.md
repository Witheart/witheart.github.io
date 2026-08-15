---
title: "5 非门 —— 中科大 Verilog OJ"
date: 2025-09-21
last_modified_at: 2025-09-21
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/5-非门-中科大-verilog-oj/
toc: true
---

## 1 题目链接
https://verilogoj.ustc.edu.cn/oj/problem/35

## 2 题目要求
### 2.1 题目要求
创建一个名为 `top_module` 的 Verilog 模块，实现非门（NOT gate）的功能。非门的功能是输出与输入信号相反的值。即，当输入为高电平时，输出为低电平；当输入为低电平时，输出为高电平。
![alt text](/assets/images/fpga/5-非门-中科大-verilog-oj/PixPin_2025-09-21_20-42-12.png)

### 2.2 题目代码模板
```verilog
module top_module( input in, output out );
// 请用户在下方编辑代码

//用户编辑到此为止
endmodule
```

## 3 题解
以下是实现非门的 Verilog 代码。使用连续赋值语句将 `out` 设置为 `in` 的取反。

```verilog
module top_module( input in, output out );
    // 实现非门
    assign out = ~in;
endmodule
```

## 4 相关知识详解
在 Verilog 中，使用 `~` 运算符表示按位取反。
