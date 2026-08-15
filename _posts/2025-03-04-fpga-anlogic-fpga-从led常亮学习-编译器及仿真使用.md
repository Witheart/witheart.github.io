---
title: "Anlogic FPGA 从LED常亮学习 编译器及仿真使用"
date: 2025-03-04
last_modified_at: 2025-03-04
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/
toc: true
---

概要：本文介绍了如何在 Anlogic FPGA 开发环境中，新建 TD 工程、编写 Verilog 代码、使用 ModelSim 进行仿真，并最终完成管脚绑定。  

## 0. 环境介绍
两个工具
- TD_5.6.5_Release 用于代码编写、编译、烧录
- ModelSim 用于仿真

## 1. 新建 TD 工程  

### 1.1 新建工程文件夹  
![工程文件夹结构](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-1.png)  

- **Project**：用于存放工程文件  
- **Source**：用于存放源码  
- **Sim**：用于存放仿真相关文件  
- **Doc**：用于存放文档  

### 1.2 新建工程  
**步骤**：   
1. 选择 **Prject -> New Project...**  
2. 将工程文件存放在 **Project** 文件夹中  

![工程设置](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image.png)  

### 1.3 新建源码文件  
1. **创建 Verilog 文件**：  
   - 选择 **File -> New**  
   - 填写内容后，按 `Ctrl + S` 保存到 **Source** 文件夹  
   - **文件名需与模块名一致**  

示例：  

如果模块定义如下：  
```verilog
module led_on();
endmodule
```
那么文件名应为 `led_on.v`。

一般仿真用的激励文件采用 `模块名_tb` 命名，例如：  
- `led_on.v`（LED_ON 模块）  
- `led_on_tb.v`（仿真测试文件）  

### 1.4 编写代码  

**led_on.v**  
```verilog
module led_on(
    output led
);
assign led = 1'b0;
endmodule
```

**led_on_tb.v**  
```verilog
`timescale 1ns/1ps
module led_on_tb();
led_on Uled_on(
    .led(led)
);
endmodule
```

---

## 2. ModelSim 仿真  

### 2.1 新建工程  
1. 打开 **ModelSim**  
2. 选择 **File -> New -> Project...**  
3. 将工程存放在 **Sim** 文件夹，命名为 `led_on_tb`  

**添加 Verilog 文件到工程**：  
- 点击 **Add Existing File**，将 `led_on.v` 和 `led_on_tb.v` 添加进来  
- 添加后，未编译的文件显示问号，编译完成后则打勾  

![添加文件到工程](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-2.png)  
![添加完成的样子](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-3.png)  

### 2.2 编译  
点击 **编译按钮**：  
![编译按钮](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-4.png)  

### 2.3 仿真  
1. 选择 **Simulate -> Start Simulate...**  
2. 选择 `led_on_tb` 测试文件  
3. **取消“优化”勾选**  
4. 点击 **OK**  
![仿真设置](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-5.png)

**可能遇到的错误**：  
```
# Error loading design
```
**解决方案**：  
- 检查路径是否包含中文或空格  
- 若仍然报错，尝试从其他地方运行仿真  

![从其他地方运行仿真](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-6.png)  

### 2.4 观察波形  
如果仿真成功，会弹出如下窗口：  
![仿真窗口](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-7.png)  

**添加信号到波形窗口**：  
1. 打开 **Wave 窗口**（默认在右侧）  
2. 添加信号后，独立出波形窗口并放大  
![添加信号](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-8.png)
![独立的波形窗口](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-9.png)
3. 先终止仿真：**Simulate -> Break**  
4. 再次运行仿真，在命令行中输入：  
   ```
   run 1ms
   ```
5. 观察波形：  
   ![波形](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-10.png)  

---

## 3. 添加 .v 文件到 TD 工程中  

1. 选择 **Add Source**  
   ![Add Source](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-11.png)  
2. 选择 **Add files**  
   ![Add files](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-12.png)  

---

## 4. 绑定管脚  

### 4.1 进入 IO 绑定界面  
![IO Constraint](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-13.png)  

**注意**：  
- 如果 **“Read Design”** 按钮反白无法点击，需要 **先双击 Read Design**  

### 4.2 绑定管脚  
1. 输入管脚编号  
2. 选中的管脚会高亮显示（蓝色）  
3. **保存**到 `Source` 文件夹下，命名为 `led_on`  

**保存后生成的文件**：  
- **`.adc` 文件**（描述管脚绑定关系）  

![绑定管脚](/assets/images/fpga/anlogic-fpga-从led常亮学习-编译器及仿真使用/image-14.png)  

---

以上就是使用 **Anlogic FPGA** 进行 LED 常亮实验的完整流程，包括 **TD 工程创建、Verilog 编写、ModelSim 仿真和管脚绑定**。
