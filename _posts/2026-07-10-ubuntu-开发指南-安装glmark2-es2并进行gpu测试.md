---
title: "安装glmark2-es2并进行GPU测试"
date: 2026-07-10
last_modified_at: 2026-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/安装glmark2-es2并进行gpu测试/
toc: true
---

## 安装
- rk sdk中获取这两个预编译的包
  glmark2-data_2023.01+dfsg-1_all.deb
  glmark2-es2-x11_2023.01+dfsg-1_arm64.deb

- 安装glmark2-es2-x11_2023.01+dfsg-1_arm64.deb时，可能会报错：

```bash
# sudo dpkg -i glmark2-es2-x11_2023.01+dfsg-1_arm64.deb
Selecting previously unselected package glmark2-es2-x11.
(Reading database ... 88187 files and directories currently installed.)
Preparing to unpack glmark2-es2-x11_2023.01+dfsg-1_arm64.deb ...
Unpacking glmark2-es2-x11 (2023.01+dfsg-1) ...
dpkg: dependency problems prevent configuration of glmark2-es2-x11:
 glmark2-es2-x11 depends on libjpeg62-turbo (>= 1.3.1); however:
  Package libjpeg62-turbo is not installed.

dpkg: error processing package glmark2-es2-x11 (--install):
 dependency problems - leaving unconfigured
Processing triggers for man-db (2.9.1-1) ...
Errors were encountered while processing:
 glmark2-es2-x11

```

但是libjpeg62-turbo这个包在apt软件源中不存在，使用下面的方式安装：

```bash
wget http://ftp.debian.org/debian/pool/main/libj/libjpeg-turbo/libjpeg62-turbo_2.1.5-2_arm64.debsudo apt install libjpeg62-turbo:arm64^C

sudo apt install libjpeg62-turbo:arm64

```

## 跑分
```bash
glmark2-es2
```
rk3588目前跑分为775分。
