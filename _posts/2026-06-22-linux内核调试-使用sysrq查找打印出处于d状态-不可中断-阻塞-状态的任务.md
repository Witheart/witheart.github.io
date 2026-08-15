---
title: "使用sysrq查找打印出处于D状态（不可中断）（阻塞）状态的任务"
date: 2026-06-22
last_modified_at: 2026-06-22
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/使用sysrq查找打印出处于d状态-不可中断-阻塞-状态的任务/
toc: true
---

## 具体使用方式
```bash
# 触发 Show State (t)
echo t > /proc/sysrq-trigger

# 触发 Show Blocked State (w)(只导出处于“不可中断睡眠状态”（D 状态）的任务)
echo w > /proc/sysrq-trigger

```

信息会在dmesg中打印出来，如果dmesg本身配置了转发到journalctl，那么信息也可以在journalctl中看到。
