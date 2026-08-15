---
title: "VMware Ubuntu 无法拖拽文件复制解决方法"
date: 2025-10-22
last_modified_at: 2025-10-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/vmware-ubuntu-无法拖拽文件复制解决方法/
toc: true
---

概要：本文介绍了在 VMware 中安装 Ubuntu 系统时，安装 VMware Tools 后仍无法实现物理机与虚拟机之间拖拽文件的常见原因，并提供了基于 Wayland 设置的解决方法。  


## 1. 问题描述  

安装 VMware Tools 后，依然无法在物理机和虚拟机之间拖拽文件，拖拽时显示一个禁止符号。  

---

## 2. 排查步骤  

### 2.1 确认 VMware Tools 是否安装成功  
使用以下命令检查 VMware Tools 是否正确安装：  

```bash
vmware-toolbox-cmd -v
```

### 2.2 检查客户机隔离设置  
确保以下选项已在 VMware 设置中被勾选：  

- **启用拖放**
- **启用复制黏贴**

### 2.3 Wayland 的影响  

Wayland 图形显示服务器可能会导致拖拽功能无法使用。  

---

## 3. Wayland 影响的解决方法  

### 3.1 编辑配置文件  

使用以下命令编辑配置文件：  

```bash
sudo vim /etc/gdm3/custom.conf
```

### 3.2 修改配置  

找到如下行：  

```bash
#WaylandEnable=false
```

取消注释，修改为：  

```bash
WaylandEnable=false
```

### 3.3 保存并重启  

保存文件后，重启系统以使设置生效。  

---

## 4. 可能遇到的问题  

重启后可能出现如下情况：  

- 显示黑屏  
- 光标变成叉状  

此时可以使用以下快捷键切换到命令行界面：  

```bash
Ctrl + Alt + F2
```
