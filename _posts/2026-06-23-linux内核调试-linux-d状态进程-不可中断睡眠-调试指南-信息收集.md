---
title: "Linux D状态进程（不可中断睡眠）调试指南 —— 信息收集"
date: 2026-06-23
last_modified_at: 2026-06-23
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/linux-d状态进程-不可中断睡眠-调试指南-信息收集/
toc: true
---

- **作者：** 吴思含（Witheart）
- **更新时间：** 2026年6月22日


### 1. 定位系统中所有的 D 状态进程

如果不止一个进程卡住，或者需要查看系统整体的阻塞情况，可以通过 `ps` 命令过滤出所有状态为 `D` 的进程，并打印出它们的“等待通道”（Wait Channel，即当前正在阻塞的内核函数名）。

**推荐使用（带等待通道信息）：**

```bash
ps -eo pid,stat,wchan:32,comm | awk '$2 ~ /^D/ {print $0}'

```

**备用命令（常规格式）：**

```bash
ps aux | awk '$8 ~ /D/ {print $0}'

```

---

### 2. 查看特定进程的内核调用栈

这是目前最重要的一步。如果已经锁定具体的异常进程（例如 PID 为 **7328** 的 `[kworker/u17:1+brcmf_wq/mmc2:0001:11]` 工作队列），可以直接读取 `/proc` 文件系统，查看该进程到底卡在了内核代码的哪一行：

```bash
sudo cat /proc/7328/stack

```

- **预期结果：** 您会看到一串内核函数的调用链（Call Trace）。如果栈顶是类似 `__mmc_claim_host`、`sdio_transfer`，或与电源管理休眠/唤醒相关的函数，就能“石锤”是底层总线或硬件驱动的通信死锁。

---

### 3. 触发系统级“挂起任务”转储 (SysRq)

当系统响应极其迟缓，甚至连 `ps` 命令本身都被阻塞时，可以通过 SysRq（系统魔术键）机制，直接要求内核将进程状态转储到内核日志（dmesg）中。

> **注意：** 直接使用 `sudo echo` 重定向可能会遇到权限问题，建议配合 `tee` 或 `sh -c` 使用。

**导出处于“不可中断睡眠状态”（D 状态）的任务：**

```bash
echo w | sudo tee /proc/sysrq-trigger

```

_触发后，内核会将所有 D 状态进程的详细信息打印出来，可通过 `dmesg` 或查阅 `/var/log/kern.log` 进行分析。_

**导出系统中所有任务的状态（信息量较大）：**

```bash
echo t | sudo tee /proc/sysrq-trigger

```
