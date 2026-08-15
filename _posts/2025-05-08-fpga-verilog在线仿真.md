---
title: "Verilog在线仿真"
date: 2025-05-08
last_modified_at: 2025-05-08
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/verilog在线仿真/
toc: true
---

## 1. 网站
[仿真网站：edaplayground](https://www.edaplayground.com/)

## 2. 仿真设置
- 如下图进行设置
![alt text](/assets/images/fpga/verilog在线仿真/image.png)

- 波形导出代码：
```verilog
$dumpfile("dump.vcd");  // 指定波形文件名
$dumpvars(0, test);     // 记录 test 模块的所有信号
```

## 3. 波形结果
![alt text](/assets/images/fpga/verilog在线仿真/image-1.png)
