---
title: "有线网络无法上网 —— MAC冲突"
date: 2025-05-27
last_modified_at: 2025-05-27
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/有线网络无法上网-mac冲突/
toc: true
---

概要：本文介绍了在某些设备中由于 MAC 地址冲突导致有线网络无法上网的问题，并通过修改 MAC 地址解决该问题，提供了具体在 3568 平台上的操作命令示例。


## 1. 问题表现  

### 1.1 网络连接情况  

- 接上网线后，网口灯亮，说明物理连接正常  
- 使用 `ifconfig` 查看网络状态时，仅存在 `inet6` 地址而无 `inet4` 地址  
- 网络图标处于持续加载（转圈）状态  
- 一段时间后，连 `inet6` 地址也消失  

---

## 2. 问题分析  

### 2.1 原因推测  

问题可能由于 **MAC 地址冲突** 导致。  
可以通过 `ifconfig` 查看当前的 MAC 地址。

---

## 3. 解决方案  

### 3.1 更改 MAC 地址  

通过修改设备的 MAC 地址可以解决该问题。以下以 3568 平台为例，提供读写 MAC 地址的命令操作。

---

## 4. 操作命令示例（3568 平台）  

### 4.1 读取 MAC 地址  

```bash
i2ctransfer -y -f 5 w2@0x57 0x00 0x00 r6
```

---

### 4.2 写入 MAC 地址  

#### eth0 接口  

```bash
i2ctransfer -y -f 5 w3@0x57 0x00 0x00 0x50  
i2ctransfer -y -f 5 w3@0x57 0x00 0x01 0x0a  
i2ctransfer -y -f 5 w3@0x57 0x00 0x02 0x52  
i2ctransfer -y -f 5 w3@0x57 0x00 0x03 0x06  
i2ctransfer -y -f 5 w3@0x57 0x00 0x04 0x10  
i2ctransfer -y -f 5 w3@0x57 0x00 0x05 0xc1  
```

#### eth1 接口  

```bash
i2ctransfer -y -f 5 w3@0x57 0x00 0x10 0x50  
i2ctransfer -y -f 5 w3@0x57 0x00 0x11 0x0a  
i2ctransfer -y -f 5 w3@0x57 0x00 0x12 0x52  
i2ctransfer -y -f 5 w3@0x57 0x00 0x13 0x06  
i2ctransfer -y -f 5 w3@0x57 0x00 0x14 0x10  
i2ctransfer -y -f 5 w3@0x57 0x00 0x15 0xc1  
```

---

## 5. 总结  

MAC 地址冲突可能导致网络连接异常，通过正确读取并修改 MAC 地址可以有效解决该问题，确保设备正常联网。
