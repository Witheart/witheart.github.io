---
title: "Ubuntu stress 压力测试指南"
date: 2025-12-11
last_modified_at: 2025-12-11
categories:
  - "测试SOP"
tags:
  - "测试SOP"
permalink: /测试sop/ubuntu-stress-压力测试指南/
toc: true
---

概要：本文介绍了在 Ubuntu 系统中进行压力测试的方法，包括安装 stress 工具、运行压力测试命令、合理配置内存占用，并提供了桌面监控建议和必要软件的安装方式。  


## 1. 安装所需软件

在开始压力测试前，需要确保系统中安装了以下工具：  

- stress：用于生成 CPU、I/O、内存负载的测试工具  
- htop：交互式进程查看器  
- lm-sensors：用于检测硬件温度、风扇等传感器信息  

### 1.1 更新软件源

联网后执行以下命令：

```bash
sudo apt update
```

### 1.2 安装 stress

```bash
sudo apt install stress -y
```

### 1.3 安装 htop

```bash
sudo apt install htop -y
```

### 1.4 安装 lm-sensors（支持 sensors 命令）

```bash
sudo apt install lm-sensors -y
```

---

## 2. 运行压力测试

使用 stress 工具进行压力测试的命令如下：

```bash
stress --cpu 8 --io 4 --vm 4 --vm-bytes 256M
```

说明：

- `--cpu 8`：使用 8 个 CPU worker  
- `--io 4`：使用 4 个 I/O worker  
- `--vm 4`：使用 4 个内存分配 worker  
- `--vm-bytes 256M`：每个内存 worker 分配 256MB  

---

## 3. 测试配置建议

### 3.1 CPU 线程数（--cpu）

建议与 CPU 核心数一致。  
CPU 核心数可通过以下方法查看：

- 命令行：
  ```bash
  lscpu
  ```
- 使用 `htop` 工具查看图形化核心使用情况

### 3.2 IO 数量（--io）

建议为 CPU 核心数的一半。

### 3.3 内存配置推荐

| 内存大小 | 推荐 worker 数 (--vm) | 每个 worker 大小 (--vm-bytes) | 总占用  | 占用率 |
| -------- | --------------------- | ----------------------------- | ------- | ------ |
| 2GB      | 3                     | 384MB                         | 1152MB  | 56.2%  |
| 4GB      | 4                     | 512MB                         | 2048MB  | 50.0%  |
| 8GB      | 11                    | 512MB                         | 5632MB  | 68.8%  |
| 16GB     | 12                    | 1024MB                        | 12288MB | 75.0%  |
| 32GB     | 22                    | 1024MB                        | 22528MB | 68.8%  |

---

## 4. 桌面监控建议

在运行压力测试时，建议打开多个终端窗口，实时监控系统状态。

### 4.1 使用以下命令进行监控

```bash
journalctl -f
htop
watch sensors
```

- `journalctl -f`：实时查看系统日志  
- `htop`：查看各进程资源占用情况  
- `watch sensors`：每隔 2 秒自动刷新并显示温度等硬件信息  

### 4.2 显示当前时间

请确保桌面环境的任务栏设置中已启用时间显示，便于观察测试过程中的时间变化。

### 4.3 桌面监控布局建议

布局如下图所示：

![alt text](/assets/images/测试sop/ubuntu-stress-压力测试指南/PixPin_2025-12-11_18-31-18.png)  
