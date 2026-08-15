---
title: "Ubuntu 巨型帧配置与测试"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-巨型帧配置与测试/
toc: true
---

概要：本文介绍了在 Ubuntu 系统中配置巨型帧（Jumbo Frame）的方法，并通过与 Windows PC 的直连测试验证配置是否成功。包括具体的 Ubuntu 命令操作、Windows 网卡设置步骤，以及 ping 测试示例。


## 1. 巨型帧配置
（已知8211F、8111H支持巨型帧）
在 Ubuntu 主机上配置网卡的 MTU 为 9000，以启用巨型帧支持。操作命令如下：

```bash
ifconfig eth0 down
ifconfig eth0 mtu 9000
ifconfig eth0 up
```

非root记得用sudo

---

## 2. 测试

以 Ubuntu 主机与 Windows PC 网线直连为例，进行巨型帧配置与测试。

### 2.1 配置 Windows PC 网卡为巨型帧模式

1. 打开：控制面板 → 网络和 Internet → 网络连接
2. 找到对应的网卡，右键点击“属性”  
   ![网卡属性](/assets/images/ubuntu-开发指南/ubuntu-巨型帧配置与测试/PixPin_2025-08-14_15-39-36.png)

3. 点击“配置”按钮  
   ![配置按钮](/assets/images/ubuntu-开发指南/ubuntu-巨型帧配置与测试/PixPin_2025-08-14_15-40-16.png)

4. 在“高级”标签页中，找到“巨帧数据包”选项
5. 将其设置为 `9014 字节`，点击“确定”保存  
   ![设置巨帧数据包](/assets/images/ubuntu-开发指南/ubuntu-巨型帧配置与测试/PixPin_2025-08-14_15-41-30.png)

---

### 2.2 Ubuntu 上进行 ping 测试

使用如下命令从 Ubuntu 向 Windows PC 发送大数据包：

```bash
ping -M do -s 8972 192.168.137.1
```

如输出如下，则说明巨型帧配置成功：

```bash
PING 192.168.137.1 (192.168.137.1) 8972(9000) bytes of data.
8980 bytes from 192.168.137.1: icmp_seq=1 ttl=128 time=1.03 ms
8980 bytes from 192.168.137.1: icmp_seq=2 ttl=128 time=0.847 ms
8980 bytes from 192.168.137.1: icmp_seq=3 ttl=128 time=0.747 ms
8980 bytes from 192.168.137.1: icmp_seq=4 ttl=128 time=0.644 ms
8980 bytes from 192.168.137.1: icmp_seq=5 ttl=128 time=0.794 ms
8980 bytes from 192.168.137.1: icmp_seq=6 ttl=128 time=0.691 ms
8980 bytes from 192.168.137.1: icmp_seq=7 ttl=128 time=0.789 ms
8980 bytes from 192.168.137.1: icmp_seq=8 ttl=128 time=0.741 ms
8980 bytes from 192.168.137.1: icmp_seq=9 ttl=128 time=0.673 ms
```
