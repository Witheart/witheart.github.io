---
title: "EC200M ECM模式不使用局域网ip（网卡模式）"
date: 2026-01-28
last_modified_at: 2026-01-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ec200m-ecm模式不使用局域网ip-网卡模式/
toc: true
---

## 问题描述
使用EC200M 4G模组，客诉ifconfig看到的usb0节点为局域网ip，希望看到的是公网ip。

## ECM拨号解析
```yaml
┌────────────┐        USB (ECM)        ┌─────────────┐
│ RK3568     │  usb0: 192.168.225.2    │ EC200M      │
│ Linux Host │◄──────────────────────► │ ECM 网卡    │
│            │        NAT              │ wwan: 公网IP│
└────────────┘                         └─────────────┘
                                              ▲
                                              │
                                           蜂窝公网

```
- usb0 拿到的 是 EC200M 内部 DHCP 分配的私网 IP
  - 常见：192.168.225.x / 192.168.1.x
- 真正的公网 IP 在模组内部
  - 用 AT+CGPADDR / AT+QIACT 能看到
- Linux 走 EC200M 做 NAT

## 解决方式
此方式不适用于EC20，只适用于EC200M，因为EC200M可以支持路由或者网卡模式，前者是做了NAT，所以usb0获取到的是以局域网IP。而EC20不支持这两种模式的切换。
参考：
https://forumschinese.quectel.com/t/topic/9673
https://forums.quectel.com/t/port-forwarding-on-quectel-eg912y-eu/20221/5

![alt text](/assets/images/ubuntu-开发指南/ec200m-ecm模式不使用局域网ip-网卡模式/PixPin_2026-01-28_15-36-14.png)

- 查询的话用
AT+QCFG="nat"

- 设置为网卡模式
AT+QCFG="nat",1
```bash
$ echo -e 'AT+QCFG="nat"\r' >/dev/ttyUSB2 && cat /dev/ttyUSB2
AT+QCFG="nat"
+QCFG: "nat",1

OK
```
注意切换后进行硬重启。
