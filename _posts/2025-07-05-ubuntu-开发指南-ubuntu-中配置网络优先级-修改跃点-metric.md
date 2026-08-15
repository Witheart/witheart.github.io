---
title: "Ubuntu 中配置网络优先级——修改跃点 metric"
date: 2025-07-05
last_modified_at: 2025-07-05
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-中配置网络优先级-修改跃点-metric/
toc: true
---

## 1 什么是跃点 metric
同一台ubuntu主机可能有不同的网络，比如多个有线网络、wlan、4G等等。当这些网络同时连接时，需要规定一个优先级，一般是有线>wifi>4G。优先级就是通过路由的跃点进行配置的。

输入命令查看路由
```bash
route -n
```
输出如下：
```bash
root@user:~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    100    0        0 eth0
0.0.0.0         192.168.0.1     0.0.0.0         UG    102    0        0 eth1
0.0.0.0         192.168.0.1     0.0.0.0         UG    600    0        0 wlan0
0.0.0.0         192.168.225.1   0.0.0.0         UG    1000   0        0 usb0
192.168.0.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
192.168.0.0     0.0.0.0         255.255.255.0   U     102    0        0 eth1
192.168.0.0     0.0.0.0         255.255.255.0   U     600    0        0 wlan0
192.168.225.0   0.0.0.0         255.255.255.0   U     1000   0        0 usb0
```
前四个便为路由，Gateway表示下一跳的节点，当访问不为内网的网段时，便会通过这些路由跳转出去，而每个条目都有一个Metric，也称之为跃点，跃点表示了下一跳的开销。在选择路由时，系统肯定是优先选择开销比较小的路径。所以我们可以通过修改metric，来配置网络的优先级。metric越小，网络的优先级越高。


## 2 配置方式
在桌面版本的Ubuntu中，我们一般是通过NetworkManager进行网络管理的，所以使用它进行设置，下面以设置usb0节点为例。

---

### 2.1 列出 NetworkManager 管理的连接

运行以下命令：

```bash
nmcli connection show
```

你会看到类似以下的输出：

```
NAME                UUID                                  TYPE      DEVICE
Wired connection 1  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ethernet  eth0
Wired connection 2  yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy  ethernet  eth1
MyWifi              zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz  wifi      wlan0
usb-tethering       aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa  ethernet  usb0
```

找到对应 `usb0` 的连接名称（例如可能叫 `usb-tethering` 或其他）。

---

### 2.2 设置 route-metric（跃点数）

假设你找到的连接名是 `usb-tethering`，执行：

```bash
sudo nmcli connection modify "usb-tethering" ipv4.route-metric 500
```

---

### 2.3 重启连接使设置生效

```bash
sudo nmcli connection down "usb-tethering" && sudo nmcli connection up "usb-tethering"
```

---

### 2.4 验证路由优先级

使用以下命令确认默认路由的优先级：

```bash
ip route
```

你应该看到默认网关（`default via ...`）的 metric 值反映了你设定的优先顺序。

---

## 3 如果 `usb0` 不被 NetworkManager 管理

你可以用以下命令确认：

```bash
nmcli device status
```

如果 `usb0` 状态是 `unmanaged`，你需要让 NetworkManager 管理它。

### 3.1 设置 NetworkManager 管理 `usb0`

编辑配置文件：

```bash
sudo nano /etc/NetworkManager/NetworkManager.conf
```

确保在 `[keyfile]` 段中添加或修改：

```ini
[keyfile]
unmanaged-devices=
```

然后重启 NetworkManager：

```bash
sudo systemctl restart NetworkManager
```

## 4 验证
```bash
ip route get 8.8.8.8
```

输出示例：

```
8.8.8.8 via 192.168.0.1 dev eth0 src 192.168.0.166 uid 0
    cache
```

说明：  
- 流量会通过 `eth0` 接口发出  
- `src` 是使用的源 IP（你的本地地址）  
- `via` 是网关地址
