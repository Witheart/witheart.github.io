---
title: "rk rootfs.img 刷写教程"
date: 2025-10-27
last_modified_at: 2025-10-27
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/rk-rootfs-img-刷写教程/
toc: true
---

1. 设备按住烧录键复位，上电，等待烧录工具上显示“发现一个LOADER设备”
2. 点击“设备分区表”，确定设备分区（会报一些分区找不到的错误，没有关系）
3. 右侧会显示找到的各个分区的开始地址，找到rootfs分区的地址，在左侧找一个不使用的分区，填入地址和名字
4. 选择要烧录的rootfs.img，勾选复选框
5. 点击“执行”开始烧录

![alt text](/assets/images/对外文档/rk-rootfs-img-刷写教程/PixPin_2025-10-27_13-59-23.png)

注意，rootfs.img必须下载到本地进行烧录，否则烧录可能会报错。
