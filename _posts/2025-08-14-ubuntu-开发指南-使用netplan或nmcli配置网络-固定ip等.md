---
title: "使用netplan或nmcli配置网络（固定IP等）"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/使用netplan或nmcli配置网络-固定ip等/
toc: true
---

## 方法一：netplan
- 编辑配置文件(可查看/etc/netplan/下有没有其他文件，可以在已有的文件上编辑，没有则创建)
`/etc/netplan/01-netcfg.yaml`

```yaml
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    # 配置 eth0 网卡
    eth0:
      dhcp4: no
      addresses:
        - 192.168.137.100/24    # eth0 使用 .100
      # 网关只需在一个网口配置
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114]
      optional: true

    # 配置 eth1 网卡
    eth1:
      dhcp4: no
      addresses:
        - 192.168.137.101/24    # eth1 使用 .101
      gateway4: 192.168.137.1   # 网关在 eth1 配置
      # DNS 已在 eth0 配置，这里省略避免重复
      optional: true
```

- 应用配置
```bash
sudo netplan apply
```

## 方法二：nmcli
- 检查当前连接
```bash
nmcli connection show
```

可能输出如下
```bash
root@user:~# nmcli connection show
NAME                UUID                                  TYPE      DEVICE
有线连接 1          cca1a9b0-df00-314e-8f87-05f81c67db28  ethernet  eth0
docker0             a8051871-9a26-47ee-a0fe-bcba3cb07f53  bridge    docker0
有线连接 2          70d26e70-667a-3d67-abe6-70441a4d719d  ethernet  --
CDHX_2.4G           34dda183-6e96-422a-bca7-cec44a27ea22  wifi      --
CDHX_5G             be66b53e-d21c-48d4-80be-4333a28c647d  wifi      --
HWTEK-5G            82d8f4db-b76c-4091-830e-707dc5c8a6da  wifi      --
HW-USER             e2578d41-5dbf-48cc-a552-5d2f95a6e0c3  wifi      --
test_2.4g           9a7dda72-ef8d-406a-9653-701e3e12a54b  wifi      --
Wired connection 4  0fc8b6dd-ac68-3e85-93d9-e6857951043c  ethernet  --
Wired connection 5  98f551ac-6da4-37a2-b5bc-a4be06ec0bc6  ethernet  --

```

- 使用下面的配置
eth0:
```bash
sudo nmcli con mod "有线连接 1" \
    ipv4.addresses 192.168.137.100/24 \
    ipv4.gateway 192.168.137.1 \
    ipv4.dns "8.8.8.8,114.114.114.114" \
    ipv4.method manual
```

eth1:
```bash
sudo nmcli con mod "有线连接 2" \
    ipv4.addresses 192.168.137.101/24 \
    ipv4.method manual \
    ipv4.never-default yes
```

- 应用配置
eth0: 
```bash
sudo nmcli con down "有线连接 1" && sudo nmcli con up "有线连接 1"
```

eth1:
```bash
sudo nmcli con down "有线连接 2" && sudo nmcli con up "有线连接 2"
```
