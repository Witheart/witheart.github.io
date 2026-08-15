---
title: "Android WiFi BT 模组移植 分层详解"
date: 2025-02-20
last_modified_at: 2025-02-20
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-wifi-bt-模组移植-分层详解/
toc: true
---

## **1. 系统分层架构**
通常可以将WiFi和BT的软件架构划分为以下几个层次：

### **（1）应用层（Application Layer）**
   - 主要负责提供用户接口（UI）和业务逻辑，调用系统提供的API进行WiFi和蓝牙的管理。
   - 典型组件：
     - WiFi Manager（如Android的 `WifiManager`）
     - Bluetooth Manager（如Android的 `BluetoothManager`）
     - 配网应用、蓝牙配对应用等

### **（2）框架层（Framework Layer）**
   - 提供WiFi和BT的管理框架，向应用层提供API，同时向下调用HAL层或用户态的后台进程（如 `wpa_supplicant`）。
   - 典型组件：
     - Android中的 **WiFi Service** 和 **Bluetooth Service**
     - Linux系统的 `NetworkManager`（管理WiFi连接）
     - `bluetoothd`（蓝牙守护进程，BlueZ）

### **（3）HAL层（Hardware Abstraction Layer，硬件抽象层）**
   - 负责向上层提供统一的硬件抽象接口，使得上层软件可以不关心具体的硬件实现。
   - 典型组件：
     - **WiFi HAL（wifi_hal）**：
       - 作用：封装WiFi驱动的调用接口，提供上层访问WiFi硬件的API。
       - 例如：Android的 `libwifi-hal.so`，或者 OpenWRT 的 `hostapd_cli`
     - **BT HAL（libbt）**：
       - 作用：封装蓝牙驱动的调用接口，向上层提供蓝牙管理API。
       - 例如：Android的 `libbluetooth.so`（有时简称 `libbt`），或者 Linux 的 `bluez-hcidump`

### **（4）用户空间驱动/协议层（User Space Drivers & Protocols）**
   - 主要运行在用户态，负责实现WiFi协议（如WPA协议）和蓝牙协议。
   - 典型组件：
     - **WiFi**
       - **WPA Supplicant（wpa_supplicant）**：
         - 作用：WiFi认证和加密管理（WPA/WPA2/WPA3），管理WiFi连接。
         - 位置：用户空间，通常是一个守护进程（`wpa_supplicant`）。
     - **Bluetooth**
       - **BlueZ**（Linux常用的蓝牙协议栈）
       - **Fluoride（Android的蓝牙协议栈）**

### **（5）内核驱动层（Kernel Driver Layer）**
   - 作用：提供对WiFi和蓝牙硬件的底层驱动支持，通常以 **Linux内核模块（ko）** 的形式存在。
   - 典型组件：
     - **WiFi驱动**
       - `ath10k.ko`（高通WiFi驱动）
       - `brcmfmac.ko`（博通WiFi驱动）
     - **蓝牙驱动**
       - `btusb.ko`（USB蓝牙驱动）
       - `hci_uart.ko`（UART蓝牙驱动）

### **（6）硬件层（Hardware Layer）**
   - 物理WiFi和蓝牙芯片，如：
     - 高通 QCA6174
     - 博通 BCM4356
     - 乐鑫 ESP32（WiFi+BT二合一）

---

## **2. 典型移植流程**
在移植WiFi+BT模组时，一般需要完成以下步骤：
1. **移植内核驱动（Kernel Driver）**
   - 确保WiFi和蓝牙驱动（ko模块）可以正确编译和加载。
   - 例如，移植 `brcmfmac.ko` 或 `ath10k.ko`。

2. **移植用户态协议栈**
   - 移植 `wpa_supplicant` 并配置 WiFi 连接。
   - 移植 `bluez`（或 Android 的 `fluoride`）以支持蓝牙协议。

3. **移植 HAL 层**
   - 确保 `wifi_hal` 和 `libbt` 能够正确调用驱动接口。

4. **适配框架层**
   - 使 `WifiManager`、`BluetoothManager` 等可以正确调用 HAL 层。
