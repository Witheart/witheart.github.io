---
title: "deb包在Windows下解压缺少软链接的问题"
date: 2026-07-15
last_modified_at: 2026-07-15
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/deb包在windows下解压缺少软链接的问题/
toc: true
---

如果在Windows下解包`librga-dev_2.2.0-1_arm64.deb`，会发现其中根本没有librga.so。原因是Windows不支持软链接，实际上该librga.so是存在包内的。

不解压，直接打开能看见软链接：
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/deb包在windows下解压缺少软链接的问题/PixPin_2026-07-15_14-46-53.png)

直接解压其实也有报错：
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/deb包在windows下解压缺少软链接的问题/PixPin_2026-07-15_14-47-31.png)
