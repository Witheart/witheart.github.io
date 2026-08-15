---
title: "记一次异常断电导致的 Ubuntu 主机SSH连接不上"
date: 2025-02-14
last_modified_at: 2025-02-14
categories:
  - "其他bug解决记录"
tags:
  - "其他bug解决记录"
permalink: /其他bug解决记录/记一次异常断电导致的-ubuntu-主机ssh连接不上/
toc: true
---

## 背景
由于工作室跳闸，需要断电后再重新上电。在这个过程中，忘记正常关闭编译服务器，直接断电了。恢复电源后，服务器可以正常启动，但尝试进行 SSH 连接时出现如下错误：  

```sh
Network error: Connection refused
```

在断电之前，SSH 连接是正常的，因此需要进行排查。  

---

## **排查过程**  

### **1. 检查 IP 地址**  
- 服务器设置的是静态 IP，使用ifconfig查看，断电后 IP 地址未发生变化。  

### **2. 检查网络连接**  
- **服务器 Ping 本地**：可以正常 Ping 通。  
- **本地 Ping 服务器**：可以正常 Ping 通。  
- **结论**：网络连接正常，问题不在于网络。  

### **3. 检查 SSH 服务状态**  
在服务器上执行以下命令检查 SSH 服务是否运行：  

```sh
systemctl status sshd
```
- 结果显示 **SSH 服务已启动**，但仍然无法连接。  

### **4. 检查 SSH 配置文件**  
打开 SSH 配置文件 `/etc/ssh/sshd_config` 进行检查，发现以下关键配置项被注释：  

```plaintext
#Port 22
#PermitRootLogin yes
#PasswordAuthentication yes
```

### **5. 修复 SSH 配置**  
- 取消上述配置项的注释，使其生效：  

```plaintext
Port 22
PermitRootLogin yes
PasswordAuthentication yes
```

- **重启 SSH 服务**：  

```sh
sudo systemctl restart sshd
```

### **6. 测试 SSH 连接**  
- 重新尝试 SSH 连接，问题解决，SSH 可正常连接。  

---

## **问题原因分析**  

异常断电可能导致 **SSH 配置文件 (`/etc/ssh/sshd_config`) 发生更改或损坏**，从而影响 SSH 服务的正常运行。结合排查过程，可能的原因如下：  
- `/etc/ssh/sshd_config` 可能在断电后恢复到默认状态，导致关键配置被注释。  
