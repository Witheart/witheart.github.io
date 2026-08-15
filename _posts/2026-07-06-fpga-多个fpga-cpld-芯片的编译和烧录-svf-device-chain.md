---
title: "多个FPGA(CPLD)芯片的编译和烧录(svf)(device chain)"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/
toc: true
---

## 1 分别编译

- 先使用TD软件分别打开工程
- 分别编译
  ![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-38-25.png)

- 编译完成后，每个工程都会在其根目录的`BS01MBK3_CPLD1\td_project\BS01MBK3_CPLD_Runs\best_result`下，生成一个bit文件，该bit文件可用于单个芯片的烧录

- 如果需要多个芯片级联烧录，需要进行下面的步骤

## 2 生成SVF

![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-40-44.png)

- 点击Add添加bit文件，然后点击Create SVF生成SVF文件
  ![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-41-17.png)

- 选择SVF for SPI(烧录到FLASH中，如果选择SRAM则断电消失)，然后点击OK生成
  ![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-42-00.png)

- 生成后的SVF位于`BS01MBK3_CPLD1\td_project\al_devicechain`下

## 3 合成单一SVF

上一步对不同的工程的bit文件生成了不同的SVF文件，如果要进行级联烧录，需要将SVF合并：
![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-44-13.png)

- 点击Add添加要合并的SVF
- 点击Browse...设定合并后的SVF的名称和路径
- 点击Merge进行合并，合并成功会提示Success
  ![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-44-37.png)

## 4 烧录单一SVF

- 选择上一步生成的单一SVF进行烧录
  ![alt text](/assets/images/fpga/多个fpga-cpld-芯片的编译和烧录-svf-device-chain/PixPin_2026-07-06_09-45-51.png)
