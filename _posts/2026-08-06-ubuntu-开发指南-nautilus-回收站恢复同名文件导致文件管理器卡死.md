---
title: "Nautilus 回收站恢复同名文件导致文件管理器卡死"
date: 2026-08-06
last_modified_at: 2026-08-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/nautilus-回收站恢复同名文件导致文件管理器卡死/
toc: true
---

## 参考链接

https://gitlab.gnome.org/GNOME/nautilus/-/work_items/790
https://gitlab.gnome.org/GNOME/nautilus/-/work_items/1396
https://gitlab.gnome.org/GNOME/nautilus/-/commit/ab31018cdaeb1c592e1c46402c5ae1facc503151
https://gitlab.gnome.org/GNOME/nautilus/-/commit/553e59f68bee7e112846696b78794a34281ec1b6

## 问题概述

在 Ubuntu 20.04 (GNOME/Nautilus) 环境下，从回收站恢复文件时，如果目标位置已经存在一个**同名文件**，Nautilus 会直接卡死/冻结，无法弹出"文件已存在，是否覆盖？"的对话框，必须强制结束进程。

**复现步骤：**

1. 打开文件管理器 Nautilus
2. 将一个文件在相同位置复制一份
3. 删除原有的文件
4. 将复制品的名称改为和原有的文件同名
5. 打开回收站，右键点击该文件 → 选择"还原"
6. → Nautilus 冻结，无任何对话框弹出，只能 kill 进程

**影响范围：**

- 与文件大小无关，与文件系统无关（x86、ARM64 均可复现，OVERLAYFS 和普通 ext4 都一样）
- 仅当目标位置存在**同名文件**时触发；若目标位置无同名文件，恢复正常

---

## 调试方式

### journalctl

1. **监控系统日志 (journalctl):** 捕获崩溃瞬间的底层报错.
   在执行恢复操作之前，打开一个终端窗口，实时滚动查看系统日志。这能捕获到 Nautilus 或 GNOME Shell 在卡死瞬间抛出的错误：

```bash
journalctl -f -e

```

观察卡死发生时，是否有与 `nautilus`, `gnome-shell`, `gvfs`, 或 `tracker-miner` 相关的红色报错或超时警告。

### 用debug环境变量启动

- **带 Debug 环境变量启动文件管理器:** 获取应用程序级别的调试输出.
  关闭当前所有的文件管理器窗口，然后通过终端以最高日志级别启动 Nautilus。这样可以清楚地看到它在执行“恢复”操作时卡在了哪一行代码或哪个操作上：

```bash
# 彻底关闭后台驻留的 nautilus
nautilus -q

# 启用所有调试信息的输出并启动
G_MESSAGES_DEBUG=all nautilus

```

### 用strace追踪系统调用

1. **使用 strace 追踪系统调用:** 检查是否发生了 I/O 死锁.
   如果日志没有明显报错，说明程序可能陷入了死循环或 I/O 等待。我们需要追踪它到底在等待什么系统资源。

2. 找到 Nautilus 的进程号 (PID)：

```bash
pgrep nautilus

```

3. 使用 `strace` 附加到该进程（将 `PID` 替换为上面获取的数字）：

```bash
sudo strace -p PID -f

```

执行恢复操作。当它卡死时，`strace` 的输出通常会停留在某个系统调用上（比如停在 `read(...)`, `poll(...)`, 或者长时间卡在访问 `~/.local/share/Trash`）。

### 使用gdb抓取线程堆栈

- **使用 gdb 抓取线程堆栈:** 用于向开发者提交 Bug 报告.
  如果确认为代码级死锁，抓取堆栈信息是解决问题的最终手段：

1. 确保安装了 gdb：`sudo apt install gdb` (Debian/Ubuntu) 或 `sudo dnf install gdb` (Fedora)。
2. 附加到进程：

```bash
sudo gdb -p $(pgrep -n nautilus)

```

3. 当程序卡死时，在 gdb 提示符 `(gdb)` 下输入以下命令打印所有线程的调用栈：

```text
thread apply all bt

```
注意，使用gdb后程序会暂时冻结，需要在问题发生时使用gdb

---

## strace 日志分析

通过 `strace` 追踪 Nautilus 进程，发现以下关键调用链（完整日志见 `log.log`）：

### 线程关系

| PID   | 角色                  | 职责                                  |
| ----- | --------------------- | ------------------------------------- |
| 28529 | **主线程（UI 线程）** | 处理 D-Bus 事件、渲染界面、弹出对话框 |
| 31203 | **工作线程**          | 执行文件移动操作                      |
| 28533 | 其他线程              | 辅助工作                              |

### 死锁调用链

```
行5434: [pid 31203] newfstatat(AT_FDCWD, "/home/user/文档/todesk-v4.7.2.0-arm64.deb", ...)
行5436:     → 返回值 = 0，st_size=43812650  ← 文件已存在！

行5438: [pid 31203] write(5, "\1\0\0\0\0\0\0\0", 8) = 8
         ↑ 工作线程向 fd=5 写入信号，通知主线程"需要弹窗"

行5442: [pid 31203] futex(FUTEX_WAIT_PRIVATE, 0, NULL)  ← 工作线程等主线程回应

行5443: [pid 28529] ppoll([fd=3,6,7,25,26,36,41], ..., timeout=NULL) ← 主线程阻塞
         ↑ 注意：poll 的 fd 列表中不包含 fd=5！主线程收不到工作线程的信号

行5445: [pid 28533] ppoll(NULL) ← 其他线程也在等待

行5451-5459: +++ killed by SIGKILL +++ ← 所有线程被用户强制杀死
```

