---
title: "lcdparamservice.c"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "HW-T3568安卓源码阅读笔记"
tags:
  - "HW-T3568安卓源码阅读笔记"
permalink: /hw-t3568安卓源码阅读笔记/lcdparamservice-c/
toc: true
---

system/core/lcdparamservice/lcdparamservice.c
https://blog.csdn.net/qq_32645109/article/details/121338840

HW之前在其中增加过读取gpio值设置屏参的函数，目前已弃用。

### 概况
一个自动化更新LCD参数的代码，通过监控u盘上的文件并与NAND中的参数进行比对，从而实现设备的参数更新和重启。

### 关键逻辑
- **文件查找**：使用`busybox find`命令在`/mnt/media_rw/`目录下查找`rk_lcd_parameters`文件。
- **参数更新**：如果文件存在且CRC不同，则解析文件中的参数，更新到`RKNAND_SYS_STORGAE`结构体中，并写入到指定的NAND分区。
- **重启**：更新完成后，调用`reboot`函数重启设备以使新的参数生效。
