---
title: "CAN 相关命令"
date: 2025-04-30
last_modified_at: 2025-04-30
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/can-相关命令/
toc: true
---

概要：本文总结了 Linux 环境下 CAN 和 CANFD 接口的常用操作命令，包括配置波特率、启动接口、查看状态以及数据收发等操作。  


## 1.1 设置波特率（标准 CAN）  
将 `can0` 接口的波特率设置为 500kbps（标准 CAN 模式）：  
```bash
ip link set can0 type can bitrate 500000
```  

## 1.2 设置波特率和数据域波特率（CANFD 模式）  
将 `can0` 接口的波特率设置为 1Mbps，并启用 CANFD 模式，数据域波特率为 3Mbps：  
```bash
ip link set can0 type can bitrate 1000000 dbitrate 3000000 fd on
```  

## 1.3 关闭 CANFD 模式（仅标准 CAN）  
将 `can0` 接口的波特率设置为 1Mbps，并关闭 CANFD 模式（仅使用标准 CAN 帧）：  
```bash
ip link set can0 type can bitrate 1000000 fd off
```  

## 2.1 启动 CAN 接口  
启动已配置好的 `can0` 接口：  
```bash
ip link set can0 up
```  

## 2.2 停止 CAN 接口  
停止 `can0` 接口（需先停止接口才能重新配置）：  
```bash
ip link set can0 down
```  

## 3.1 查看接口详细信息  
查看 `can0` 接口的详细配置和状态信息：  
```bash
ip -d link show can0
```  

## 4.1 监听 CAN 数据（接收）  
使用 `candump` 工具监听 `canX` 接口的数据（`X` 为接口编号，如 `can0`）：  
```bash
candump -tA canX
```  
参数说明：  
- `-tA`：以 ASCII 格式显示时间戳和数据帧内容。  

示例输出：  
```
  can0  123   [8]  11 22 33 44 55 66 77 88
```  

## 4.2 发送 CAN 数据  
使用 `cansend` 工具向 `can0` 接口发送数据帧：  
```bash
cansend can0 123#1122334455667788
```  
参数说明：  
- `123`：CAN 帧的 ID（十六进制）。  
- `#1122334455667788`：数据帧的内容（十六进制，长度为 8 字节）。  
