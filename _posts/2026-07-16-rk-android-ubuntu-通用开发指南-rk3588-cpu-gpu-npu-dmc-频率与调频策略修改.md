---
title: "RK3588 CPU GPU NPU DMC 频率与调频策略修改"
date: 2026-07-16
last_modified_at: 2026-07-16
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk3588-cpu-gpu-npu-dmc-频率与调频策略修改/
toc: true
---

## 1 CPU

### 三个 policy 的对应关系

| cpufreq policy | 对应 CPU 编号 | 核心类型                  | 最高主频 |
| -------------- | ------------- | ------------------------- | -------- |
| **policy0**    | CPU0–CPU3     | 4× Cortex-**A55**（小核） | 1.8 GHz  |
| **policy4**    | CPU4–CPU5     | 2× Cortex-**A76**（大核） | 2.4 GHz  |
| **policy6**    | CPU6–CPU7     | 2× Cortex-**A76**（大核） | 2.4 GHz  |

### 查看 CPU 的策略组
```bash
cat /sys/devices/system/cpu/cpufreq/policy*/related_cpus
```

输出

```bash
0 1 2 3
4 5
6 7
```

### 查看当前调频策略

```bash
cat /sys/devices/system/cpu/cpufreq/policy*/scaling_governor
```

### 查看可用的调频策略

```bash
cat /sys/devices/system/cpu/cpufreq/policy*/scaling_available_governors
```
- conservative：根据 CPU 负载动态调频，按一定的比例平滑的升高或降低频率。
- ondemand：根据 CPU 负载动态调频，调频幅度比较大，可直接调到最高频或最低频。
- interactive：根据 CPU 负载动态调频，相比 ondemand，响应时间更快，可配置参数更多，更灵活。
- userspace：提供相应接口供用户态应用程序调整频率。
- powersave：功耗优先，始终将频率设置在最低值。
- performance：性能优先，始终将频率设置为最高值。
- schedutil：EAS 使用 governor。EAS（Energy Aware Scheduling）是新一代的任务调度策略， 结合 CPUFreq和 CPUIdle 的策略， 在为某个任务选择运行 CPU 时， 同时考虑了性能和功耗， 保证了系统能耗最低，并且不会对性能造成影响。 Schedutil 调度策略就是专门给 EAS 使用的 CPU 调频策略

### 查看可用的频率
```bash
cat /sys/devices/system/cpu/cpufreq/policy*/scaling_available_frequencies
```

### 自定义策略
- 设置为性能策略：
```bash
echo performance > /sys/devices/system/cpu/cpufreq/policy*/scaling_governor
```

### 自定义频率
- 以policy0为例
```bash
# 将策略调整为 ``userspace``
echo userspace > /sys/devices/system/cpu/cpufreq/policy0/scaling_governor

# 查看 CPU 可用频率
cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies

# 设置频率（设置为600MHz）
echo 600000 > /sys/devices/system/cpu/cpufreq/policy0/scaling_setspeed
```

## 2 GPU
### 查看当前的GPU的调度策略
```bash
cat /sys/class/devfreq/fb000000.gpu/governor
```

### 查看支持的GPU的调度策略
```bash
cat /sys/class/devfreq/fb000000.gpu/available_governors
```
- simple ondemand：根据负载动态调频。
- userspace：提供相应接口供用户态应用程序调整频率。
- powersave：功耗优先，始终将频率设置在最低值。
- performance：性能优先，始终将频率设置为最高值。
- dmc_ondemand：虽然 GPU 的可用策略里显示了 dmc_ondemand，但实际上它无法使用。强行写入会导致内核crash除了CPU，其他所有支持动态调频的外设（如 GPU、NPU、DMC/内存控制器、甚至某些存储接口）都归 devfreq（Device Frequency）子系统管。当内核或者驱动向系统注册一个 devfreq 策略（Governor）时，这个策略会被添加到一个全局的策略池中。当通过 cat .../available_governors 查看可用策略时，devfreq 框架并没有做严格的设备分类过滤，而是直接把全局策略池里的所有策略全部打印了出来。

### GPU调度策略设置
```bash
echo performance > /sys/class/devfreq/fb000000.gpu/governor
```

### GPU定频策略设置
```bash
# 将策略调整为 ``userspace``
echo userspace > /sys/class/devfreq/fb000000.gpu/governor

# 查看 CPU 可用频率
cat /sys/class/devfreq/fb000000.gpu/available_frequencies

# 设置频率（设置为400MHz）
echo 400000000 > /sys/class/devfreq/fb000000.gpu/userspace/set_freq
```

