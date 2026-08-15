---
title: "DDR 压力测试 —— stressapptest"
date: 2026-01-15
last_modified_at: 2026-01-15
categories:
  - "测试SOP"
tags:
  - "测试SOP"
permalink: /测试sop/ddr-压力测试-stressapptest/
toc: true
---

概要：本文介绍了 Google 开发的高性能内存压力测试工具 stressapptest 的原理及使用方法，并通过示例对其测试结果进行分析，帮助开发者识别并判断 DDR 内存硬件稳定性问题。


## 1. 简介

注意，本文只讲解 stressapptest 方法，具体的 DDR 定频测试还需另外定频 DDR，并运行 glmark2 等有 GPU 或 NPU 持续运行的应用。

**stressapptest** 是一个由 Google 开发的高性能、专业性强的内存和存储子系统压力测试与稳定性验证工具。

其核心设计理念是：

> 模拟实际应用中复杂的内存访问模式，以在短时间内发现内存、总线和存储设备的深层硬件错误。

与传统的“填满内存”工具不同，stressapptest 采用多种科学的内存访问模式：

- 随机访问
- 顺序访问
- 块移动
- 缓存行冲刷

这些模式可以更真实地模拟数据库、科学计算等应用对内存子系统（包括 CPU 缓存、内存控制器、内存条本身）造成的压力。

### 1.1 数据完整性校验

这是 stressapptest 最核心、最强大的功能：

- 向内存中写入已知模式的数据
- 在后续的读写循环中不断校验读取到的数据是否与预期一致

### 1.2 与 stress 工具对比

| 工具              | 特点说明                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| **stressapptest** | 写入-校验循环。写入已知模式数据，之后操作都包含读取和校验，主动探测错误 |
| **stress**        | 分配-访问-释放循环。主要目的是消耗内存资源并制造内存压力                |

> 从原理上来说，stressapptest 的测试更为深入。  
> 有些 stress 测不出来的问题，使用 stressapptest 就可以测出来。

---

## 2. 使用方式

### 2.1 查看可用内存

```bash
free -m
```

### 2.2 启动测试命令

建议将可用内存的 90% 用于测试：

```bash
stressapptest -s 43200 -i 4 -C 4 -W --stop_on_errors -M 3084
```

### 2.3 参数说明

| 参数               | 值    | 含义             | 您的设置分析               |
| ------------------ | ----- | ---------------- | -------------------------- |
| `-s`               | 43200 | 测试时间（秒）   | 12 小时，深度稳定性测试    |
| `-i`               | 4     | 内存反转线程数   | 4 线程，匹配 4 核 CPU      |
| `-C`               | 4     | CPU 压力线程数   | 4 线程，匹配 4 核 CPU      |
| `-W`               | 无    | 高压力模式       | 增加 CPU 和内存压力        |
| `--stop_on_errors` | 无    | 遇错即停         | 发现错误立即停止           |
| `-M`               | 3084  | 测试内存量（MB） | 约 3GB，为系统保留部分内存 |

### 2.4 测试技巧

- 一般来说，如果ddr有问题，1min以内便会报告问题。短时间测不出问题，可以打断并重新运行命令，问题会比较容易测出来。
- 对于测出问题的ddr，也多次运行命令，查看物理地址是否一致，协助问题判断（参考3.3）

---

## 3. 结果分析

### 3.1 错误输出示例

```bash
2026/01/14-09:25:18(UTC) Report Error: miscompare : DIMM Unknown : 1 : 7s
2026/01/14-09:25:18(UTC) Hardware Error: miscompare on CPU 2(0xFF) at 0x7d3e623b68(0x2acad2b6e:DIMM Unknown): read:0x0000a55a5aa5a55a, reread:0x0000a55a5aa5a55a expected:0x5aa5a55a5aa5a55a
...
2026/01/14-09:25:18(UTC) Log: Thread 24 found 1568 hardware incidents
2026/01/14-09:25:18(UTC) Stats: Found 55673 hardware incidents
2026/01/14-09:25:18(UTC) Stats: Completed: 46710.00M in 4.35s 10735.94MB/s, with 55673 hardware incidents, 0 errors
...
2026/01/14-09:25:18(UTC) Status: FAIL - test discovered HW problems
```

