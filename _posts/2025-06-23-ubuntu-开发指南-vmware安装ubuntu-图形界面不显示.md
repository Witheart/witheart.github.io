---
title: "VMware安装Ubuntu 图形界面不显示"
date: 2025-06-23
last_modified_at: 2025-06-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/vmware安装ubuntu-图形界面不显示/
toc: true
---

## 问题描述
- VMware
- Ubuntu 22.04 desktop amd64
- 安装 Ubuntu 后，图形界面不显示
- ctrl + alt + f2可以唤出tty2终端

## 解决方法
1. 关闭虚拟机（不是挂起）
2. 右键虚拟机-设置-显示器-关闭3d加速
![alt text](/assets/images/ubuntu-开发指南/vmware安装ubuntu-图形界面不显示/PixPin_2025-06-23_10-02-21.png)
