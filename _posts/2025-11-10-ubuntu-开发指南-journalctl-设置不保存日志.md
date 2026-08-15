---
title: "journalctl 设置不保存日志"
date: 2025-11-10
last_modified_at: 2025-11-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/journalctl-设置不保存日志/
toc: true
---

概要：本文介绍如何配置 journalctl 仅查看本次启动日志，并禁止日志持久化保存。通过修改 systemd 日志服务配置文件，实现日志存储方式的灵活控制。  


## 1. 需求  

设置为只查看本次启动的日志，日志不持久化存储。  

---

## 2. 方法  

### 2.1 编辑配置文件  

路径：  
```
/etc/systemd/journald.conf
```

找到并设置 `Storage` 字段的值。  

### 2.2 Storage 字段说明  

- **auto**：默认设置。如果可能，将日志存储在磁盘（`/var/log/journal`）上。如果磁盘不可写或目录不存在，则回退到易失性内存（`/run/log/journal`）。  
- **persistent**：将日志存储在磁盘上。如果 `/var/log/journal` 目录不存在，Journald 将创建该目录，并且存储将在重启后保持持久。  
- **volatile**：仅将日志存储在内存中。重启时日志会丢失。  
- **none**：禁用所有日志存储。  

### 2.3 重启服务  

修改完配置后，需重启日志服务使配置生效：  

```bash
sudo systemctl restart systemd-journald
```  
