---
title: "rk boot.img （该img含内核kernel）刷写教程"
date: 2025-10-21
last_modified_at: 2025-10-21
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/rk-boot-img-该img含内核kernel-刷写教程/
toc: true
---

1. 进入烧录模式，显示"发现一个LOADER设备"
2. 点击设备分区表，确定设备分区（会报一些分区找不到的错误，没有关系）
3. 点击选择要刷入的boot.img
4. 复选框进行勾选
5. 点击执行，开始烧写
![alt text](/assets/images/对外文档/rk-boot-img-该img含内核kernel-刷写教程/PixPin_2025-09-19_11-17-54.png)

烧写结果在右边的文本框中显示，烧写成功后会自动重启。
