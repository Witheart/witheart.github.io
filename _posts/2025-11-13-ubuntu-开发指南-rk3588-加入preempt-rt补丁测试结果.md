---
title: "RK3588 加入PREEMPT_RT补丁测试结果"
date: 2025-11-13
last_modified_at: 2025-11-13
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-加入preempt-rt补丁测试结果/
toc: true
---

## 1 测试环境
- kernel 5.10.160
- Ubuntu 20.04
- stress-ng -c 8 --io 2 --vm 1 --vm-bytes 1024M --timeout 1000000s
- cyclictest -c 0 -m -t 8 -p 99 -D 600

## 2 测试结果
### 2.1 非实时内核（未加入补丁）
```bash
root@user:~# cyclictest -c 0 -m -t 8 -p 99 -D 600
WARN: cyclictest was not built with the numa option
# /dev/cpu_dma_latency set to 0us
policy: fifo: loadavg: 13.27 11.86 7.28 13/588 2516

T: 0 ( 2475) P:99 I:1000 C: 599944 Min:      2 Act:    3 Avg:    5 Max:    3059
T: 1 ( 2476) P:99 I:1500 C: 399998 Min:      2 Act:    3 Avg:    5 Max:    1652
T: 2 ( 2477) P:99 I:2000 C: 299995 Min:      2 Act:    4 Avg:    5 Max:    2319
T: 3 ( 2478) P:99 I:2500 C: 239991 Min:      2 Act:    3 Avg:    5 Max:    2554
T: 4 ( 2479) P:99 I:3000 C: 199992 Min:      2 Act:    3 Avg:    4 Max:    1595
T: 5 ( 2480) P:99 I:3500 C: 171420 Min:      2 Act:    5 Avg:    5 Max:    2573
T: 6 ( 2481) P:99 I:4000 C: 149990 Min:      2 Act:    3 Avg:    4 Max:      69
T: 7 ( 2482) P:99 I:4500 C: 133327 Min:      2 Act:    6 Avg:    5 Max:     930
```

### 2.2 实时内核（加入了PREEMPT_RT补丁）
```bash
root@user:~# cyclictest -c 0 -m -t 8 -p 99 -D 600
WARN: cyclictest was not built with the numa option
# /dev/cpu_dma_latency set to 0us
policy: fifo: loadavg: 15.40 13.57 7.73 13/675 2356

T: 0 ( 2322) P:99 I:1000 C: 599999 Min:      2 Act:    2 Avg:    3 Max:      24
T: 1 ( 2323) P:99 I:1500 C: 399988 Min:      2 Act:    3 Avg:    3 Max:      32
T: 2 ( 2324) P:99 I:2000 C: 299982 Min:      2 Act:    4 Avg:    3 Max:      34
T: 3 ( 2325) P:99 I:2500 C: 239978 Min:      2 Act:    3 Avg:    3 Max:      29
T: 4 ( 2326) P:99 I:3000 C: 199976 Min:      2 Act:    9 Avg:    3 Max:      23
T: 5 ( 2327) P:99 I:3500 C: 171403 Min:      2 Act:    3 Avg:    3 Max:      24
T: 6 ( 2328) P:99 I:4000 C: 149973 Min:      2 Act:    2 Avg:    3 Max:      23
T: 7 ( 2329) P:99 I:4500 C: 133305 Min:      2 Act:    3 Avg:    3 Max:      23
```
