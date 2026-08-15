---
title: "修复 `sudo` 报错：无法解析主机，未知的名称或服务"
date: 2025-02-27
last_modified_at: 2025-02-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/修复-sudo-报错-无法解析主机-未知的名称或服务/
toc: true
---

概要：在 Ubuntu 上运行 `sudo` 命令时，可能会遇到 **"无法解析主机：user: 未知的名称或服务"** 错误。通常，这是由于主机名 (`hostname`) 配置错误或 `/etc/hosts` 文件缺少相应的条目。本文介绍如何检查和修复该问题。  


## 1. 解决方法  

### 1.1 检查主机名  
运行以下命令检查当前主机名：  
```bash
hostname
```  
该命令应返回你的主机名，例如 `user`。  

### 1.2 检查 `/etc/hosts` 文件  
打开 `/etc/hosts` 文件：  
```bash
sudo nano /etc/hosts
```  
确保文件中包含以下内容：  
```
127.0.0.1   localhost
127.0.1.1   user
```  
其中，`user` 应与你的主机名一致。如果 `127.0.1.1 user` 这一行不存在，请手动添加。  

**如果修改了 `/etc/hosts` 文件，按 `Ctrl + X`，然后按 `Y` 保存并退出。**  

### 1.3 检查 `/etc/hostname` 文件  
打开 `/etc/hostname` 文件：  
```bash
sudo nano /etc/hostname
```  
确保文件仅包含你的主机名，例如：  
```
user
```  
如果文件中有多余内容，请删除，只保留主机名。  

### 1.4 应用修改  
运行以下命令使更改生效：  
```bash
sudo systemctl restart systemd-logind
```  
或者，直接重启系统：  
```bash
sudo reboot
```  

---

## 2. 测试与进一步修复  

### 2.1 测试 `sudo` 命令  
重启后，运行：  
```bash
sudo ls
```  
如果不再出现 **"无法解析主机"** 错误，说明问题已解决。  