### 时序图

```
工作线程 (pid 31203)                    主线程/UI (pid 28529)
    │                                        │
    ├─ newfstatat: 目标文件已存在!           │
    ├─ 需要弹窗询问"覆盖或跳过?"            │
    ├─ write(fd5) 通知主线程 ──────────────→ │
    │                                   ┌── ppoll(..., timeout=NULL) 阻塞
    │                                   │   等待 D-Bus 事件，不包含 fd5
    ├─ futex(FUTEX_WAIT) 等待主线程响应  │
    │  (永远不会被唤醒)                  │
    ▼                                   ▼
  双重阻塞 → 死锁 → SIGKILL
```

## gdb 日志分析
```bash
#1  0x0000007fa6398654 in g_cond_wait ()
#3  0x00000055688df838 in copy_move_conflict_ask_user_action ()
```
这行代码的意思是：“在复制/移动（恢复也是一种移动）时遇到同名文件冲突，正在等待用户选择操作”。

---

## 根因分析
明白了大概的原因，在其他架构的机器上尝试复现，也可以复现，那基本可以确定是软件原有的bug。

### 通俗解释

Nautilus 中有两个"工人"：

- **经理（主线程）**：负责跟用户交互——显示窗口、弹出对话框、响应点击
- **搬运工（工作线程）**：负责实际搬文件——复制、移动、删除

**正常流程（异步 async）**：经理让搬运工去搬文件，自己继续处理 UI 事件。搬运工遇到同名文件时，回来找经理："要覆盖吗？"经理弹出对话框，用户点击后告诉搬运工继续。一切顺利。

**Bug 流程（同步 sync）**：经理让搬运工去搬文件，然后**站在那儿傻等**搬运工搬完。搬运工遇到同名文件回来找经理，经理说"你不是在搬文件吗？我在等你搬完啊！"搬运工说"你不给我指示我没法继续！"——**互相等，卡死**。

### 代码层面

问题出在 `src/nautilus-file-utilities.c` 中的 `ensure_dirs_task_ready_cb` 回调函数。

**引入 bug 的 commit `ab31018c`**（2018-05-27，Alexandru Fazakas）：
https://gitlab.gnome.org/GNOME/nautilus/-/commit/ab31018cdaeb1c592e1c46402c5ae1facc503151
该 commit 的标题是"添加测试"，但实际上同时也修改了生产代码。它将原有的文件移动函数拆分成了两个版本：

| 函数                                  | 底层实现                    | 行为                               |
| ------------------------------------- | --------------------------- | ---------------------------------- |
| `nautilus_file_operations_move_sync`  | `g_task_run_in_thread_sync` | **阻塞调用线程**直到操作完成       |
| `nautilus_file_operations_move_async` | `g_task_run_in_thread`      | 在后台线程执行，**不阻塞调用线程** |

其他调用文件移动的地方（`nautilus-file-operations.c`、`nautilus-file-undo-operations.c`）都正确改成了 `_async`，唯独回收站恢复这里被**错误地**改成了 `_sync`：

```diff
// ab31018c 中 src/nautilus-file-utilities.c 的第 303-304 行：
-        nautilus_file_operations_move
+        nautilus_file_operations_move_sync    // ← BUG! 应该是 _async
             (locations,
             original_dir_location,
             data->parent_window,
```

**死锁机制：**

`_sync` 版本调用 `g_task_run_in_thread_sync`，它会：

1. 在工作线程中执行文件移动
2. **阻塞调用线程（即主线程/UI 线程）**，直到操作完成

当工作线程发现目标文件已存在，需要弹出"是否覆盖？"对话框时，对话框的创建和显示**必须由主线程完成**。但主线程正被 sync 调用阻塞着，无法处理任何 UI 事件，于是工作线程永远得不到回复，形成死锁。

### 核心矛盾

```
sync 阻塞主线程 ←→ 工作线程需要主线程弹出对话框 ← 死锁
```

---

## 修复方案

### 修复 commit `553e59f`

https://gitlab.gnome.org/GNOME/nautilus/-/commit/553e59f68bee7e112846696b78794a34281ec1b6

- **标题**：`file-utilities: Don't block main thread to restore from trash`
- **上游 Issue**：Nautilus GitLab #790
- **Issue 描述**：`Freeze when restoring file from trash if file with same name and location exists`
- **修复行数**：仅 -3 / +4 行

```diff
// 553e59f 中 src/nautilus-file-utilities.c 的改动：
-        nautilus_file_operations_move_sync
-            (locations,
-            original_dir_location);
+        nautilus_file_operations_move_async (locations,
+                                             original_dir_location,
+                                             data->parent_window,
+                                             NULL, NULL, NULL);
```

就是把这一个错误的 `_sync` 调用改回 `_async`，让主线程不再被阻塞，能够正常处理冲突对话框。
