---
title: "Anlogic FPGA 开发板LED闪烁学习工程建立与下载"
date: 2026-01-30
last_modified_at: 2026-01-30
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/
toc: true
---

## 设计
通过功能拆分为几个模块，明确需要什么输入和输出。
对于LED闪烁功能：
- 时钟输出
- LED输出

## 文件结构
- top.v文件负责实例化所以其他的功能模块，并将输入输出正确连接
- blink.v负责实现led闪烁功能

## 建立并添加源文件
- 找一个demo文件，在TD里面将原有的源文件都remove掉
- 添加上面提到的两个源文件，内容如下
![alt text](/assets/images/fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/PixPin_2026-01-30_15-47-44.png)
`blink.v`
```verilog
module blink (
    input wire I_clk,
    output reg led
);
    reg led = 1'b0;
    reg [24:0] cnt = 25'd0;
    always @(posedge I_clk) begin
        if(cnt == 25'd24_999_999)begin
            led <= ~led;
            cnt <= 25'd0;
        end
        else
            cnt <= cnt + 1'b1;
    end

endmodule
```

`top.v`
```verilog
//输入 时钟
//输出 LED

`timescale  1 ps / 1 ps

module top (
    input wire sys_clk,
    output wire led
);

blink u_blink(
    .I_clk(sys_clk),
    .led(led)
);
    
endmodule
```

- 添加后要设置顶层文件
![alt text](/assets/images/fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/PixPin_2026-01-30_15-48-12.png)

## 添加约束
### adc约束
用于绑定引脚和名称，并指定引脚的各种电气属性
- 首先Read Design
- 然后可以双击IO Constraint，进入可视化的约束界面
![alt text](/assets/images/fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/PixPin_2026-01-30_15-50-24.png)

- 可以直接拖动到焊盘上面
![alt text](/assets/images/fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/PixPin_2026-01-30_15-50-53.png)

### sdc约束(Synopsys Design Constraints)
用于告诉编译工具，该电路设计期望以什么时序工作，这样工具在综合优化的时候会考虑该约束。
- 首先Optimize RTL
- 然后可以双击SDC Constraint，进入可视化的约束界面
![alt text](/assets/images/fpga/anlogic-fpga-开发板led闪烁学习工程建立与下载/PixPin_2026-01-30_16-00-41.png)
- 填写完成后会生成指令

## 编译
点击RUN，如果报找不到前面删除的那些源文件的错误，那么需要把编译生成的内容全部清除掉，并且用记事本打开工程文件（.al），将其中不用的源文件项目去掉后重新编译。

## 下载
参考《Anlogic UG003_AL-LINK 下载器使用说明》。
