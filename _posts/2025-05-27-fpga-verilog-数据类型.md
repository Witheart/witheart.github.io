---
title: "Verilog 数据类型"
date: 2025-05-27
last_modified_at: 2025-05-27
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/verilog-数据类型/
toc: true
---

概要：本文介绍了 Verilog 中常用的数据类型，包括 wire、reg、向量、整数、实数以及参数的使用方式与综合行为，结合代码示例说明不同类型在设计中的作用及区别。


## 1. 两种重要类型：wire 与 reg

### 1.1 wire 类型  

- 表示硬件单元之间的物理连线  
- 用于模块间的连接或组合逻辑的信号传递  
- 输入改变时，wire 变量立刻改变

示例：

```verilog
module and_gate (input a, b, output c);
    assign c = a & b; // c必须声明为wire（或默认）
endmodule
```

### 1.2 reg 类型  

- 用于在过程块（always 或 initial）中保存值  
- 只能在过程块中赋值  
- 综合时不一定综合为寄存器，取决于触发条件  

**综合为组合逻辑电路的情况**（电平敏感的 always 块）：

```verilog
module and_gate (input A, B, output reg Y);
    always @(*) begin     // 电平敏感（组合逻辑）
        Y = A & B;       // 虽然Y是reg，但综合后还是与门！
    end
endmodule
```

**综合为寄存器的情况**（边沿触发的 always 块）：

```verilog
module flip_flop (input clk, d, output reg q);
    always @(posedge clk) begin
        q <= d; // q必须声明为reg，且会被综合为触发器
    end
endmodule
```

---

## 2. 向量类型

当位宽大于 1 时，wire 或 reg 可以声明为向量形式：

```verilog
wire [8:2]     addr ;       // 声明7bit位宽的线型变量addr，位宽范围为8:2
wire [32-1:0]  gpio_data ;  // 声明32bit位宽的线型变量gpio_data
```

---

## 3. 整数类型

- 使用 integer 声明  
- 是有符号数  
- 综合后不生成实际硬件电路

```verilog
integer j ;
```

---

## 4. 实数类型

- 使用 real 声明

```verilog
real data1 ;
```

---

## 5. 参数（parameter）

- 用于表示常量  
- 用关键字 parameter 声明，只能赋值一次

```verilog
parameter data_width = 10'd32 ;
```
