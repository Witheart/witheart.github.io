---
title: "Ubuntu 下 sensors 查看温度"
date: 2025-02-17
last_modified_at: 2025-02-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下-sensors-查看温度/
toc: true
---

`sensors` 命令用于在 Linux 系统中显示硬件传感器的数据，例如 CPU 温度、风扇转速、电压等。


## **1. 安装 `lm-sensors`**

### **Debian/Ubuntu**
```bash
sudo apt update
sudo apt install lm-sensors
```

---

## **2. 查看温度**
运行：
```bash
sensors
```
示例输出：
```
npu_thermal-virtual-0
Adapter: Virtual device
temp1:        +79.5°C

center_thermal-virtual-0
Adapter: Virtual device
temp1:        +79.5°C

bigcore1_thermal-virtual-0
Adapter: Virtual device
temp1:        +84.1°C

soc_thermal-virtual-0
Adapter: Virtual device
temp1:        +81.3°C  (crit = +115.0°C)

gpu_thermal-virtual-0
Adapter: Virtual device
temp1:        +78.5°C

littlecore_thermal-virtual-0
Adapter: Virtual device
temp1:        +82.2°C

bigcore0_thermal-virtual-0
Adapter: Virtual device
temp1:        +84.1°C

```

---

## **3. 常见用法**
### **显示特定传感器**
例如，只查看 CPU 温度：
```bash
sensors | grep "Core"
```

### **持续监控传感器信息**
```bash
watch -n 2 sensors
```
每 **2 秒**刷新一次数据。
