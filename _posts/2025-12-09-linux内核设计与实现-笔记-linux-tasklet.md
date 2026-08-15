---
title: "Linux tasklet"
date: 2025-12-09
last_modified_at: 2025-12-09
categories:
  - "Linux内核设计与实现 —— 笔记"
tags:
  - "Linux内核设计与实现 —— 笔记"
permalink: /linux内核设计与实现-笔记/linux-tasklet/
toc: true
---

## 一、主要概念一句话定义

1. **tasklet**：一种利用软中断实现的**下半部机制**，与进程无关，接口简单且锁保护要求较低，是处理中断下半部工作的常用选择。

2. **tasklet 结构体**：由 `tasklet_struct` 表示，包含处理函数、状态、引用计数等成员，**每个结构体代表一个独立的 tasklet**。

3. **tasklet 调度**：通过 `tasklet_schedule()` 将 tasklet 加入处理器专属链表，并触发对应的软中断，**确保在合适时机执行**。

4. **tasklet 处理程序**：用户定义的函数，**不能睡眠**，形式为 `void handler(unsigned long data)`，运行时允许响应中断。

5. **tasklet 状态**：包括 `TASKLET_STATE_SCHED`（已调度）和 `TASKLET_STATE_RUN`（执行中），**用于控制并发执行**。

6. **引用计数器**：`count` 成员，**不为 0 时禁止 tasklet 执行**，为 0 时才可被激活运行。

7. **tasklet 队列**：`tasklet_vec`（普通）和 `tasklet_hi_vec`（高优先级），**每个处理器维护两个链表存储已调度的 tasklet**。

8. **tasklet 禁止/激活**：通过 `tasklet_disable()` 和 `tasklet_enable()` 控制，**可临时阻止 tasklet 运行**。

9. **tasklet 移除**：`tasklet_kill()` 从队列中移除 tasklet，**会等待其执行完毕**，不能在中断上下文使用。

10. **软中断关联**：tasklet 通过 `HI_SOFTIRQ` 和 `TASKLET_SOFTIRQ` 两类软中断实现，**前者优先级更高**。

---

## 二、tasklet 机制详解

### 1. 什么是 tasklet？

tasklet 是 Linux 内核中基于软中断实现的一种下半部处理机制。当中断处理需要将部分工作推迟执行时，tasklet 提供了一种简单高效的解决方案。**它与进程无关**，完全在内核上下文中运行，特别适合处理硬件设备的中断下半部工作。

### 2. tasklet 的设计原理

tasklet 的实现相当巧妙：**它重用现有的软中断框架**，通过 `HI_SOFTIRQ` 和 `TASKLET_SOFTIRQ` 两个软中断类别来执行。当 tasklet 被调度时，内核触发对应的软中断，随后在软中断处理函数中执行所有挂起的 tasklet。

**同一时间同一类型的 tasklet 不会并发执行**（避免复杂的锁需求），但不同类型的 tasklet 可以并行运行。这种平衡使得 tasklet 既保持了软中断的效率，又大大简化了使用接口。

### 3. tasklet 的结构与状态

每个 tasklet 对应一个 `tasklet_struct` 结构体，包含以下关键成员：

- **func**：处理函数，相当于软中断的 action
- **data**：传递给处理函数的参数
- **state**：状态标志，控制 tasklet 的执行生命周期
- **count**：引用计数器，为 0 时 tasklet 才可执行

状态管理是 tasklet 的核心机制之一。`TASKLET_STATE_SCHED` 表示 tasklet 已被调度，准备运行；`TASKLET_STATE_RUN` 表示正在执行（多处理器系统中用于防止重复执行）。

### 4. tasklet 的生命周期

#### 创建阶段

tasklet 可以静态或动态创建：

```c
// 静态创建（激活状态）
DECLARE_TASKLET(my_tasklet, my_handler, dev);

// 静态创建（禁止状态）
DECLARE_TASKLET_DISABLED(disabled_tasklet, my_handler, dev);

// 动态创建
struct tasklet_struct dyn_tasklet;
tasklet_init(&dyn_tasklet, my_handler, dev);
```

#### 调度阶段

调用 `tasklet_schedule()` 后：

1. 检查 tasklet 是否已被调度，避免重复
2. 禁止本地中断（防止数据竞争）
3. 将 tasklet 添加到当前处理器的链表头部
4. 触发对应的软中断
5. 恢复中断状态

**关键优化**：tasklet 总是在调度它的处理器上执行，这利用了处理器的缓存局部性，提高性能。

#### 执行阶段

当软中断被执行时（通常在中断返回时），`tasklet_action()` 或 `tasklet_hi_action()` 被调用：

1. 禁止中断，获取当前处理器的 tasklet 链表
2. 清空链表（将处理器链表指针设为 NULL）
3. 重新允许中断
4. 遍历链表中的每个 tasklet：
   - 检查是否正在其他处理器上运行（多处理器系统）
   - 设置运行状态，防止其他处理器执行
   - 检查引用计数，确保 tasklet 被激活
   - 执行处理函数
   - 清除运行状态

### 5. tasklet 的使用规范

#### 处理函数编写要求

tasklet 处理函数有严格限制：

- **不能睡眠**（因为基于软中断实现）
- **不能使用信号量等可能阻塞的函数**
- 函数原型必须为：`void handler(unsigned long data)`

#### 并发与同步

- **相同 tasklet 不会同时执行**（与软中断不同）
- **不同 tasklet 可以同时在多个处理器上执行**
- 如果与中断处理程序共享数据，**必须进行适当的锁保护**
- 与软中断或其他 tasklet 共享数据时，也需要锁保护

### 6. tasklet 的管理与控制

#### 启用与禁止

```c
tasklet_disable(&my_tasklet);   // 禁止，等待当前执行完成
tasklet_disable_nosync(&my_tasklet); // 禁止，不等待完成（风险较高）
tasklet_enable(&my_tasklet);    // 重新激活
```

`tasklet_disable()` 是安全的选择，它会等待正在执行的 tasklet 完成后再返回。而 `tasklet_disable_nosync()` 有风险，因为你无法确定 tasklet 是否仍在运行。

#### 移除 tasklet

```c
tasklet_kill(&my_tasklet);
```

这个函数会：

1. 等待 tasklet 执行完毕
2. 从挂起队列中移除
3. **注意**：可能导致休眠，因此不能在中断上下文中使用

### 7. tasklet 的应用场景与选择

#### 何时使用 tasklet？

- 处理硬件中断的下半部工作
- 需要推迟执行但不需要进程上下文的任务
- 对性能要求较高，但不需要软中断级别的极致性能
- 希望简化并发控制的场景

#### 与软中断的比较

- **tasklet 优势**：接口简单、锁要求低、同一类型不并发执行
- **软中断优势**：执行频率更高、连续性要求更严苛
- **通用建议**：优先使用 tasklet，只有在极少数高性能场景下才使用软中断
