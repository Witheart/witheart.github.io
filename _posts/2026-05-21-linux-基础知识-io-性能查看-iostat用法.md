---
title: "IO 性能查看 —— iostat用法"
date: 2026-05-21
last_modified_at: 2026-05-21
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/io-性能查看-iostat用法/
toc: true
---

## 1 `iostat` 是什么？

`iostat`（I/O statistics）是 **sysstat** 工具包中的一个命令，用于查看：

- **CPU 使用情况**
- **磁盘 / 块设备的 I/O 性能**

非常适合用来排查：

- 磁盘是否成为性能瓶颈
- I/O 等待是否过高
- 读写吞吐、延迟、利用率是否合理

## 2 安装方式

```bash
sudo apt update

sudo apt install sysstat
```

## 3 使用方式

```bash
iostat -x -h 2
```

-x表示查看扩张参数
-h表示Human-readable

## 4 输出解析
两个方面：占用率和延迟等待的时间

### 4.1 `%iowait` —— 等待IO占用的百分比

- **含义**：CPU 在**空闲**状态下，等待未完成的磁盘 I/O 请求占用的时间百分比。
- **怎么看**：你如果这个值长期**超过 20% 甚至更高**，说明磁盘已经拖了系统的后腿，CPU 都在闲逛等数据。

### 4.2 利用率

- **`aqu-sz` (Average Queue Size)**：平均 I/O 队列长度。也就是积压在手里没处理完的请求数。
- **`%util`**：磁盘有 I/O 请求处于活动状态的时间百分比（带宽利用率）。

## 4.3 延迟 —— 最核心指标

- **`r_await` & `w_await**`：一个读/写操作从发出到结束**总共花费的时间**（单位是毫秒 ms），包括了排队时间和磁盘真正处理的时间。
- **怎么看**：
- 一般来说，SSD 的延迟应该在几毫秒以内；机械硬盘在 10-20ms 左右。
- 实测EMMC：`r_await` 是 **1.18ms**（挺快），但 `w_await` 达到了 **41.35ms**，符合EMMC写入慢的特性
