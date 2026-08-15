---
title: "移除XFCE系统的快速启动任务栏plank"
date: 2025-07-10
last_modified_at: 2025-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/移除xfce系统的快速启动任务栏plank/
toc: true
---

## 要移除的内容如下
![alt text](/assets/images/ubuntu-开发指南/移除xfce系统的快速启动任务栏plank/PixPin_2025-07-10_14-07-55.png)

这玩意其实叫plank，是一个小插件。可以发现其下方有一条小白条，多在小白条附近右键打开菜单几次，才能打开这个插件真正的菜单。
![alt text](/assets/images/ubuntu-开发指南/移除xfce系统的快速启动任务栏plank/PixPin_2025-07-10_14-13-39.png)

## 移除方式
- 最难的其实是找到插件的名称，因为这玩意其实不是xfce原生的panel，而是一个额外的插件
- 知道了这玩意叫plank就好办了，直接在“会话与启动”里面禁用它就可以
![alt text](/assets/images/ubuntu-开发指南/移除xfce系统的快速启动任务栏plank/PixPin_2025-07-10_14-15-02.png)