### 3.2 错误解读

- **错误类型**：`miscompare`（数据不匹配）
  - 表示从某内存地址读取的值与写入期望值不一致
  - 示例地址：`0x7d3e623b68`，进行了两次读取（read 与 reread），结果一致但与 expected 不符
  - 排除了偶然干扰，指向硬件错误（如存储单元或数据传输路径问题）

- **线程报告**：
  - 从 Thread 1 到 Thread 24 几乎都报告了 hardware incidents
  - 总计：**55,673** 个硬件事件

- **最终状态**：

```bash
Status: FAIL - test discovered HW problems
```

> 测试工具明确判定系统内存存在硬件问题，不可靠。

### 3.3 地址一致性

多次打断并重新测试，查看地址是否在同一处，如果地址相同，基本上可以判断为颗粒本身，或者电路出了问题，可以运行用于测试ddr的loader加以验证

```bash
 Hardware Error: miscompare on CPU 1(0xFF) at 0x7eadb61190(0x1383d0195:DIMM Unknown): read:0x0200090002000000, reread:0x0200090002000000 expected:0x0200000002000000
2026/05/18-17:59:02(CST) Report Error: miscompare : DIMM Unknown : 1 : 32s
2026/05/18-17:59:02(CST) Hardware Error: miscompare on CPU 6(0xFF) at 0x7e0fd05190(0x1383d0195:DIMM Unknown): read:0x0000090000000000, reread:0x0000090000000000 expected:0x0000000000000000
2026/05/18-18:00:37(CST) Hardware Error: miscompare on CPU 2(0xFF) at 0x7f3db18190(0x1383d0195:DIMM Unknown): read:0x0000090000000000, reread:0x0000090000000000 expected:0x0000000000000000
2026/05/18-18:00:37(CST) Report Error: miscompare : DIMM Unknown : 1 : 11s
2026/05/18-18:02:38(CST) Hardware Error: miscompare on CPU 5(0xFF) at 0x7ef81c1190(0x1383d0195:DIMM Unknown): read:0x0000094000000040, reread:0x0000094000000040 expected:0x0000004000000040
2026/05/18-18:02:38(CST) Report Error: miscompare : DIMM Unknown : 1 : 72s
05/18-18:03:10(CST) Report Error: miscompare : DIMM Unknown : 1 : 9s
2026/05/18-18:03:10(CST) Hardware Error: miscompare on CPU 6(0xFF) at 0x7d35ae4190(0x1383d0195:DIMM Unknown): read:0x0200090004000000, reread:0x0200090004000000 expected:0x0200000004000000
2026/05/18-18:04:53(CST) Hardware Error: miscompare on CPU 7(0xFF) at 0x7dffd3e190(0x1383d0195:DIMM Unknown): read:0x0000090000000000, reread:0x0000090000000000 expected:0x0000000000000000
2026/05/18-18:05:25(CST) Hardware Error: miscompare on CPU 6(0xFF) at 0x7e664b7190(0x1383d0195:DIMM Unknown): read:0xaaaaafaaaaaaaaaa, reread:0xaaaaafaaaaaaaaaa expected:0xaaaaaaaaaaaaaaaa
2026/05/18-18:05:25(CST) Report Error: miscompare : DIMM Unknown : 1 : 15s
2026/05/18-18:15:48(CST) Hardware Error: miscompare on CPU 0(0xFF) at 0x7ebc8b9190(0x1383d0195:DIMM Unknown): read:0x4a4a4f4a4a4a4a4a, reread:0x4a4a4f4a4a4a4a4a expected:0x4a4a4a4a4a4a4a4a
2026/05/18-18:15:48(CST) Report Error: miscompare : DIMM Unknown : 1 : 182s

```

如上的日志，可以看到物理地址都是0x1383d0195，而前面的虚拟地址不同。且不同的测试模板（是全0，还是交替的 0xaa 或 0x4a）错误永远发生在数据串右数第 11 个字符（即第 40-43 个 bit 位）上。
