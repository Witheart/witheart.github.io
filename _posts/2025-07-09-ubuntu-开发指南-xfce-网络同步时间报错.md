---
title: "XFCE 网络同步时间报错"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-网络同步时间报错/
toc: true
---

## 问题背景
xfce的网络时间同步默认没有打开，但是选择打开时会提示缺少组件需要下载，下载时又报错。
具体在桌面面板，右键时间，点击属性，点击时间和日期设置...，配置选择“与互联网服务器保持同步”时，会触发上面的问题。
![alt text](/assets/images/ubuntu-开发指南/xfce-网络同步时间报错/PixPin_2025-07-09_15-49-28.png)
## 问题原因
Ubuntu中的ntp分为两种，xfce GUI中的开关用的是传统ntp服务，而内置的ntp服务一般是另一个轻量级的​​systemd-timesyncd​。一般来说，即使GUI上面是手动同步，​​systemd-timesyncd​也会自动将时间调整好。如果真的需要用到GUI中的自动同步，参考下面的做法。

## 问题解决
参考链接
[https://www.reddit.com/r/xubuntu/comments/13wj61r/ntp_support_is_not_installed/?tl=zh-hans](https://www.reddit.com/r/xubuntu/comments/13wj61r/ntp_support_is_not_installed/?tl=zh-hans)

- 安装
```bash
sudo apt install ntp
```
然后报错消失
