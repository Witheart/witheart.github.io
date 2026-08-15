---
title: "Android git commit 规范"
date: 2025-12-18
last_modified_at: 2025-12-18
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/android-git-commit-规范/
toc: true
---

## 原则
有具体的找具体的修改
比如设计DP显示的支持，虽然设计内核和设备树，但是可以归类为更具体的显示，所以用display

## 版本
导入
version: 版本号自动使用branch名称和日期拼接。

Android系统显示的版本号将会显示如下
<git分支名称>-<日期(20xxxxxx)>

每次发布一个版本后，提交空分支说明版本，便于版本溯源，如下
git commit --allow-empty -m "version: QY-3588-factorytest-e_L_1366x768_S6-01-20251218"

## apk预装、更新
预装apk
客户apk
apk(客户): 预装客户软件xx、xx。
我们自己的apk
apk(our): 更新厂测工具。修复了xx功能。

## 显示
display(LVDS): 更新LVDS分辨率为1920x1080_S8
display(eDP):
还有HDMI
DP等等

display: 修改LVDS为主屏，HDMI为副屏。

## 系统定制
此处不区分是我们自己定制的功能还是客户定制的功能，因为客户定制的功能也有可能导入标准分支。主要是Android系统层级的定制
如设置中无线adb开关、otg开关、分辨率调节
os-custom(adb): 在设置中增加adb开关

## 内核相关
主要是接口驱动适配
wifi驱动适配
driver(WiFi): 适配了WiFi模组 CM-256

## 硬件资源配置（设备树）
设备树资源未打开，关闭的修改
dts(sata): 开启mSATA功能
dts(uart): 修改串口名称

## 开机脚本
如在开机脚本中修改gpio默认电平
boot(gpio):
