---
title: "RK Android OTG切换"
date: 2025-02-20
last_modified_at: 2025-02-20
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-android-otg切换/
toc: true
---

概要：本指南介绍了 RK 平台上 USB OTG（On-The-Go）功能的切换方法，包括主机与从机的角色转换、命令行操作以及图形界面设置，以便用户能够正确配置设备的 USB 模式。  


## 1. OTG 功能简介  

OTG（On-The-Go）是一种 USB（通用串行总线）技术的扩展，允许设备（如智能手机、平板电脑等）直接与其他 USB 设备（如 U 盘、鼠标、键盘、游戏手柄、打印机等）进行连接，而无需经过电脑作为中介。  

### 1.1 主机与从机切换  

传统的 USB 设备通常分为 **主机（Host）** 和 **从机（Device）**。OTG 允许设备在不同情况下切换角色。例如：  

- 手机通常作为 **USB 从机**（连接到电脑时）。  
- 使用 OTG 时，手机可以充当 **主机**（连接 U 盘、键盘等外设时）。  

### 1.2 即插即用  

只要设备支持 OTG 功能，插入 OTG 适配器或 OTG 线后，系统会自动识别并运行相应的外设功能。例如：  

- **外接键盘、鼠标等设备** 时，应设置为 **主机模式**。  
- **进行 ADB 调试** 时，应设置为 **从机模式**。  

---

## 2. OTG 角色切换命令  

### 2.1 参考文档  
  
[USB 使用手册](https://doc.embedfire.com/linux/rk356x/quick_start/zh/latest/quick_start/interface/usb/usb.html)  

### 2.2 命令行切换  

使用以下命令切换 USB OTG 模式：  

```bash
# 设置为主机模式（Host）
echo host > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode

# 设置为从机模式（Device）
echo peripheral > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode

# 设置为 OTG 模式（自动识别）
echo otg > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
```

### 2.3 状态检查  

执行以下命令检查当前 OTG 模式的状态：  

```bash
cat /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
```

**注意**：如果在一段时间后状态自动切换，可能是系统有进程通过图形界面进行自动切换，此时应进行系统属性修改。  

### 2.4 系统属性修改  

如果希望切换 OTG 模式，可以修改系统属性：  

```bash
# 设置为主机模式
setprop persist.usb3.otg.mode 0

# 设置为OTG自动识别模式
setprop persist.usb3.otg.mode 1
```

系统属性修改完成后，再次使用 `/sys/devices/platform/fe8a0000.usb2-phy/otg_mode` 进行 OTG 主机/从机的选择。  

---

## 3. 图形界面切换  

用户可以通过系统设置界面进行 OTG 模式切换，如下图所示：  

![OTG 切换界面](/assets/images/android-开发指南/rk-android-otg切换/image.png)  

- **状态为“开”** 时，设备为 **OTG自动切换模式**。  
- **状态为“关”** 时，设备为 **主机模式**。  
