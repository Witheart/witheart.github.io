---
title: "chromium 不显示地址栏——信息亭模式"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/chromium-不显示地址栏-信息亭模式/
toc: true
---

概要：本文介绍了如何使用 Chromium 浏览器的信息亭模式，使浏览器不显示地址栏，并提供了实际的启动命令和退出方法。  


## 1. 信息亭模式简介  

### 1.1 kiosk 参数的作用  
- **kiosk 参数**：与使用 F11 手动全屏的效果类似，进入信息亭模式后，浏览器将隐藏地址栏和其他界面元素。  

---

## 2. 启动命令  

### 2.1 实际使用的启动命令  
- **启动命令**：  
  ```bash
  chromium-browser --start-maximized --no-sandbox --kiosk
  ```  

---

## 3. 退出信息亭模式  

### 3.1 退出方法  
- **退出快捷键**：使用 `Alt + F4` 组合键退出信息亭模式。  
