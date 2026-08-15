---
title: "vscode ssh 卡住——正在下载ssh服务器"
date: 2025-08-25
last_modified_at: 2025-08-25
categories:
  - "其他bug解决记录"
tags:
  - "其他bug解决记录"
permalink: /其他bug解决记录/vscode-ssh-卡住-正在下载ssh服务器/
toc: true
---

## 问题描述
之前vscode能通过ssh连上其他主机的，突然就不行了，点击连接后一直卡在“正在下载ssh服务器”。一般这种情况出现在vscode自动更新后。

## 原因分析
vscode的ssh插件，需要在被远程的主机上下载一个ssh服务器。每个vscode版本对应的服务器是不一样的，如果vscode自动更新了，那么就需要重新下载ssh服务器。而下载服务器的过程中，可能由于网络问题，下载卡住。

## 解决方式
- 参考网站
- [https://zhuanlan.zhihu.com/p/671718415](https://zhuanlan.zhihu.com/p/671718415)
- [https://blog.csdn.net/chongbin007/article/details/126958840](https://blog.csdn.net/chongbin007/article/details/126958840)
- [https://zhuanlan.zhihu.com/p/675422836](https://zhuanlan.zhihu.com/p/675422836)

- 实测直接更换网络为国内网络，就可以成功下载了
