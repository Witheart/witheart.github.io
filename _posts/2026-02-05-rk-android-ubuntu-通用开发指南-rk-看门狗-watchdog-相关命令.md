---
title: "RK 看门狗 watchdog 相关命令"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk-看门狗-watchdog-相关命令/
toc: true
---

概要：本文整理了 Rockchip 平台上 Watchdog（看门狗）功能的核心用法，包括内核自动喂狗与手动喂狗的操作方法，以及关于 356X 系列暂停与恢复看门狗计数的寄存器写法，适用于系统稳定性保障与故障恢复处理场景。


## 1. 内核喂狗机制  

### 1.1 启用内核自动喂狗  

```bash
echo V > /dev/watchdog
```

- 启用内核自动喂狗功能。
- 只要内核不挂，系统会自动进行喂狗操作，维持系统运行。

---

### 1.2 禁用内核自动喂狗（进行一次手动喂狗）  

```bash
echo D > /dev/watchdog
```

> 注意：写入除 `"V"` 以外的任意字符均可达到相同目的。

- 停止内核自动喂狗。
- 重置计数器，相当于手动执行一次喂狗。
- **使用场景**：
  - 在用户开发的应用中采用循环逻辑进行定时喂狗；
  - 每次喂狗间隔应小于设置的超时时间（推荐为超时的一半）；
  - 若应用程序卡死未喂狗，则系统将在看门狗超时时自动重启。

---

## 2. 暂停与恢复看门狗计数器（适用于 RK356X 系列）  

### 2.1 官方参考文件  

> 参考文档：《Rockchip_Developer_Guide_Linux_WDT_CN.pdf》

---

### 2.2 功能简介  

可使用 **io 命令** 或 **busybox 的 devmem 命令** 来实现 **暂停或恢复看门狗计数器**。

- **控制寄存器地址**：`0xfdc60504`  
- **所在寄存器**：`SYS_GRF` 下的 `GRF_SOC_CON1`  
- **控制位**：写 `bit4`（第 4 位）  
- 高 16 位为写使能位  

---

### 2.3 命令操作方式  

#### 暂停计数  

```bash
io -4 0xfdc60504 0x00100010
# 或者
busybox devmem 0xfdc60504 32 0x00100010
```

#### 恢复计数  

```bash
io -4 0xfdc60504 0x00100000
# 或者
busybox devmem 0xfdc60504 32 0x00100000
```

---

### 2.4 内核配置相关  

- `CONFIG_DEVMEM`：需开启支持 devmem 写寄存器功能  
- `CONFIG_STRICT_DEVMEM`：建议关闭，避免访问受限区域失败

## 3. 驱动位置
drivers/watchdog/dw_wdt.c

## 4. ioctl
https://wiki.t-firefly.com/zh_CN/ROC-RK3588-PC/usage_watchdog.html
