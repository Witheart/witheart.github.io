---
title: "Ubuntu 20.04 局域网内 VPN(L2TP IPsec)服务器搭建"
date: 2025-12-03
last_modified_at: 2025-12-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-20-04-局域网内-vpn-l2tp-ipsec-服务器搭建/
toc: true
---

读者一定好奇，为什么要在局域网中搭建 VPN 服务器。笔者搭建服务器的目的，主要是为了测试其他设备的 vpn 功能是否正常。具体配置文件可见笔记同目录下内容，配置文件和文章中的配置不太一样，但是是经验证两份配置都是可以正常使用的。

## 一、服务器端配置（LNS）

以下是在 Linux 上搭建 L2TP/IPsec 服务器的完整配置：

### 1. 安装必要软件

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install strongswan xl2tpd ppp
```

### 2. 配置 IPsec（StrongSwan）

**编辑 `/etc/ipsec.conf`：**

```conf
config setup
    charondebug="ike 2, knl 2, cfg 2"
    uniqueids=no

conn l2tp-psk
    auto=add
    keyexchange=ikev1
    authby=secret
    type=transport
    left=%defaultroute
    leftprotoport=17/1701
    right=%any
    rightprotoport=17/%any
    ike=aes256-sha1-modp1024,aes128-sha1-modp1024,3des-sha1-modp1024!
    esp=aes256-sha1,aes128-sha1,3des-sha1!
    dpddelay=30
    dpdtimeout=120
    dpdaction=clear
```

**编辑 `/etc/ipsec.secrets`：**

```conf
# 格式：服务器IP %any : PSK "预共享密钥"
%any %any : PSK "MyAndroidVPN123"
```

### 3. 配置 L2TP（xl2tpd）

**编辑 `/etc/xl2tpd/xl2tpd.conf`：**

```conf
[global]
ipsec saref = yes
listen-addr = 你的服务器IP地址  # 由于我们是搭建局域网中的vpn，此处填写机器在局域网中的地址

[lns default]
ip range = 192.168.100.100-192.168.100.200
local ip = 192.168.100.1
require chap = yes
refuse pap = yes
require authentication = yes
name = AndroidVPN
pppoptfile = /etc/ppp/options.xl2tpd
length bit = yes
```

**编辑 `/etc/ppp/options.xl2tpd`：**

```conf
require-mschap-v2
ms-dns 8.8.8.8
ms-dns 8.8.4.4
asyncmap 0
auth
crtscts
lock
hide-password
modem
proxyarp
lcp-echo-interval 30
lcp-echo-failure 4
```

**创建用户认证文件 `/etc/ppp/chap-secrets`：**

```conf
# 格式：用户名 服务器名 密码 允许的IP
androiduser * androidpass123 *
testuser * testpass *
```

### 4. 配置系统内核和防火墙

```bash
# 启用IP转发
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 配置防火墙规则（如果使用ufw）
sudo ufw allow 500/udp
sudo ufw allow 4500/udp
sudo ufw allow 1701/udp
sudo ufw allow proto udp from 192.168.100.0/24

# 或者使用iptables
sudo iptables -A INPUT -p udp --dport 500 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 4500 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 1701 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -s 192.168.100.0/24 -j MASQUERADE
```

由于是在局域网中，客户端和服务器同网段且无 NAT，因此内层 L2TP/UDP 1701 会被直接封装在 ESP（IP 协议号 50）中，而不是走 UDP 4500 的 NAT-T。ufw 已放行 UDP 500/4500/1701，但未放行 proto 50 。这导致数据面的 ESP 报文被丢弃， xl2tpd 收不到呼入，连接失败。
需要添加
```bash
sudo iptables -A INPUT -p esp -j ACCEPT
sudo iptables -A OUTPUT -p esp -j ACCEPT
```
注意，规则重启将会失效，需要重新设置。

或者在ipsec.conf 的 conn 段添加：`forceencaps=yes`，在 ESP 数据包上再封装一层 UDP 头。很多防火墙只允许 TCP/UDP 通过，会阻止 IP 协议 50（ESP）
封装后看起来就像普通的 UDP 流量，更容易通过防火墙。且NAT 设备通常能正常处理 UDP，但对 ESP 支持不好。

### 5. 启动服务

```bash
sudo systemctl enable strongswan-starter
sudo systemctl enable xl2tpd
sudo systemctl start strongswan-starter
sudo systemctl start xl2tpd

# 重启IPsec
sudo ipsec restart
```

如果修改配置后，需要restart
```bash
sudo systemctl restart strongswan-starter
sudo systemctl restart xl2tpd
sudo ipsec restart

```

## 二、Android 客户端配置

在 Android 手机上配置 L2TP/IPsec VPN：

### 1. 基本配置步骤

1. **进入设置**：设置 → 网络和互联网 → VPN
2. **添加 VPN**：点击"+"或"添加 VPN 配置"
3. **填写参数**：
   - **名称**：我的测试 VPN（任意）
   - **类型**：L2TP/IPsec PSK
   - **服务器地址**：VPN服务器在局域网中的ip
   - **IPsec 预共享密钥**：`MyAndroidVPN123`
   - **用户名**：`androiduser`
   - **密码**：`androidpass123`
4. **保存并连接**

## 三、配置成功结果
作为客户端的Android设备，使用ifconfig可以看到，在原来的wlan0基础上，新增了ppp0节点
```bash
ppp0      Link encap:Point-to-Point Protocol
          inet addr:192.168.100.100  P-t-P:192.168.100.1  Mask:255.255.255.255
          UP POINTOPOINT RUNNING NOARP MULTICAST  MTU:1400  Metric:1
          RX packets:5 errors:0 dropped:0 overruns:0 frame:0
          TX packets:11 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:3
          RX bytes:96 TX bytes:462
```

而作为服务器的主机，也会出现ppp0节点
```bash
ppp0: flags=4305<UP,POINTOPOINT,RUNNING,NOARP,MULTICAST>  mtu 1400
        inet 192.168.100.1  netmask 255.255.255.255  destination 192.168.100.100
        ppp  txqueuelen 3  (Point-to-Point Protocol)
        RX packets 11  bytes 462 (462.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 5  bytes 96 (96.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

```

如果使用Windows电脑，那么将会出现如下的连接
![alt text](/assets/images/ubuntu-开发指南/ubuntu-20-04-局域网内-vpn-l2tp-ipsec-服务器搭建/PixPin_2025-12-03_18-53-35.png)
```cmd
PPP 适配器 test:

   连接特定的 DNS 后缀 . . . . . . . :
   IPv4 地址 . . . . . . . . . . . . : 192.168.100.101
   子网掩码  . . . . . . . . . . . . : 255.255.255.255
   默认网关. . . . . . . . . . . . . : 0.0.0.0
```

- 客户端和服务端可以用vpn分配的地址相互ping通，如
服务端ping 192.168.100.100
客户端ping 192.168.100.1

- 客户端之间也可以互相ping通，就像建立了一个局域网
