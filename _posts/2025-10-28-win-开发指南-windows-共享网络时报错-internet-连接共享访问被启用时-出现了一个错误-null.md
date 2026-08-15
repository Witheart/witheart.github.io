---
title: "Windows 共享网络时报错：Internet 连接共享访问被启用时，出现了一个错误（null）"
date: 2025-10-28
last_modified_at: 2025-10-28
categories:
  - "win 开发指南"
tags:
  - "win 开发指南"
permalink: /win-开发指南/windows-共享网络时报错-internet-连接共享访问被启用时-出现了一个错误-null/
toc: true
---

## 问题描述
windows主机有两个网口，分别是以太网1和以太网2，现在尝试将以太网2的网络共享给以太网1，报错如下
![alt text](/assets/images/win-开发指南/windows-共享网络时报错-internet-连接共享访问被启用时-出现了一个错误-null/PixPin_2025-10-28_09-51-23.png)
![alt text](/assets/images/win-开发指南/windows-共享网络时报错-internet-连接共享访问被启用时-出现了一个错误-null/PixPin_2025-10-28_09-54-12.png)

## 解决方式
共享网络的功能是由 Internet 连接共享 (ICS) 提供的。

- 先设置以太网1的IPv4地址为自动获取，因为ICS分配的IP固定为137网段，不能随意更改
- 按 Win + R键，输入 services.msc并回车，打开“服务”窗口。
- 找到 ​​Internet Connection Sharing (ICS)​ 服务，手动禁用再启用
- 问题应该解决了

如果接入的设备不能只能获取到IPv6的回环地址，没有IPv4地址，可以尝试将以太网1的IPv4地址改为137网段
