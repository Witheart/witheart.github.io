---
title: "Linux 扫描局域网设备方式"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-扫描局域网设备方式/
toc: true
---

## 1. `nmap`（最常用）

```bash
sudo apt install nmap
sudo nmap -sn 192.168.1.0/24
```

`-sn` 是 ping 扫描（不做端口扫描），速度快。把 `192.168.1.0/24` 换成你本机所在网段，用 `ip addr` 或 `hostname -I` 先看一眼。

## 2. `arp-scan`（最准，基于 ARP）

```bash
sudo apt install arp-scan
sudo arp-scan --localnet
```

或者指定接口/网段：

```bash
sudo arp-scan -I eth0 192.168.1.0/24
```

ARP 层扫描，即使目标关了 ICMP 也能扫到，局域网发现神器。

## 3. `avahi-browse`（扫 mDNS / 零配置设备）

```bash
sudo apt install avahi-utils
avahi-browse -al
```

适合扫手机、Mac、智能家居这类开了 mDNS 的设备。
