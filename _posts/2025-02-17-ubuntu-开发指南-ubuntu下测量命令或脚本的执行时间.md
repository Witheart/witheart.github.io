---
title: "Ubuntu下测量命令或脚本的执行时间"
date: 2025-02-17
last_modified_at: 2025-02-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu下测量命令或脚本的执行时间/
toc: true
---

`time` 命令用于测量命令的执行时间，在 Linux 和 macOS 终端中非常有用。它可以显示程序运行所消耗的 **总时间、用户 CPU 时间和系统 CPU 时间**。


## **1. 基本使用**
```bash
time command
```
示例：
```bash
time ls -l
```
这个命令会执行 `ls -l` 并测量它的执行时间。

---

## **2. 解析 `time` 输出**
运行 `time ls -l` 后，可能得到类似的输出：
```
real    0m0.003s
user    0m0.001s
sys     0m0.002s
```
解释：
- **real**：命令执行的 **总时间**（包括 CPU 执行时间和等待 I/O、进程调度等耗时）。
- **user**：在 **用户模式（User Mode）** 下运行的 CPU 时间（不包括内核时间）。
- **sys**：在 **内核模式（Kernel Mode）** 下运行的 CPU 时间（即系统调用的时间）。

---

## **3. 使用 `time` 统计脚本执行时间**
```bash
time bash my_script.sh
```
或者：
```bash
time python my_script.py
```
用于测试脚本的运行时间。

---

## **4. 使用 `time` 保存输出**
如果你想把 `time` 的结果保存到文件：
```bash
(time ls -l) 2> time_output.txt
```
因为 `time` 的输出默认是写到 **标准错误（stderr）**，所以必须用 `2>` 重定向到文件。
