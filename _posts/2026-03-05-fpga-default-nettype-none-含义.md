---
title: "default_nettype none 含义"
date: 2026-03-05
last_modified_at: 2026-03-05
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/default-nettype-none-含义/
toc: true
---

- verilog 文件开头
```verilog
`default_nettype none
```

- 这是编译器指令，不是可综合的硬件代码。它要求编译器将所有未声明的连线类型视为错误，而不是默认的wire类型。
- 这是一种良好的编码习惯，可以避免因拼写错误等意外创建出隐式网络（导线）而导致的难以调试的问题。
