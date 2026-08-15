---
title: "HDMI+LVDS 双显显示比例问题"
date: 2025-04-03
last_modified_at: 2025-04-03
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/hdmi-lvds-双显显示比例问题/
toc: true
---

概要：本文介绍在 Android 系统中同时启用 HDMI 和 LVDS 输出时，由于屏幕比例不同可能导致画面拉伸的问题，并尝试通过设置系统属性来指定 UI 的绘制比例以解决此问题，但该方法在双屏显示时仍存在比例异常的情况。


## 1. 问题描述

Android 的 HDMI 和 LVDS 同时输出时，如果两个屏幕的分辨率比例不同，会出现其中一个屏幕的显示画面被拉伸或压缩的现象，影响用户体验。

---

## 2. 解决思路尝试

### 2.1 通过系统属性设置 UI 绘制比例

为了解决画面比例拉伸的问题，尝试通过设置系统属性来强制指定 UI 的绘制分辨率，以适配特定显示屏（如 LVDS）。

```bash
setprop persist.vendor.framebuffer.main 1024x768
```

- 此设置强制将系统 UI 按照 1024x768 的比例进行绘制，适用于 LVDS 屏幕。

### 2.2 属性保存位置

该设置会将属性值保存在以下路径中：

- `/data/property/persistent_properties`

---

## 3. 恢复默认设置

如果需要取消指定的 UI 绘制比例，以便 HDMI 等其他屏幕自适应分辨率，可执行以下命令：

```bash
setprop persist.vendor.framebuffer.main ""
```

- 清空该属性后，系统会恢复默认的 UI 绘制方式，尝试根据当前主屏幕的分辨率进行调整。
- 主屏幕设置为LVDS时，比例会与LVDS一致；主屏幕设置为HDMI时，即使没有接入HDMI，比例也会和HDMI的默认分辨率一致
