---
title: "Ubuntu todesk 识别码重置"
date: 2025-05-07
last_modified_at: 2025-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-todesk-识别码重置/
toc: true
---

概要：本文介绍了在Ubuntu系统中重置todesk识别码的方法，包括卸载软件、删除配置文件以及注意事项。


经实验：直接删除/etc/todesk/reg.conf即可重置识别码，此方案已经加入最新版本的根文件系统打包脚本中

## 1.1 卸载todesk软件  
通过apt包管理器彻底卸载todesk：  
```bash
apt purge todesk
```  

## 1.2 删除配置文件  
手动删除todesk的配置文件目录：  
```bash
rm -rf /etc/todesk
```  

## 1.3 重启系统  
执行系统重启以清除可能存在的残留进程：  
```bash
reboot
```

## 向日葵问题
PS：经实验，删除向日葵的所有相关文件后重装，识别码仍不刷新，可能直接基于`machine-id`，但是不建议重置，可能影响其他依赖`machine-id`的应用程序
