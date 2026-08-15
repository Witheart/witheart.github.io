---
title: "rk gpu 显卡 mali 跑分指南"
date: 2025-06-19
last_modified_at: 2025-06-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk-gpu-显卡-mali-跑分指南/
toc: true
---

- 安装跑分工具
```sh
sudo apt install glmark2-es2
```

- 运行基准测试
```sh
glmark2-es2
```
![alt text](/assets/images/ubuntu-开发指南/rk-gpu-显卡-mali-跑分指南/PixPin_2025-06-19_10-12-58.png)


如果显卡驱动正常，将会显示显卡（如Mali-G610）并进行跑分测试，rk3588跑分得分1000左右。
