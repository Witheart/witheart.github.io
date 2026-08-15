---
title: "RK 3588 Ubuntu SDK 编译 Linux Header（标头）"
date: 2025-02-25
last_modified_at: 2025-02-25
categories:
  - "Ubuntu SDK 编译指南"
tags:
  - "Ubuntu SDK 编译指南"
permalink: /ubuntu-sdk-编译指南/rk-3588-ubuntu-sdk-编译-linux-header-标头/
toc: true
---

概要：本文介绍了 Linux 标头的概念，以及如何在 RK3588 的 Ubuntu SDK 环境下编译 Linux Header，以支持内核模块（KO）的自编译。  


## 1. 什么是 Linux 标头？  

Linux 标头（Linux Header）是用于开发和编译与内核交互的程序，如内核模块（KO）。如果系统上安装了合适的 Linux 标头，就可以在用户空间编译适用于当前内核的 KO 模块。  

---

## 2. 在 RK3588 编译 Linux Header  

### 2.1 设置交叉编译工具链  

在 RK3588 内核源码路径下，首先需要设置交叉编译工具链的路径：  

```bash
export PATH=$(realpath ../prebuilts/gcc/linux-x86/aarch64/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu/bin):$PATH
```

### 2.2 编译 Linux Header  

使用 `fakeroot` 命令进行编译，确保生成的包具有正确的权限：  

```bash
fakeroot make -j$(nproc) ARCH=arm64 CROSS_COMPILE=aarch64-none-linux-gnu- bindeb-pkg
```

该命令会在SDK根目录下生成 `.deb` 格式的 Linux 头文件包，可以在目标系统上安装，以支持后续的内核模块开发。  

如果出现编译错误，可以先尝试编译一遍内核后，再次尝试编译Linux Header。