## 3 DMC
### 列出DDR当前的调度模式
```bash
cat /sys/class/devfreq/dmc/governor
```

### 列出DDR支持的调度模式
```bash
cat /sys/class/devfreq/dmc/available_governors
```
- simple ondemand：根据负载动态调频。
- userspace：提供相应接口供用户态应用程序调整频率。
- powersave：功耗优先，始终将频率设置在最低值。
- performance：性能优先，始终将频率设置为最高值。
- dmc_ondemand：simple ondemand 的基础上，增加场景变频的支持，DDR 变频专用。

### DDR调度策略设置
```bash
echo performance > /sys/class/devfreq/dmc/governor
```

### DDR定频策略设置
```bash
# 将策略调整为 ``userspace``
echo userspace > /sys/class/devfreq/dmc/governor

# 查看 CPU 可用频率
cat /sys/class/devfreq/dmc/available_frequencies

# 设置频率（设置为1560MHz）
echo 1560000000 > /sys/class/devfreq/dmc/userspace/set_freq
```

## 4 NPU
### 查看NPU当前的调度模式
```bash
cat /sys/class/devfreq/fdab0000.npu/governor
```

### 查看NPU支持的调度模式
```bash
cat /sys/class/devfreq/fdab0000.npu/available_governors
```

### 查看NPU当前频率
```bash
cat /sys/class/devfreq/fdab0000.npu/cur_freq
```

### NPU调度策略设置
```bash
echo performance | tee /sys/class/devfreq/fdab0000.npu/governor
```

### NPU定频策略设置
```bash
#手动切换 userspace模式
echo userspace > /sys/class/devfreq/fdab0000.npu/governor

#设置频率1GHz
echo 1000000000 > /sys/class/devfreq/fdab0000.npu/userspace/set_freq

查看频率是否成功设置
cat /sys/class/devfreq/fdab0000.npu/cur_freq
```

## 5 一键查看策略频率脚本
```bash
vim check_freq.sh
```

- 填入下面的代码
```bash
#!/bin/bash

# 颜色定义，让输出更好看
BLUE='\033[1;34m'
NC='\033[0m' # 恢复默认颜色

echo -e "${BLUE}=================== CPU 状态 ===================${NC}"
if ls /sys/devices/system/cpu/cpufreq/policy* 1> /dev/null 2>&1; then
    echo -e "[可用策略]: \t $(cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_governors 2>/dev/null)"
    echo -e "[当前策略]: \t $(cat /sys/devices/system/cpu/cpufreq/policy*/scaling_governor 2>/dev/null | tr '\n' ' ')"
    echo -e "[当前频率(kHz)]: $(cat /sys/devices/system/cpu/cpufreq/policy*/scaling_cur_freq 2>/dev/null | tr '\n' ' ')"
else
    echo "未找到 CPU 调频节点"
fi

echo -e "\n${BLUE}=================== GPU 状态 ===================${NC}"
if [ -d /sys/class/devfreq/fb000000.gpu ]; then
    echo -e "[可用策略]: \t $(cat /sys/class/devfreq/fb000000.gpu/available_governors 2>/dev/null)"
    echo -e "[当前策略]: \t $(cat /sys/class/devfreq/fb000000.gpu/governor 2>/dev/null)"
    echo -e "[当前频率(Hz)]: \t $(cat /sys/class/devfreq/fb000000.gpu/cur_freq 2>/dev/null)"
else
    echo "未找到 GPU 调频节点"
fi

echo -e "\n${BLUE}=================== NPU 状态 ===================${NC}"
if [ -d /sys/class/devfreq/fdab0000.npu ]; then
    echo -e "[可用策略]: \t $(cat /sys/class/devfreq/fdab0000.npu/available_governors 2>/dev/null)"
    echo -e "[当前策略]: \t $(cat /sys/class/devfreq/fdab0000.npu/governor 2>/dev/null)"
    echo -e "[当前频率(Hz)]: \t $(cat /sys/class/devfreq/fdab0000.npu/cur_freq 2>/dev/null)"
else
    echo "未找到 NPU 调频节点"
fi

echo -e "\n${BLUE}=================== DMC 状态 ===================${NC}"
if [ -d /sys/class/devfreq/dmc ]; then
    echo -e "[可用策略]: \t $(cat /sys/class/devfreq/dmc/available_governors 2>/dev/null)"
    echo -e "[当前策略]: \t $(cat /sys/class/devfreq/dmc/governor 2>/dev/null)"
    echo -e "[当前频率(Hz)]: \t $(cat /sys/class/devfreq/dmc/cur_freq 2>/dev/null)"
else
    echo "未找到 DMC 调频节点"
fi
echo -e "\n"
```
