---
title: "Ubuntu LxQt 配置 ibus-rime 中文输入法"
date: 2025-04-08
last_modified_at: 2025-04-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-lxqt-配置-ibus-rime-中文输入法/
toc: true
---

概要：本文介绍如何在 Ubuntu 20.04 + LxQt 桌面环境下安装和配置 ibus-rime 中文输入法，包括依赖安装、环境变量设置、输入法添加、开机自启配置等步骤，并附有实际测试效果说明。  


## 1. 什么是 ibus 与 ibus-rime  

- **ibus**（Intelligent Input Bus）是一个用于 Linux 桌面的输入法框架，支持多种输入法引擎。
- **ibus-rime** 是 RIME（中州韻輸入法引擎）在 Linux 系统中通过 IBus 框架运行的实现方式。RIME 是一个支持多种语言及自定义输入方案的开源输入法系统。  

相关链接：  
- [ibus-rime GitHub 项目](https://github.com/rime/ibus-rime)  
- [RIME 官方网站](https://rime.im/)  

---

## 2. 配置环境  

- 桌面环境：`lxqt-about 0.14.1`  
- 操作系统：`Ubuntu 20.04`  

---

## 3. 安装 ibus-rime  

在终端中执行以下命令：  
```bash
sudo apt update
sudo apt install ibus-rime
```  

---

## 4. 设置环境变量  

编辑 `~/.profile` 文件，在末尾添加以下内容：  
```bash
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus
```  

保存并重启系统以使配置生效。  

---

## 5. 配置输入法  

在终端中执行以下命令启动 IBus 设置界面：  
```bash
ibus-setup
```  

这将打开一个 GUI 界面，在 **Input Method** 中点击 **Add**，选择 **Chinese**，然后添加 **Rime**。  

示意图：  
![alt text](/assets/images/ubuntu-开发指南/ubuntu-lxqt-配置-ibus-rime-中文输入法/image.png)  

---

## 6. 设置 ibus 自启动  

依次打开：  
- 左下角菜单 → 会话设置  
- 切换到 **自动启动** 标签页  
- 点击 **添加** 按钮  

在弹出窗口中填写：  
- **命令**：`ibus-daemon --daemonize --xim`  

点击保存并退出。  

重启系统后，IBus 将自动启动。  

---

## 7. 使用 Rime 输入法  

启动后，IBus 会在任务托盘中显示图标，点击后可选择 Rime 输入法。  

示意图：  
![alt text](/assets/images/ubuntu-开发指南/ubuntu-lxqt-配置-ibus-rime-中文输入法/93d4c85b40451eb7b6c0e0c9b8823fea_compress.jpg)  

---

## 8. 使用体验与注意事项  

- **终端输入（QTerminal）**：实测中无法在 QTerminal 中输入中文。
- **浏览器输入（Chromium-browser）**：可以正常输入中文。  

输入时，可以使用 `Ctrl + ~` 快捷键呼出方案菜单，用于切换输入方案，如切换为简体中文。  
