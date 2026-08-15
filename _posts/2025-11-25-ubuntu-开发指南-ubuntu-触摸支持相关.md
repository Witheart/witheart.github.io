---
title: "Ubuntu 触摸支持相关"
date: 2025-11-25
last_modified_at: 2025-11-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-触摸支持相关/
toc: true
---

概要：本文介绍了在 Ubuntu/Linux 系统中提升触摸屏交互体验的两种方法：修改触摸屏控制板固件或通过系统配置优化触控操作，包括单击激活和右键菜单模拟工具的使用（如 evdev-right-click-emulation）。


## 1. Ubuntu/Linux 下触摸体验现状  

- Linux 对触摸的支持不是很好。  
- 尽管触摸屏可识别触控操作，但交互体验存在诸多问题。  
  - 不支持双击打开文件  
  - 不支持手势操作  
  - 无法调用右键菜单等  

---

## 2. 解决方案路径  

### 2.1 修改触摸屏控制板固件  

触摸屏控制板中包含一份独立于系统的固件，该固件可设置为以下两种模式之一：

- **鼠标模式**：推荐使用  
  - 支持双击打开文件  
  - 支持长按模拟右键菜单  
- **触摸模式**：Linux 支持不佳，不推荐  

调整为鼠标模式后，触控体验会更接近传统鼠标操作。

---

### 2.2 修改 Linux 系统配置  

如果无法修改触摸屏控制板的固件，可从系统配置入手进行优化。

#### 方向一：舍弃右键菜单，使用单击打开文件  

1. 打开“桌面设置” → 切换到“图标”选项卡  
   - 勾选 “单击激活项目”  

2. 打开文件管理器 → 点击“编辑” → “首选项”  
   - 在“General”中选择 “Open files with single click”  

设置完成后，用户可以通过单击直接打开文件，但右键菜单无法正常使用。

---

#### 方向二：保留右键菜单，使用模拟工具实现  

使用 GitHub 项目 [evdev-right-click-emulation](https://github.com/PeterCxy/evdev-right-click-emulation) 可在 Linux 下实现“长按模拟右键点击”的功能。

##### 项目简介：
- 项目地址：[PeterCxy/evdev-right-click-emulation](https://github.com/PeterCxy/evdev-right-click-emulation)  
- 功能：在 Linux 触摸设备中实现“长按触控 = 右键点击”的能力，兼容 Xorg 和 Wayland。  
- 实现语言：C  
- 使用 evdev 接收原始输入事件，通过 uinput 模拟右键点击。  
- 不依赖具体桌面环境或发行版。  

##### 实测问题（在 XFCE 桌面环境）：

- 当弹出的右键菜单出现在手指上方时，抬起手指会导致菜单项消失。  
- 若菜单出现在手指下方，则行为正常。  

---

## 3. 总结  

在 Ubuntu/Linux 系统中提升触控体验并非易事，但可通过以下两种方式缓解：

- 优先通过修改触控板固件设置为鼠标模式，以获取更好的原生支持。
- 若无法修改硬件设置，则通过系统配置和工具（如 evdev-right-click-emulation）模拟右键行为。
