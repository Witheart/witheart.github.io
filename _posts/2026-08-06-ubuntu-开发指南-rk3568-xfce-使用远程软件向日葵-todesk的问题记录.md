---
title: "RK3568 xfce 使用远程软件向日葵、todesk的问题记录"
date: 2026-08-06
last_modified_at: 2026-08-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3568-xfce-使用远程软件向日葵-todesk的问题记录/
toc: true
---

## 环境
- RK3568
- Ubuntu20.04
- LightDM + X11 + XFCE
 
## 向日葵
- 最新版本向日葵无法显示主界面
- 低版本向日葵`sunloginclient-10.0.2.24779_kylin_arm64`可以显示主界面，也能远程连接，但是连接后虽然能看到桌面，但是有偏色，且提示向日葵已限制你以下设备，键盘鼠标，必须在被控机点击右下角的解锁才能控制

## todesk
- 最新版本todesk很卡顿
- V4.7.2.0较为正常，但发现使用1000Hz回报率的罗技鼠标时，关闭不跟手情况严重，换普通鼠标则正常，调整回报率到125Hz也正常
