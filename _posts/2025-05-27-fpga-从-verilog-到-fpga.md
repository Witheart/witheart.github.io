---
title: "从 verilog 到 FPGA"
date: 2025-05-27
last_modified_at: 2025-05-27
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/从-verilog-到-fpga/
toc: true
---

将 Verilog 代码烧录到 FPGA 中，需要经过一系列工具链处理，本文介绍了流程中的各个节点。


### **流程总结**
```plaintext
Verilog代码 → 仿真验证 → 综合 → 实现（布局布线） → 生成比特流 → 烧录到FPGA
```

### **1. 设计输入（Design Entry）**
- **目标**：用硬件描述语言（Verilog/VHDL）编写代码，描述电路功能。
- **内容**：  
  - 模块化设计（顶层模块 + 子模块）
  - 组合逻辑、时序逻辑（如 `always @(*)` 或 `always @(posedge clk)`）
  - 约束文件（如 `.xdc` 文件）：定义时钟频率、引脚分配、时序约束等。

---

### **2. 仿真验证（Simulation）**
- **目标**：验证代码逻辑是否正确，确保设计符合预期。
- **工具**：ModelSim、VCS、Verilator 等。
- **流程**：  
  - 编写测试平台（Testbench），模拟输入信号。
  - 观察波形（如时序逻辑的延迟、状态机跳转）。
  - **注意**：仿真中的延时（如 `#5`）仅用于验证，不参与后续综合。

---

### **3. 综合（Synthesis）**
- **目标**：将 Verilog 代码转换为 FPGA 可识别的门级网表（逻辑电路）。
- **工具**：Xilinx Vivado、Intel Quartus、Synopsys Synplify 等。
- **输出**：  
  - 网表文件（`.edf` 或 `.vg`）：描述逻辑门、触发器的连接关系。
  - 资源使用报告（LUT、寄存器、内存等）。
- **关键点**：  
  - 综合工具会优化逻辑（如合并冗余代码）。  
  - **不可综合代码**（如 `initial`、`#delay`）会被忽略或报错。

---

### **4. 实现（Implementation）**
- **目标**：将网表映射到 FPGA 的物理资源（布局布线）。
- **阶段**：  
  1. **翻译（Translate）**：合并所有设计文件和约束。  
  2. **映射（Map）**：将逻辑门映射为 FPGA 的查找表（LUT）、寄存器等资源。  
  3. **布局布线（Place & Route）**：  
     - **布局**：确定逻辑单元在 FPGA 芯片上的物理位置。  
     - **布线**：连接逻辑单元之间的信号路径。  
  4. **时序分析（Timing Analysis）**：验证设计是否满足时钟约束（如建立时间、保持时间）。
- **输出**：  
  - 布局布线后的物理设计文件（`.ncd` 或 `.dcp`）。  
  - 时序报告（关键路径延迟、时钟余量）。

---

### **5. 生成比特流（Bitstream Generation）**
- **目标**：将布局布线后的设计转换为 FPGA 可加载的二进制文件。
- **工具**：Vivado/Quartus 的 Bitstream Generator。  
- **输出**：  
  - 比特流文件（`.bit` 或 `.sof`）：包含 FPGA 配置信息（逻辑资源、互联、时钟等）。

---

### **6. 烧录（Programming）**
- **目标**：将比特流文件下载到 FPGA 芯片中。
- **方法**：  
  - **JTAG 调试器**（如 Xilinx Platform Cable、USB-Blaster）。  
  - **Flash 固化**：将比特流写入 FPGA 的配置存储器（断电不丢失）。
- **验证**：通过实际硬件测试功能是否正常。
