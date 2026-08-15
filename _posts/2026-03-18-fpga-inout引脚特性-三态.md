---
title: "inout引脚特性 —— 三态"
date: 2026-03-18
last_modified_at: 2026-03-18
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/inout引脚特性-三态/
toc: true
---

引脚除了被配置为input或者output，还可以配置为inout。

FPGA的INOUT引脚是**双向端口**，其核心特性是通过**三态控制**实现数据方向的动态切换。它既能作为输入也能作为输出，但在同一时刻只能处于一种模式，方向由设计逻辑控制。

## 核心特性

1.  **双向性**：一个引脚可复用为输入或输出，节省引脚资源。
2.  **三态控制**：
    - **输出模式（驱动）**：使能输出，将内部逻辑电平驱动到外部线路上。
    - **输入模式（高阻）**：禁用输出（呈高阻态Z），其内部输出驱动器被“断开”，从外部线路读取数据。

## 示例
```v
module gpio_inout (
    input  wire        clk,
    input  wire        rst_n,
    input  wire        dir,       // 方向控制：1=输出，0=输入
    input  wire        data_out,  // 输出数据
    output reg         data_in,   // 读取到的数据
    inout  wire        gpio       // 双向引脚
);

    // 内部三态控制信号
    assign gpio = (dir) ? data_out : 1'bz;

    // 读取引脚数据
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            data_in <= 1'b0;
        else if (!dir)   // 只有在输入模式才采样
            data_in <= gpio;
    end

endmodule
```
