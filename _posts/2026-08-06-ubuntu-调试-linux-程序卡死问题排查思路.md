---
title: "Linux 程序卡死问题排查思路"
date: 2026-08-06
last_modified_at: 2026-08-06
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/linux-程序卡死问题排查思路/
toc: true
---

> 以「Nautilus 回收站恢复同名文件卡死」为例，梳理从现象到根因的完整排查流程。


## 实战案例记录
《Nautilus 回收站恢复同名文件导致文件管理器卡死\Nautilus 回收站恢复同名文件导致文件管理器卡死.md》

## 排查流程总览

```
现象：程序无响应，界面冻结
  │
  ├── 第一步：看系统日志有没有报错 ──→ journalctl -f
  │     ├── 有明确报错 → 根据报错定位
  │     └── 无报错 → 继续
  │
  ├── 第二步：看程序自己的日志有没有卡在哪儿 ──→ 带 debug 环境变量启动
  │     ├── 打印出卡在哪一步 → 定位问题
  │     └── 没打印有用信息 → 继续
  │
  ├── 第三步：看程序卡在哪个系统调用 ──→ strace -p PID -f
  │     ├── 停在 read/write/poll → I/O 阻塞
  │     ├── 停在 futex → 线程同步问题（多线程死锁）
  │     └── 反复循环同样的调用 → 死循环
  │
  └── 第四步：拿到所有线程的调用栈 ──→ gdb thread apply all bt
        └── 提交 Bug 报告或进一步分析代码
```

---

## 第一步：journalctl — 看系统有没有报错

**目的**：很多卡死是底层报错导致的（文件系统错误、D-Bus 超时、内存不足等），系统日志能最快给出方向。

**命令**：

```bash
journalctl -f
```

**参数说明**：

- `-f`：实时滚动，像 `tail -f`

**操作**：在执行恢复操作之前打开这个终端，观察卡死瞬间的输出。

**关注的关键词**：`nautilus`、`gnome-shell`、`gvfs`、`tracker-miner`、`segfault`、`timeout`、`error`、`OOM`

**本次案例的结果**：无相关报错，说明不是底层 I/O 错误或崩溃，而是程序逻辑问题。

---

## 第二步：带 Debug 环境变量启动 — 看程序自己的日志

**目的**：很多 Linux GUI 程序基于 GLib/GTK，支持通过环境变量开启调试输出，能看到程序内部执行到了哪一步。

**命令**：

```bash
# 先彻底关闭后台常驻的 nautilus，先使用下面的命令启动，不行再使用该命令关闭后台常驻，因为担心关闭后bug消失
nautilus -q

# 以最高日志级别启动
G_MESSAGES_DEBUG=all nautilus
```

**说明**：

- `G_MESSAGES_DEBUG=all` 是 GLib 程序的通用调试开关，会输出所有 `g_debug()`、`g_message()`、`g_warning()` 等日志
- 不同程序有不同的调试环境变量，常见的有：
  - GTK 程序：`G_MESSAGES_DEBUG=all`、`GTK_DEBUG=interactive`
  - Qt 程序：`QT_LOGGING_RULES="*=true"`
  - GStreamer：`GST_DEBUG=4`

**本次案例的结果**：Nautilus 在恢复操作时没有抛出异常日志，说明问题发生在更底层（系统调用级别）。→ 进入第三步。

---

## 第三步：strace — 看程序卡在哪个系统调用

**目的**：当程序冻结、但日志没有报错时，通常是卡在了某个系统调用上（等待 I/O、等待锁、等待网络等）。strace 能精确告诉你程序在"等什么"。

**命令**：

```bash
# 1. 找到目标进程的 PID
pgrep nautilus

# 2. 用 strace 附加，-f 跟踪所有子线程
sudo strace -p PID -f
```

**参数说明**：

- `-p PID`：附加到指定进程
- `-f`：同时跟踪该进程 fork 出的所有子线程（**排查多线程问题时必须加**）

**操作**：附加 strace 后，执行触发卡死的操作，观察 strace 输出停在哪里。

### 如何解读 strace 输出

**场景 A：停在 `read` / `write` / `poll` / `ppoll` → I/O 阻塞**

```
read(10, <unfinished ...>
```

→ 程序在等某个文件描述符的数据，可能是网络 socket、管道、或普通文件。检查对应的 fd 是什么。

