---
title: "Ubuntu 下使用 stress命令进行压力测试"
date: 2025-02-17
last_modified_at: 2025-02-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下使用-stress命令进行压力测试/
toc: true
---

stress 命令是一款用于 Linux 系统的压力测试工具，可以用于 CPU、内存、I/O 和磁盘的老化测试。

## 1. 安装 `stress`
使用以下命令安装 `stress`：
  ```bash
  sudo apt update && sudo apt install stress -y
  ```

## 2. `stress` 命令的基本用法
`stress` 的基本语法如下：
```bash
stress --cpu <num> --io <num> --vm <num> --vm-bytes <size> --hdd <num> --timeout <time>
```
其中：
- `--cpu <num>`：启动 `<num>` 个计算密集型进程，模拟 CPU 压力。
- `--io <num>`：启动 `<num>` 个 I/O 负载进程，模拟磁盘 I/O 压力。
- `--vm <num>`：启动 `<num>` 个内存负载进程，模拟内存压力。
- `--vm-bytes <size>`：每个 `--vm` 进程分配 `<size>` 大小的内存（如 `500M`）。
- `--hdd <num>`：启动 `<num>` 个磁盘写入进程。
- `--timeout <time>`：运行 `<time>` 时间后自动停止，如 `60s`。
<br/>
- stress 中，数字可以后缀为 s，m，h，d，y（时间）或 B，K，M，G（大小）。
<br/>
- 注意：stress 进行内存压力测试时，如果你发现内存进程 (--vm) 并没有持续占用设定的内存大小，而是周期性地消失和重新出现，这是由于 stress 的工作机制导致的。默认情况下，stress 的 --vm 进程会分配内存，然后释放它，从而导致你看到的内存占用波动。可以使用 `--vm-keep` 选项，使 stress 分配的内存不会被释放，而是持续占用。
---

## 3. 进行老化测试的示例

### **3.1 CPU 老化测试**
让 CPU 满载，持续 10 分钟：
```bash
stress --cpu 4 --timeout 600
```
> 这里 `--cpu 4` 代表使用 4 个 CPU 线程，`--timeout 600` 代表运行 600 秒（10 分钟）。

### **3.2 内存老化测试**
使用 2 个内存压力进程，每个进程分配 500MB，持续 10 分钟：
```bash
stress --vm 2 --vm-bytes 500M --timeout 600
```
> 这个命令会让系统持续占用 1GB 内存，用于测试内存稳定性。

### **3.3 I/O 老化测试**
模拟 I/O 读写压力：
```bash
stress --io 4 --timeout 600
```
> 这里 `--io 4` 代表使用 4 个 I/O 线程进行读写操作，持续 10 分钟。

### **3.4 磁盘老化测试**
模拟磁盘写入压力：
```bash
stress --hdd 2 --timeout 600
```
> `--hdd 2` 代表使用 2 个进程不断地写入临时文件，持续 10 分钟。

---

## 4. 组合老化测试
综合 CPU、内存、I/O 和磁盘压力，模拟高负载环境：
```bash
stress --cpu 4 --vm 2 --vm-bytes 500M --io 2 --hdd 2 --timeout 600
```
> 这个命令：
> - 运行 4 个 CPU 线程
> - 运行 2 个内存线程，每个占用 500MB
> - 运行 2 个 I/O 线程
> - 运行 2 个磁盘写入线程
> - 持续 10 分钟

---

## 5. 监控系统状态
在运行 `stress` 进行老化测试时，可以使用以下命令监控系统状态：
- **CPU 负载**：
  ```bash
  top
  ```
  或者：
  ```bash
  htop
  ```
- **内存使用情况**：
  ```bash
  free -h
  ```
- **磁盘 I/O 监控**：
  ```bash
  iostat -x 1
  ```
- **系统日志（查看是否有错误日志）**：
  ```bash
  dmesg -T
  ```
