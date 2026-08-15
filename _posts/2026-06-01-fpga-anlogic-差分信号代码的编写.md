---
title: "Anlogic 差分信号代码的编写"
date: 2026-06-01
last_modified_at: 2026-06-01
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/anlogic-差分信号代码的编写/
toc: true
---

- 在IO Constraint中，可以看到这些蓝色的线将两个Pin连起来，这种就是差分对
- 其中有一个Pin是P端，另一个是N端
- 只有P端的Pin可以设置IOStandard为差分类型，比如LVDS25、LVDS33
- 一旦设置了P端的Pin为差分类型，N端的Pin就会被锁定，无法编辑，此时生成的adc文件中看不到N端，verilog代码编写的时候，也只需要编写P端的单端代码，芯片会自动转为差分信号
![alt text](/assets/images/fpga/anlogic-差分信号代码的编写/PixPin_2026-06-01_09-21-27.png)

- https://tech.anlogic.com/Cn/Index/index/cate/15/tp/1/p/1.html