**场景 B：停在 `futex(FUTEX_WAIT, ...)` → 线程同步问题**

```c
// 线程 A
futex(0x7f8d1b22b8, FUTEX_WAIT_PRIVATE, 0, NULL <unfinished ...>

// 线程 B
ppoll([{fd=3}, {fd=6}, {fd=7}], 7, NULL, NULL, 0 <unfinished ...>
```

→ **多线程死锁**。一个线程在等锁，另一个线程在等别的东西，互不相让。

**场景 C：反复不停循环同样的调用 → 死循环**

```
poll([{fd=5, events=POLLIN}], 1, 0) = 0
poll([{fd=5, events=POLLIN}], 1, 0) = 0
poll([{fd=5, events=POLLIN}], 1, 0) = 0
...
```

→ 程序在忙等（busy loop），一直在检查但条件始终不满足。

### 本次案例的 strace 分析

```
工作线程 pid=31203                          主线程 pid=28529
    │                                           │
    ├─ newfstatat("...todesk...deb") = 0        │
    │   目标文件已存在，需要弹"覆盖？"对话框     │
    │                                           │
    ├─ write(5, ...) = 8                        │
    │   通知主线程 ───────────────────────→     │
    │                                         但主线程在 ppoll，不监听 fd5
    │                                           │
    ├─ futex(FUTEX_WAIT)  ← 卡在这里            │
    │   等待主线程回应                          ppoll(NULL) ← 也卡在这里
    │                                           │
    ▼                                           ▼
               互相等待 → 死锁 → SIGKILL
```

**关键发现**：

1. 工作线程 `newfstatat` 成功 → 文件存在，需要弹冲突对话框
2. 工作线程通过 fd5 通知主线程
3. 主线程 `ppoll` 监听的 fd 列表中**不含 fd5**，永远收不到通知
4. 工作线程 `futex_wait` 等主线程回应，主线程 `ppoll` 等 D-Bus 事件，**互相阻塞**

由此可以判断：问题是**线程间通信 + 同步机制设计错误**导致的多线程死锁。

---

## 第四步：gdb 抓取线程堆栈 — 提交 Bug 报告

**目的**：strace 能看到系统调用，但看不到代码调用栈。gdb 能抓取所有线程在代码中的调用路径，是提交 Bug 报告时最有说服力的材料。

**前提**：安装 gdb 和 debug symbol（调试符号能显示函数名和行号）：

```bash
# 安装 gdb
sudo apt install gdb

# 安装 nautilus 的调试符号（Ubuntu）
sudo apt install nautilus-dbgsym
```

**命令**：

```bash
# 1. 附加到目标进程
sudo gdb -p $(pgrep -n nautilus)
```

**操作**：问题发生时，在 gdb 提示符 `(gdb)` 下执行：

```
(gdb) thread apply all bt
```

**参数说明**：

- `thread apply all`：对**所有**线程执行后面命令
- `bt`：backtrace，打印当前线程的调用栈

**输出解读**：每个线程会有一个类似这样的堆栈：

```
Thread 1 (主线程):
  #0  ppoll()                    ← 卡在 ppoll
  #1  g_main_context_iterate()   ← GLib 事件循环
  #2  g_main_loop_run()
  #3  gtk_main()
  ...

Thread 2 (工作线程):
  #0  futex_wait()               ← 卡在 futex
  #1  g_task_run_in_thread_sync()← 同步等待任务完成
  #2  nautilus_file_operations_move_sync()
  #3  ensure_dirs_task_ready_cb()← 回收站恢复的回调函数
  ...
```

> **注意**：附加 gdb 后程序会被暂停（SIGSTOP），排查完后用 `detach` 命令分离，或用 `quit` 退出（程序会被终止）。

---

## 排查工具对比总结

| 工具                      | 适用场景       | 能看到什么                        | 侵入性             |
| ------------------------- | -------------- | --------------------------------- | ------------------ |
| `journalctl -f`           | 第一步快速查看 | 系统级报错、崩溃日志              | 无                 |
| `G_MESSAGES_DEBUG`        | 程序逻辑问题   | 程序自己的调试输出                | 需重启程序         |
| `strace -p PID -f`        | 卡死、无响应   | 系统调用级别：等什么 fd、等什么锁 | 低，可动态附加     |
| `gdb thread apply all bt` | 确定是代码 bug | 代码调用栈、变量值                | 中，附加时程序暂停 |
