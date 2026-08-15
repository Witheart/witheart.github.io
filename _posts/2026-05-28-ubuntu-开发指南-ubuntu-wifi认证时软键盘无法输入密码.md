---
title: "Ubuntu WiFi认证时软键盘无法输入密码"
date: 2026-05-28
last_modified_at: 2026-05-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-wifi认证时软键盘无法输入密码/
toc: true
---

## 系统环境
RK3588 Ubuntu20.04 X11 + LightDM + Gnome

## 问题描述
WiFi连接时需要输入密码，此时使用物理键盘可正常输入，使用软键盘无法输入。
![alt text](/assets/images/ubuntu-开发指南/ubuntu-wifi认证时软键盘无法输入密码/PixPin_2026-05-28_18-22-59.png)

- 使用onboard时，当认证弹窗弹出，整个onboard就失去了点按反馈
- 使用辅助功能中的屏幕键盘OSK时，点按有按下反馈，但是输入框中没有内容

## 解决方式
- OSK点一下退格键或者回车键后，就可以正常输入。
- onboard暂无解决方式
