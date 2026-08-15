---
title: "defconfig 选项缺失"
date: 2025-04-16
last_modified_at: 2025-04-16
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/defconfig-选项缺失/
toc: true
---

概要：本文解释了defconfig与.config文件的区别，说明了defconfig中可能缺失某些选项的原因，并提供了相关示例。  


## 1. defconfig 的定义  

- `defconfig` 是 `.config` 的一个**简化版本**。  
- 它只包含非默认值的配置选项，而不包含所有可能的配置项。  

---

## 2. defconfig 中选项缺失的原因  

- 在 `defconfig` 中查找不到的选项，指的是连字段都查找不到，无论其值是多少。  
- 这些选项可能存在于其他配置文件中，例如内核源码中的 `Makefile`。  

---

## 3. 示例说明  

### 3.1 CONFIG_USB_SERIAL_QT2 选项  

- 在 `defconfig` 中可能查找不到 `CONFIG_USB_SERIAL_QT2` 选项。  
- 但在内核源码的以下文件中可以找到该选项：  

```bash
kernel/drivers/usb/serial/Makefile 
kernel/drivers/usb/serial/Kconfig 
```
