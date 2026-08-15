---
title: "3568 Ubuntu todesk & 向日葵bug"
date: 2025-05-07
last_modified_at: 2025-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3568-ubuntu-todesk-向日葵bug/
toc: true
---

## todesk
- 显示正常，但鼠标移动缓慢
- 应该是cpu占用很多导致的，运行时rk3568，4个核心占用都在80%以上

## 向日葵
- 显示有可能不刷新（卡死），但是鼠标控制是正常的
- 经实验，通过插拔HDMI刷新显示，可有概率恢复屏幕刷新
- 通过先开启todesk，再开启向日葵，有几率修复向日葵的屏幕卡死状态
