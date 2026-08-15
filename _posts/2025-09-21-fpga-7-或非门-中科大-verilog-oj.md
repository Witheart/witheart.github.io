---
title: "7 或非门 —— 中科大 Verilog OJ"
date: 2025-09-21
last_modified_at: 2025-09-21
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/7-或非门-中科大-verilog-oj/
toc: true
---

## 1 题目链接

https://verilogoj.ustc.edu.cn/oj/problem/54

## 2 题目要求

### 2.1 题目要求

创建一个 Verilog 模块，实现或非门的逻辑功能。模块名为 `top_module`，有两个 1 位输入 `a` 和 `b`，一个 1 位输出 `out`。要求使用 `assign` 语句实现逻辑。

![alt text](/assets/images/fpga/7-或非门-中科大-verilog-oj/image.png)
![alt text](/assets/images/fpga/7-或非门-中科大-verilog-oj/PixPin_2025-09-21_20-51-31.png)

### 2.2 题目代码模板

```verilog
module top_module(
    input a,
    input b,
    output out );
    // 请用户在下方编辑代码

    // 用户编辑到此为止
endmodule
```

## 3 题解

以下是实现或非门的 Verilog 代码，使用 `assign` 语句直接赋值逻辑表达式。

```verilog
module top_module(
    input a,
    input b,
    output out );
    // 请用户在下方编辑代码
    assign out = ~(a | b);
    // 用户编辑到此为止
endmodule
```

代码解释：

- `assign out = ~(a | b);` 这一行实现了或非门逻辑。`a | b` 表示 a 和 b 的或操作，`~` 表示取反，因此整体是或非操作。
- 该代码符合题目要求，使用 `assign` 语句进行连续赋值。
