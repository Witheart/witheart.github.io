---
title: "XFCE bug 打开应用鼠标一直转圈 startup notification busy"
date: 2026-03-26
last_modified_at: 2026-03-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-bug-打开应用鼠标一直转圈-startup-notification-busy/
toc: true
---

## 问题描述
XFCE 系统中，启动应用程序，光标一直显示正在转圈的状态，同时程序卡住无法打开。此时无法使用右键功能。不稳定复现。插拔USB，可以让光标恢复正常的箭头，此时程序正常弹出。

## 问题分析
https://gitlab.xfce.org/xfce/xfwm4/-/issues/518
https://gitlab.xfce.org/xfce/xfwm4/-/merge_requests/95/diffs

![alt text](/assets/images/ubuntu-开发指南/xfce-bug-打开应用鼠标一直转圈-startup-notification-busy/PixPin_2026-03-26_17-14-46.png)

推测是 Chromium 没有主动向桌面发送 “startup complete”，而上述的bug又导致光标转圈的超时时间过长，导致动画一直无法结束。

而插拔USB呢，刚好需要重绘光标，触发某个 X11 事件或状态刷新。

## 尝试规避
关闭启动通知。
