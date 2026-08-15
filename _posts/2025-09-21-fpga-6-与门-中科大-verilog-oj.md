---
title: "6 与门 —— 中科大 Verilog OJ"
date: 2025-09-21
last_modified_at: 2025-09-21
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/6-与门-中科大-verilog-oj/
toc: true
---

## 1 题目链接

https://verilogoj.ustc.edu.cn/oj/problem/86

---

## 2 题目要求

### 2.1 题目要求

要求实现一个与门（AND gate）的 Verilog 模块。模块需要有两个输入端口 `a` 和 `b`（均为 1 位宽），一个输出端口 `out`（1 位宽）。输出 `out` 应为输入 `a` 和 `b` 的逻辑与运算结果。
![alt text](/assets/images/fpga/6-与门-中科大-verilog-oj/image.png)
![alt text](/assets/images/fpga/6-与门-中科大-verilog-oj/PixPin_2025-09-21_20-46-44.png)

### 2.2 题目代码模板


```verilog
module top_module(
    input a,
    input b,
    output out);
    // 请用户在下方编辑代码

    // 用户编辑到此为止
endmodule
```


---

## 3 题解

以下是实现与门逻辑的 Verilog 代码。使用 `assign` 语句将输出 `out` 设置为 `a` 和 `b` 的位与运算结果。

```verilog
module top_module(
    input a,
    input b,
    output out);
    // 请用户在下方编辑代码
    assign out = a & b;
    // 用户编辑到此为止
endmodule
```

**代码解释**：

- `assign out = a & b;`：这行代码使用连续赋值语句，将 `out` 信号始终设置为 `a` 和 `b` 的逻辑与值。当 `a` 或 `b` 变化时，`out` 会立即更新。
- 这种实现方式符合组合逻辑的要求，无需时钟信号，输出直接响应输入变化。
