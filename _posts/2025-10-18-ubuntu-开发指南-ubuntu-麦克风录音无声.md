---
title: "Ubuntu 麦克风录音无声"
date: 2025-10-18
last_modified_at: 2025-10-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-麦克风录音无声/
toc: true
---

- 使用 gnome-sound-recorder 进行测试，发现麦克风声音输入失败

- 原因是alsamixer中的输入调得太小

- 终端输入
alsamixer

- 按F4切换到Capture

- 将ADC滑块调到最大
![alt text](/assets/images/ubuntu-开发指南/ubuntu-麦克风录音无声/PixPin_2025-10-18_16-41-33.png)
