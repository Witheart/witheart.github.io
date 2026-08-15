---
title: "Ubuntu 下命令行可视化系统资源占用"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下命令行可视化系统资源占用/
toc: true
---

- **作者**：吴思含（Witheart）  
- **更新时间**：20250308  

概要：在 Ubuntu 下，有多个命令行工具可以用于可视化系统资源占用（如 CPU、内存、磁盘、网络等）。本文介绍了几款常见的命令行仪表盘工具，包括 htop、bpytop、nmon 和 gotop，并对它们的安装方法、特点及适用场景进行了详细说明。  


## 1. htop（推荐）  

### 1.1 安装  
```bash
sudo apt update && sudo apt install htop
```

### 1.2 启动  
```bash
htop
```

### 1.3 特点  
- 直观展示 CPU、内存和进程信息  
- 支持交互式操作，例如终止进程、调整优先级  

---

## 2. bpytop（更现代化的界面）  

### 2.1 安装  
```bash
sudo apt install bpytop
```

### 2.2 启动  
```bash
bpytop
```

### 2.3 特点  
- 更美观的 UI，支持鼠标操作  
- 显示 CPU、内存、磁盘、网络使用情况  
- 进程管理功能丰富  

---

## 3. nmon（IBM 出品的性能监控工具）  

### 3.1 安装  
```bash
sudo apt install nmon
```

### 3.2 启动  
```bash
nmon
```

### 3.3 特点  
- 监控 CPU、内存、磁盘、网络、进程等  
- 适合分析历史数据，可用于性能调优  

---

## 4. gotop（现代化，类似 bpytop）  

### 4.1 安装  
```bash
sudo snap install gotop
```

### 4.2 启动  
```bash
gotop
```

### 4.3 特点  
- 直观的 TUI（Terminal User Interface）  
- 轻量级，界面美观  

---

## 5. 总结  

| 工具 | 主要功能 | 适用场景 |
|------|---------|---------|
| **htop** | 进程管理、CPU、内存监控 | 日常使用，交互性强 |
| **bpytop** | 资源监控，UI 直观 | 现代化界面，鼠标支持 |
| **nmon** | 详细的系统指标 | 性能调优 |
| **gotop** | 现代 UI 的资源监控 | 轻量美观 |

个人最喜欢 bpytop 的界面，挺好看的。
