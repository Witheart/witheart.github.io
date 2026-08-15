---
title: "Gnome WiFi 网络上有问号"
date: 2026-01-15
last_modified_at: 2026-01-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gnome-wifi-网络上有问号/
toc: true
---

本文只梳理该问号的产生机理，没有提供解决方案。


## 参考链接
- https://blog.csdn.net/iwanvan/article/details/136406651
- https://www.reddit.com/r/debian/comments/16dedum/icon_in_the_place_of_gnomes_normal_ethernet_icon/?tl=zh-hans

## 原理
这个功能叫连接检查，位于“设置 -> 隐私 -> 连接检查”，该功能会定时尝试连接一个网址，如果连接不上，则推测外网网络不可用，此时就会在WiFi网络图标上显示一个问号。

## 修改
- 使用下面的命令可以看到默认连接的网址
```bash
NetworkManager --print-config
```

输出如下
```bash
[connectivity]
uri=http://connectivity-check.ubuntu.com/
```

- 新建配置文件
```bash
sudo vim /etc/NetworkManager/conf.d/20-connectivity.conf
```

- 内容示例
```bash
[connectivity]
enabled=true
uri=http://nmcheck.gnome.org/check_network_status.txt
response=NetworkManager is online
interval=3000
```

- 保存后重启下，重新输入`NetworkManager --print-config`，可以看到默认连接的网址已经改变了

- 可以尝试换成一个连不上的网址，就可以复现网络的问号现象

## 解决方式
- 问号代表建立了连接，但是ip可能分配有问题、外网连接不上等，具体还要进一步深入debug。
