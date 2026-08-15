---
title: "Ubuntu Gnome 手动设置DNS并验证是否生效"
date: 2026-06-17
last_modified_at: 2026-06-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-gnome-手动设置dns并验证是否生效/
toc: true
---

## 1 设置方式
按下图方式，将DNS改为
```bash
223.5.5.5,119.29.29.29
```
注意是使用英文逗号分隔的。

### 1.1 WiFi
![alt text](/assets/images/ubuntu-开发指南/ubuntu-gnome-手动设置dns并验证是否生效/PixPin_2026-06-17_19-08-10.png)
![alt text](/assets/images/ubuntu-开发指南/ubuntu-gnome-手动设置dns并验证是否生效/PixPin_2026-06-17_19-08-34.png)

### 1.2 有线网络
![alt text](/assets/images/ubuntu-开发指南/ubuntu-gnome-手动设置dns并验证是否生效/PixPin_2026-06-17_19-09-13.png)
![alt text](/assets/images/ubuntu-开发指南/ubuntu-gnome-手动设置dns并验证是否生效/PixPin_2026-06-17_19-09-33.png)

- 设置完成后重启
```bash
sudo reboot
```

## 验证方式
### 方式一：
- 使用这个命令
```bash
nmcli dev show | grep DNS
```

- 示例输出应该是刚刚设置的内容
```bash
IP4.DNS[1]:                             223.5.5.5
IP4.DNS[2]:                             119.29.29.29
IP4.DNS[1]:                             223.5.5.5
IP4.DNS[2]:                             119.29.29.29
```

### 方式二：实际抓包
```bash
sudo apt update
sudo apt install tcpdump
```

- 清空DNS缓存
```bash
resolvectl flush-caches
```

- 启动一个终端
```bash
sudo tcpdump -n -i any port 53
```

- 启动另一个终端
```bash
resolvectl query zhihu.com
```

此时返回第一个终端，查看数据包流向
```bash
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on any, link-type LINUX_SLL (Linux cooked v1), capture size 262144 bytes
18:52:33.555492 IP 192.168.0.154.35137 > 223.5.5.5.53: 46254+ [1au] A? zhihu.com. (38)
18:52:33.560647 IP 223.5.5.5.53 > 192.168.0.154.35137: 46254 1/0/1 A 182.61.194.9 (54) 

```

可以看到，查询 zhihu.com 的请求发给了阿里 DNS（223.5.5.5）的 53 端口。
