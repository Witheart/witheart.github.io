---
title: "刷入系统后查看设备树节点配置"
date: 2025-05-26
last_modified_at: 2025-05-26
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/刷入系统后查看设备树节点配置/
toc: true
---

概要：本文介绍如何在系统刷入后，通过查看设备树中的相关节点，判断 PCIE 卡槽配置的是 PCIE 资源还是 SATA 资源。通过命令行方式查看设备节点的 status 值，并结合源码设备树进一步确认资源配置情况。


## 1. 背景说明  

系统刷入后，可能不确定 PCIE 卡槽具体配置了哪种资源（PCIE 或 SATA）。为此，可以通过查看设备树中相关节点的状态来进行判断。

---

## 2. 查看设备树节点  

### 2.1 进入设备树目录  

```bash
cd /sys/firmware/devicetree/base
```

### 2.2 可查看的节点  

使用 `ls` 命令可查看以下节点：

- pcie@fe260000  
- pcie@fe270000  
- pcie@fe280000  
- sata@fc000000  
- sata@fc400000  
- sata@fc800000  

### 2.3 合并命令查看 status 值  

```bash
cd /sys/firmware/devicetree/base && \
for dir in pcie@fe260000 pcie@fe270000 pcie@fe280000 sata@fc000000 sata@fc400000 sata@fc800000; do
    if [ -d "$dir" ]; then
        echo "=== Status of $dir ==="
        cat "$dir/status" 2>/dev/null || echo "status not found"
        echo
    else
        echo "=== Directory $dir does not exist ==="
        echo
    fi
done
```

### 2.4 输出示例  

```text
=== Status of pcie@fe260000 ===
disabled

=== Status of pcie@fe270000 ===
disabled

=== Status of pcie@fe280000 ===
disabled

=== Status of sata@fc000000 ===
disabled

=== Status of sata@fc400000 ===
disabled

=== Status of sata@fc800000 ===
okay
```

从示例中可以看到，只有 `sata@fc800000` 的 `status` 为 `okay`，表明该节点被启用。

---

## 3. 查看源码设备树
（上面的例子sata是使能的，下面的源码是pcie使能，两者是冲突的，不是同一份源码，只是示例）
### 3.1 搜索关键字  

在源码中搜索以下关键字可定位设备树配置信息：

- `pcie@`
- `sata@`

### 3.2 查找别名与引用  

在设备树中，经常可以看到如 `pcie2x1` 这样的别名，代表某个具体的节点。

例如：

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/刷入系统后查看设备树节点配置/PixPin_2025-05-26_14-50-47.png)

随后可以继续搜索对该节点的引用，例如：

- `&pcie2x1`

示例：

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/刷入系统后查看设备树节点配置/PixPin_2025-05-26_14-51-54.png)

通过这些别名与引用，进一步确认节点在设备树中的实际使用情况。

---
