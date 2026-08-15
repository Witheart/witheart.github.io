---
title: "通过SSH调试 Linux"
date: 2025-10-13
last_modified_at: 2025-10-13
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/通过ssh调试-linux/
toc: true
---

## 1 什么是SSH？

SSH（Secure Shell）是一种加密的网络传输协议，可让您安全地远程访问和管理另一台计算机。通过SSH，您可以在本地计算机上操作远程的Ubuntu系统，就像直接使用它的键盘和显示器一样。

## 2 准备工作
### 查看Ubuntu的IP地址

在Ubuntu终端中输入：
```bash
ifconfig
```
一般找到有线网卡的IP地址（eth/eth1），如`192.168.x.x`（这是局域网地址）。

## 方式一：Windows下使用MobaXterm连接Ubuntu

### 下载和安装MobaXterm

1. 访问MobaXterm官网（https://mobaxterm.mobatek.net）
2. 下载免费的家庭版
3. 安装并启动程序

### 建立SSH连接

1. 点击左上角的"Session"按钮
2. 填写 Remote host（输入Ubuntu的IP地址）
3. 点击"OK"开始连接
![alt text](/assets/images/ubuntu-调试/通过ssh调试-linux/PixPin_2025-10-13_11-50-49.png)

然后会要求输入用户名和密码
用户名一般为user或者root，密码一般为123456

## 方式二：Linux/Windows下使用自带终端连接
- Linux打开终端，Windows下打开cmd
命令
```bash
ssh 板子用户名@板子ip
```
- 会出现是否连接的提示
Are you sure you want to continue connecting (yes/no/[fingerprint])? 
输入yes

- 然后要求输入密码（输入时不回显），输入完成后回车即可登录ssh
