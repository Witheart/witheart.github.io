---
title: "GPIO 导出不等于GPIO复用设置正确 —— GPIO 输出电平设置失败"
date: 2026-08-04
last_modified_at: 2026-08-04
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/gpio-导出不等于gpio复用设置正确-gpio-输出电平设置失败/
toc: true
---

## 问题描述
AM3568，添加了几个GPIO后，发现export正常，设置方向也正常，但是输出电平不对，一直和设置不同，并且是多个一起出现这种情况。

## 排查思路
- 怀疑硬件损坏：查看对地二极管压降
- 怀疑复用问题：查看实际的复用
```bash
cat /sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl/pinmux-pins
```
最后确实发现是复用不对导致的。

## 误区
- 用类似的命令，并不报错
```bash
echo 40 > /sys/class/gpio/export
echo "in" > /sys/class/gpio/gpio40/direction  # 设置为输入模式
echo "out" > /sys/class/gpio/gpio40/direction # 设置为输出模式
echo 0 > /sys/class/gpio/gpio96/value   # 设置为低电平
echo 1 > /sys/class/gpio/gpio96/value   # 设置为高电平
```

而且成功导出，并且方向成功设置，但是value一直设置失败。

误区在以为上述命令不报错，引脚就为GPIO功能，但实际上并非如此，查看下文分析。

## 分析

```bash
cat /sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl/pinmux-pins
```

输出如下

```bash
pin 116 (gpio3-20): fe6b0000.serial gpio3:116 function uart7 group uart7m1-xfer
                     ↑ mux owner     ↑ gpio owner
```
- 这里有两个独立的概念：
mux owner (fe6b0000.serial)：控制引脚硬件功能的那一方 — 这里是 UART7
gpio owner (gpio3:116)：调用 gpio_request() 的那一方 — 这里是 sysfs export

**两者互不冲突。** UART7 驱动通过 pinctrl 直接把 pinmux 设成了 UART 功能，它并没有调用 `gpio_request()`。所以你去 `/sys/class/gpio/export 116` 时，内核检测到 GPIO116 没被任何人 `gpio_request()` 过 → **导出成功**。

但硬件上呢？引脚已经被 UART7 的 pinctrl 切换到了 UART 模式。你虽然能把 GPIO 设置为 output 写 value，但 **pinmux 把 UART 信号路由到了引脚 pad，GPIO 的输出寄存器根本连不到引脚上**。
