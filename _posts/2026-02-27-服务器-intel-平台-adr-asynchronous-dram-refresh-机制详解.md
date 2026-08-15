---
title: "Intel 平台 ADR（Asynchronous DRAM Refresh）机制详解"
date: 2026-02-27
last_modified_at: 2026-02-27
categories:
  - "服务器"
tags:
  - "服务器"
permalink: /服务器/intel-平台-adr-asynchronous-dram-refresh-机制详解/
toc: true
---

## 参考文档
《606161 Emmitsburg_EDS Rev 1-5》P2163
《EGS PDG 610826 V 1-2》P870

## 一、ADR 的设计目标

**ADR（Asynchronous DRAM Refresh）** 是 Intel 平台的一种电源异常保护机制，核心目标是：

> 在 AC 电源丢失或“安全可延迟”的 Global Reset 发生前，提前通知 CPU，使其有机会保存关键数据到非易失性存储器，从而保证易失性数据（如 DRAM 中的数据）不会丢失。

### 为什么需要 ADR？

在传统架构中：

- 对于 **Host Partition Reset** 或进入 **S3/S4/S5** 状态
  → CPU 可以通过 `Reset_Warn` 或 `Go_S3/4/5` DMI 消息提前收到通知。

- 但对于 **Global Reset（全局复位）**
  → CPU **不会提前收到警告**

因此，ADR 机制的引入，就是为了：

> 给 CPU 一个“提前量”，在 Global Reset 真正发生前执行缓存刷新、I/O 阻塞、内存自刷新等动作。

---

## 二、ADR 如何向 CPU 发出“预警”？

### 1️⃣ 使用 PM_SYNC 引脚

ADR 的预警信号通过：

```
PM_SYNC 引脚 → CPU 监控特定状态 → 判断为 ADR 触发
```

CPU 会持续监测 PM_SYNC 的状态作为 ADR 指示。

---

### 2️⃣ AC 掉电场景的特殊处理

在交流电源突然断电时，PCH（芯片组）赖以工作的供电也会很快掉电（表现为PCH_PWROK或RSMRST#信号失效）。一旦掉电，PCH自己都无法工作了，自然也就无法再通过PM_SYNC引脚去通知CPU预警了。

为了解决这个“PCH即将自身不保”的困境，支持ADR的平台增加了一个“外部预警”​ 设计：
1. 早期预警源：主电源本身或相关电路会提前检测到交流电（AC Power）已失效。这个“交流电失效”的信号是一个非常早期的预警。
2. 信号接力：这个早期预警信号被连接到PCH上一组专门配置的GPIO（通用输入/输出）引脚中的一个。
3. 提前触发：这个GPIO引脚在PCH_PWROK等核心供电信号还没有掉电之前，就被拉低（有效），从而提前向PCH发出“电源即将失效”的警报。
4. PCH接力预警：收到这个GPIO信号后，尚在正常工作的PCH会立即通过PM_SYNC引脚将警报传递给CPU。
5. CPU执行保存：CPU收到预警后，还有最后一段极短的时间窗口，可以执行缓存刷新等操作，将关键数据保存到非易失性存储器中。

---

## 三、Eagle Stream 平台：两阶段闭环握手机制

在 Eagle Stream 平台上，ADR 采用：

> **Two-phase Closed-loop Handshake（两阶段闭环握手）**

---

# 第一阶段：Cache Flush & IO Block

## 目标

- CPU 刷新缓存（可选）
- 阻塞 I/O 流量

## 流程

1. PCH 发送 “Start Phase 1” 消息
2. CPU 执行：
   - 若 BIOS 配置允许 flush → 执行 cache flush
   - 若禁用 → 立即 ACK

3. CPU 返回 ACK

---

# 第二阶段：Memory Self-Refresh

## 目标

- 进入 DRAM Self-refresh
- 保持内存数据

## 流程

1. PCH 发送 Phase 2 Start
2. CPU/内存控制器进入自刷新
3. 返回 ACK

---

## 全局复位

- 每个阶段结束时，PMC记录来自各代理的完成状态。
- 若完成
  → PCH 触发 Global Reset

---

## 可选平台握手（ADR_ACK）

PCH 可以被配置为：

- **立即 Global Reset**
- 或 **等待平台 ACK（ADR_ACK）后再 Reset**

通过：

```
ADR_PLT_ACK_EN 使能
```

如果启用：

```
Phase2 完成
→ 等待 ADR_ACK 拉高
→ 才触发 Global Reset
```

---

## 四、ADR_TRIGGER GPIO 特性

这是一个非常关键的设计点。

---

### 1️⃣ Level Sensitive（电平触发）

ADR_TRIGGER# 不是边沿触发，而是：

> 只要 GPIO 处于 Active 状态 → ADR 流程持续有效

因此：

- 一旦拉低触发 ADR
- 必须保持该状态
  直到：
  - 电源 Power Good 信号掉电
  - 或 PLTRST# 拉低

否则：

- 逻辑会认为 ADR 请求被撤销

---

### 2️⃣ 双向 GPIO（Emmitsburg PCH）

在 Emmitsburg PCH 上：

```
ADR_TRIGGER# 是双向的
```

既可：

- 平台作为输入触发 ADR
- 也可 PCH 主动拉动表示内部检测到 ADR 事件

但规则是：

> 在检测到“Qualified ADR Event”之前，双方都不要主动驱动。

一旦触发：

- 该状态会被锁存
- 直到 Global Reset 清除

---

## 五、ADR_COMPLETE 信号

当 ADR Timer 超时：

```
ADR_COMPLETE 置位
```

特点：

- 会保持有效
- 直到 BIOS 清除

用于：

- 状态记录
- 调试
- 失败追踪

---

## 六、复位相关特殊说明

### 1️⃣ S3/S4/S5 状态下的行为

| 情况              | 行为                          |
| ----------------- | ----------------------------- |
| 系统已在 S3/S4/S5 | PCH 丢弃 ADR 请求             |
| 软件进入 S3/S4/S5 | 执行复位，但不执行 RESET_WARN |

---

### 2️⃣ 无 ACK 情况

如果：

- PCH 未收到 ACK

则：

> 直接执行带 Power-cycle 的 Global Reset

---

### 3️⃣ PLTRST# 超时保护

如果：

```
PLTRST# 4 秒内未完成
```

→ 自动触发 Entry Timeout

---

### 4️⃣ Qualified Global Reset

某些 Global Reset 会被转换为：

```
Warm Reset
```

属于受限复位类型。

## 流程梳理
```
AC Loss Early Warning
        ↓
ADR_TRIGGER# 置位
        ↓
PCH 通过 PM_SYNC 通知 CPU
        ↓
Phase 1：Cache Flush
        ↓
ACK
        ↓
Phase 2：Memory Self Refresh
        ↓
ACK
        ↓
(可选) 等待 ADR_ACK
        ↓
Global Reset
        ↓
Power Rail 下降
        ↓
DRAM 维持数据
```

## ADR概念示意图
![alt text](/assets/images/服务器/intel-平台-adr-asynchronous-dram-refresh-机制详解/PixPin_2026-02-27_09-32-55.png)
