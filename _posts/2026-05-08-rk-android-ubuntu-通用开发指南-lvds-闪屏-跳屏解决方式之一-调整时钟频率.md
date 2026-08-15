---
title: "LVDS 闪屏，跳屏解决方式之一 —— 调整时钟频率"
date: 2026-05-08
last_modified_at: 2026-05-08
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/lvds-闪屏-跳屏解决方式之一-调整时钟频率/
toc: true
---

## 问题描述
3568 点LVDS屏幕，设定为datasheet的typical时钟时，屏幕显示是正常的，但是每隔几秒钟，整体画面会上下跳动一下


<video controls src="video.mp4" title="Title"></video>

## 解决方式
尝试调整dts中的时钟频率，解决
