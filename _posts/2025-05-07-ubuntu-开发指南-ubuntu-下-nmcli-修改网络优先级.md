---
title: "Ubuntu 下 nmcli 修改网络优先级"
date: 2025-05-07
last_modified_at: 2025-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下-nmcli-修改网络优先级/
toc: true
---

概要：本文介绍了在Ubuntu系统中通过nmcli工具修改网络连接优先级的方法，包括查看现有连接、调整路由优先级以及验证配置效果。  


## 1. 查看当前网络连接  

使用以下命令查看系统中已配置的网络连接及其详细信息：  
```bash
nmcli connection show
```  

示例输出：  
```
NAME                UUID                                  TYPE      DEVICE
Wired connection 3  ee784f67-98fa-3b10-b955-700e1134ae8f  ethernet  usb0
Wired connection 2  76f8e746-93cb-3060-b24d-84ee88f5d881  ethernet  eth1
HWTEK               ec1e4346-8dd0-40a2-a51b-67e21eac6865  wifi      --
Wired connection 1  07969475-c2d2-3d92-a98b-bd649be5230e  ethernet  --
```  

---

## 2. 修改网络优先级  

### 2.1 调整特定连接的路由优先级  
通过修改`ipv4.route-metric`参数来调整网络连接的优先级，数值越小优先级越高。  

示例：将"Wired connection 3"（usb0）的优先级设置为102  
```bash
sudo nmcli connection modify "Wired connection 3" ipv4.route-metric 102
```  
- 系统会优先使用metric值较小的路由
- 重启后生效，为永久配置
---

## 3. 验证路由优先级  

使用以下命令查看当前系统的路由表，确认优先级设置是否生效：  
```bash
ip route show
```  

示例输出：  
```
default via 192.168.0.1 dev eth1 proto dhcp metric 101
default via 192.168.200.1 dev usb0 proto dhcp metric 102
192.168.0.0/24 dev eth1 proto kernel scope link src 192.168.0.104 metric 101
192.168.200.0/24 dev usb0 proto kernel scope link src 192.168.200.104 metric 102
```  

关键字段说明：  
- `default via`：默认网关路由  

- `metric`：路由优先级（数值越小优先级越高）  

  - `eth1`（192.168.0.0/24）的metric为101，优先级高于usb0（metric 102）  
