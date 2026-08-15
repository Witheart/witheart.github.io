---
title: "GPIO 相关命令"
date: 2026-08-04
last_modified_at: 2026-08-04
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/gpio-相关命令/
toc: true
---

概要：本文介绍了在Linux bash环境和Android init.rc脚本中操作GPIO的常用命令，包括查看GPIO状态、导出引脚、配置方向以及设置电平等操作。

**注意：可导出不意味着复用设置正确！！！下面的命令操作没报错，但是不生效，可能是复用设置不正确，或者硬件损坏！**

---GPIO 导出不等于GPIO复用设置正确 —— GPIO 输出电平设置失败

## 修改历史

| 时间   | 历史                       |
| ------ | -------------------------- |
| 250430 | 创建了本文                 |
| 260804 | 加入了操作不生效的原因提示 |

1. bash 环境下的 GPIO 操作

1.1 查看已配置的 GPIO  
使用以下命令查看系统中已配置的 GPIO 状态：

```bash
cat /sys/kernel/debug/gpio
```

1.2 导出 GPIO 引脚  
将指定的 GPIO 引脚导出到用户空间：

```bash
echo 40 > /sys/class/gpio/export
```

1.3 配置 GPIO 方向  
设置 GPIO 引脚的方向（输入或输出）：

```bash
echo "in" > /sys/class/gpio/gpio40/direction  # 设置为输入模式
echo "out" > /sys/class/gpio/gpio40/direction # 设置为输出模式
```

1.4 配置 GPO 电平  
设置 GPIO 引脚的电平值（仅适用于输出模式）：

```bash
chmod 777 /sys/class/gpio/gpio96/value  # 修改权限（如果需要）
echo 0 > /sys/class/gpio/gpio96/value   # 设置为低电平
echo 1 > /sys/class/gpio/gpio96/value   # 设置为高电平
```

---

2. Android init.rc 环境下的 GPIO 操作

2.1 导出 GPIO 引脚  
在 `init.rc` 文件中使用 `write` 命令导出 GPIO 引脚：

```bash
write /sys/class/gpio/export 40
```

2.2 配置 GPIO 方向  
通过 `write` 命令设置 GPIO 引脚的方向：

```bash
write /sys/class/gpio/gpio40/direction "in"  # 设置为输入模式
write /sys/class/gpio/gpio40/direction "out" # 设置为输出模式
```

2.3 配置 GPO 电平  
设置 GPIO 引脚的电平值（仅适用于输出模式）：

```bash
chmod 777 /sys/class/gpio/gpio154/value  # 修改权限（如果需要）
write /sys/class/gpio/gpio154/value 0    # 设置为低电平
write /sys/class/gpio/gpio154/value 1    # 设置为高电平
```
