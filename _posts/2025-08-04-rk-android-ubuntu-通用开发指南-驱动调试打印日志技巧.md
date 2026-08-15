---
title: "驱动调试打印日志技巧"
date: 2025-08-04
last_modified_at: 2025-08-04
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/驱动调试打印日志技巧/
toc: true
---

概要：本文介绍了在驱动开发过程中，通过使用打印日志的技巧进行调试的方法，包括在关键函数中添加日志、使用宏和特殊标记进行定位与检索，并补充了与 `__FUNCTION__` 类似的常用宏，提升日志定位能力。


## 1. 确认驱动加载流程  

在驱动开发中，首先要确认是否成功进入了驱动的加载函数（如 probe 函数）。可以在 probe 函数开始时添加日志，确认流程是否按预期执行。

```c
printk("[Witheart] Entering probe function\n");
```

---

## 2. 使用宏增强日志定位能力  

为了方便在源码中快速定位日志对应的打印位置，可以使用一些内置宏，例如：

### 2.1 `__FUNCTION__` 宏  

输出当前所在的函数名称。

```c
printk("Function: %s\n", __FUNCTION__);
```

输出示例：

```bash
Function: phy_rtl8211f_led_fixup
```

### 2.2 其他常用调试宏  

| 宏名             | 含义说明                            | 示例输出                           |
|------------------|-------------------------------------|------------------------------------|
| `__FILE__`       | 当前源文件名                        | `main.c`                           |
| `__LINE__`       | 当前代码所在的行号                  | `42`                               |
| `__func__`       | C99 标准定义的函数名，与 `__FUNCTION__` 类似 | `phy_rtl8211f_led_fixup`           |
| `__PRETTY_FUNCTION__` | GCC 扩展，显示函数原型，适合 C++ | `void ClassName::method(int)`     |

### 2.3 宏组合示例  

可以组合多个宏，输出更完整的调试信息：

```c
printk("[Witheart] %s:%s():%d\n", __FILE__, __FUNCTION__, __LINE__);
```

输出示例：

```bash
[Witheart] stmmac_main.c:phy_rtl8211f_led_fixup():1285
```

---

## 3. 使用特殊标记便于检索日志  

在日志中加入特定的标识（如 `[Witheart]`），有助于在海量日志中快速筛选出自己关心的输出内容。这样可以与系统其他日志进行区分，尤其在调试时序问题时尤为重要。

---

## 4. 常用形式
```c
printk("[witheart] %s: 日志内容  ==%s\n", __func__, __FILE__);
```

## 5. 实际案例：调试 eth 初始化读取 MAC 失败  

### 4.1 背景  

笔者在调试以太网（eth）初始化过程中，发现从 EEPROM 中读取 MAC 地址始终失败。

### 4.2 调试步骤  

为此，在 eth 和 EEPROM 的 probe 函数开始处分别添加了带有特殊标记的日志打印，便于后续分析。

```bash
console:/ # dmesg | grep -i "witheart"
[    2.072022] mpp_service mpp-srv: 32d8116903 author: Witheart 2025-06-04 git init
[    2.134954] [witheart] rk_gmac_probe begin..
[    2.135529] witheart: rk_get_eth_addr !!! \x0a
[    2.135531] witheart: at24_mac_read at24_private==null error
[    2.974292] [witheart] AT24_probe begin..
[   15.604223] [Witheart] test eth led ctrl start(kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c)====== phy_rtl8211f_led_fixup
[   15.604649] [Witheart] test eth led ctrl end====== phy_rtl8211f_led_fixup
```

### 4.3 分析结果  

从日志可以看出，eth 尝试读取 MAC 地址的时间早于 EEPROM 的 probe 初始化完成时间，这就导致读取失败。因此，通过日志分析可以确认问题是由于驱动加载的顺序不当导致的。
