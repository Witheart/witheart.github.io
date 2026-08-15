---
title: "3568 3588 显卡 GPU 相关信息命令查看"
date: 2025-10-21
last_modified_at: 2025-10-21
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/3568-3588-显卡-gpu-相关信息命令查看/
toc: true
---

## 参考链接
https://www.cnblogs.com/hencins/p/17758968.html
https://blog.csdn.net/CATTLE_L/article/details/147637512

## 核心监控命令

### 1. 实时频率查询
**查看当前GPU运行频率**：
```bash
# 方法一：通过debugfs接口
cat /sys/kernel/debug/clk/clk_scmi_gpu/clk_rate
# 输出示例：198000000（198MHz）

# 方法二：通过devfreq接口（推荐）
cat /sys/devices/platform/fde60000.gpu/devfreq/fde60000.gpu/cur_freq
# 输出示例：200000000（200MHz）
```

### 2. GPU负载监控
**查看实时利用率**：
- 3568
```bash
cat /sys/devices/platform/fde60000.gpu/utilisation
# 输出示例：0（表示当前负载为0%）

cat /sys/class/devfreq/fde60000.gpu/load
# 输出示例：0@200000000Hz（负载百分比@当前频率）
```

- 3588
```bash
cat /sys/devices/platform/fb000000.gpu/utilisation

cat /sys/class/devfreq/fb000000.gpu/load
```

## GPU能力与配置信息

### 3. 可用频率范围
```bash
cat /sys/class/devfreq/fde60000.gpu/available_frequencies
```
**输出说明**：显示GPU支持的所有工作频率（单位：Hz）
- 示例：`800000000 700000000 600000000 400000000 300000000 200000000`
- 对应频率：800MHz、700MHz、600MHz、400MHz、300MHz、200MHz

### 4. 工作模式（调控器）
```bash
cat /sys/class/devfreq/fde60000.gpu/available_governors
```
**可用调控器说明**：
- `performance`：始终保持最高性能
- `powersave`：始终保持最低功耗
- `userspace`：用户手动控制频率
- `simple_ondemand`：根据负载动态调整（默认）
- `rknpu_ondemand`：RK平台专用的按需调频

### 5. 频率限制设置
```bash
# 查看最大频率限制
cat /sys/class/devfreq/fde60000.gpu/max_freq

# 查看最小频率限制  
cat /sys/class/devfreq/fde60000.gpu/min_freq
```

## 高级监控：频率切换统计

### 6. 频率切换历史分析
```bash
cat /sys/class/devfreq/fde60000.gpu/trans_stat
```

**输出解读示例**：
```
     From  :   To
           : 800M  700M  600M  400M  300M  200M  time(ms)
  800000000:   0     9     4     6     5    12    6229
  200000000:  29     0     0     0     0     0   111314
Total transition : 103
```

**关键信息**：
- **频率切换矩阵**：显示各频率间的切换次数
- **驻留时间**：每个频率下的累计运行时间（毫秒）
- **总切换次数**：系统运行以来的频率切换总次数
