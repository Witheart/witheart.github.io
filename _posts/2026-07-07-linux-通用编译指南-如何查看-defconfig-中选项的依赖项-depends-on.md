---
title: "如何查看 defconfig 中选项的依赖项 depends on"
date: 2026-07-07
last_modified_at: 2026-07-07
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/如何查看-defconfig-中选项的依赖项-depends-on/
toc: true
---

## 方式1
直接在内核driver目录下的kconfig中寻找

## 方式2
- 进入内核目录
- make menuconfig
- 按下/，输入要搜索的选项（记得去掉前面的CONFIG_），回车
- 可以方便地查看depends on
