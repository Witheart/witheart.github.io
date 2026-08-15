---
title: "rk3588 Android15 编译报错 BTF .tmp_vmlinux.btf pahole (pahole) is not available Failed to generate BTF for vmlinux"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/rk3588-android15-编译报错-btf-tmp-vmlinux-btf-pahole-pahole-is-not-available-failed-to-generate-btf-for-vmlinux/
toc: true
---

## 问题描述
首次编译RK3588 Android15镜像时，报错
```bash
BTF: .tmp_vmlinux.btf: pahole (pahole) is not available
Failed to generate BTF for vmlinux
Try to disable CONFIG_DEBUG_INFO_BTF
make[2]: *** [scripts/Makefile.vmlinux:34: vmlinux] Error 1
make[1]: *** [Makefile:1314: vmlinux] Error 2
make[1]: *** Waiting for unfinished jobs....
```

## 解决方式
```bash
sudo apt update
sudo apt install dwarves  # pahole 包含在 dwarves 包中
```

## 问题解析
编译 Linux 内核时需要生成 BTF（BPF Type Format）信息，但系统缺少 pahole工具，这是一个从 DWARF 调试信息生成 BTF 的工具。BTF 是一种调试信息格式，主要用于增强 eBPF 程序的调试和性能分析功能。

```mermaid
graph TD
    A[C Source Code<br/>内核源码] --> B[GCC / Clang 编译]
    
    B --> C[vmlinux ELF]
    B --> D[DWARF<br/>调试信息]
    
    D -->|解析| E[pahole]
    E -->|生成| F[BTF<br/>BPF Type Format]
    
    F -->|嵌入| C
    
    C -->|包含 BTF| G[Linux Kernel]
    
    G -->|类型信息| H[eBPF / BPF 程序]
    
    H -->|CO-RE / 验证| F

```
