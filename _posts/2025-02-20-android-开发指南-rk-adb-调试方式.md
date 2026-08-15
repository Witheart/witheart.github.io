---
title: "RK ADB 调试方式"
date: 2025-02-20
last_modified_at: 2025-02-20
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-adb-调试方式/
toc: true
---

概要：本文介绍了在 RK 设备上使用 ADB 进行调试的方法，包括软件使用、命令操作以及设备 USB 模式的配置。  


## 1. 软件使用  

使用 `platform-tools_r34.0.5-windows.zip` 进行 ADB 调试。  

### 1.1 配置步骤  

1. 解压 `platform-tools_r34.0.5-windows.zip` 并在该路径下打开 `cmd`。  
    - 如果输入 `adb shell` 进入终端，就像普通的Linux终端进行使用，此时命令不需要加 `adb` 前缀

2. 查看可用设备：  

   ```sh
   adb devices
   ```

3. 输入以下命令打开 ADB 终端：  

   ```sh
   adb shell
   ```
退出终端：使用 `Ctrl + D` 组合键退出。

4. 查看日志：  

   ```sh
   adb logcat
   ```

### 1.2 乱码问题  

如果 `cmd` 输出乱码，可以先输入以下命令解决：  

```sh
chcp 65001
```

---

## 2. 设备配置  

RK 设备的 USB 模式应设置为 `device` 而非 `host`。  

### 2.1 设置方式  

- **方式 1（命令行模式）**：在不方便接屏幕时，使用 Debugger 口输入命令进行设置。
```sh
# 设置系统属性为OTG自动识别模式
setprop persist.usb3.otg.mode 1

# 设置为 OTG 模式（自动识别）
echo otg > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
```  
- **方式 2（图形界面）**：直接在系统设置的图形界面中，找到 `OTG` 开关进行设置。  

可参考文章：[RK Android OTG 切换](/android-开发指南/rk-android-otg切换/)。  
