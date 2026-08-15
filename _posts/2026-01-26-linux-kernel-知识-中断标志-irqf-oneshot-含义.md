---
title: "中断标志 IRQF_ONESHOT 含义"
date: 2026-01-26
last_modified_at: 2026-01-26
categories:
  - "Linux Kernel 知识"
tags:
  - "Linux Kernel 知识"
permalink: /linux-kernel-知识/中断标志-irqf-oneshot-含义/
toc: true
---

参考
https://linux-kernel-labs.github.io/refs/heads/master/labs/interrupts.html
https://android.googlesource.com/kernel/msm/+/android-wear-5.1.1_r0.6/include/linux/interrupt.h
https://docs.kernel.org/next/core-api/real-time/differences.html

是 Linux 内核在请求中断时（特别是使用 request_threaded_irq() ）使用的一个标志，它指示内核保持特定中断线屏蔽（禁用），直到线程处理程序（下半部分）执行完毕。
![alt text](/assets/images/linux-kernel-知识/中断标志-irqf-oneshot-含义/PixPin_2026-01-26_16-02-12.png)

中断屏蔽： 通常情况下，内核会在上半部分处理程序（硬中断请求）完成后立即重新启用中断线。而使用 IRQF_ONESHOT 时，即使上半部分处理程序完成，中断线也会保持禁用状态，从而防止同一设备再次触发同一中断，直到下半部分线程处理程序完成。
与线程中断一起使用： 对于线程中断来说至关重要，其中主处理程序仅唤醒线程，而实际处理发生在 thread_fn 中。

为什么需要 IRQF_ONESHOT？

防止中断风暴（电平触发中断）： 对于电平触发中断，如果设备在硬中断请求执行后没有立即降低中断线，CPU 将立即重新触发同一中断，导致无限循环（“中断风暴”）。
保护共享中断： 如果中断是共享的（ IRQF_SHARED ）并且是线程化的，而没有 ONESHOT ，则处理线程可能会在设备仍在断言中断时运行，从而导致问题。
空处理程序的强制性要求： 如果驱动程序将 NULL 作为主要处理程序传递（使用仅唤醒线程的默认处理程序），则内核会强制设置 IRQF_ONESHOT ，特别是对于 Level/EIO 类型的 IRQ。

应用示例

RTC闹钟中断，到达设定时间时会拉低引脚，该引脚接入cpu上引脚，配置使用低电平中断，不使用硬中断，只使用线程中断

由于是电平中断，如果没有配置IRQF_ONESHOT，则会在中断触发后不断触发，可能导致问题。
