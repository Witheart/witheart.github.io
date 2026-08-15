---
title: "iperf3 error - unable to start listener for connections Permission denied"
date: 2026-01-21
last_modified_at: 2026-01-21
categories:
  - "其他bug解决记录"
tags:
  - "其他bug解决记录"
permalink: /其他bug解决记录/iperf3-error-unable-to-start-listener-for-connections-permission-denied/
toc: true
---

## 问题描述
windows上使用iperf3时，报如下错误
```cmd
>iperf3.exe -s

iperf3: error - unable to start listener for connections: Permission denied
iperf3: exiting
```

## 解决过程
- 尝试使用管理员身份打开命令行，无效
- 多尝试更换几个端口，使用-p选项，问题解决

## 溯源
- 查看iperf3的默认端口是否被其他程序监听
```cmd
netstat -ano | findstr :5201
```
没有输出

- 查看5201端口是否被排除了
```cmd
>netsh int ipv4 show excludedportrange protocol=tcp

协议 tcp 端口排除范围

开始端口    结束端口
----------    --------
      5123        5222
      5357        5357
      5358        5457
      5458        5557
      5558        5657
      5658        5757
      5830        5929
      6005        6104
     28385       28385
     28390       28390
     50000       50059     *

* - 管理的端口排除。
```
可以看到，5201被排除了，所以不能使用，具体是哪个应该程序建立的规则呢？找不到。
