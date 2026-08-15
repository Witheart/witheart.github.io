---
title: "系统下设备树导出"
date: 2025-05-26
last_modified_at: 2025-05-26
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/系统下设备树导出/
toc: true
---

- 安装设备树编译器
```bash
apt update
sudo apt install device-tree-compiler
```

- 反编译设备树
```bash
dtc -I fs /sys/firmware/devicetree/base > device_tree.dts
```

会在当前目录下生成导出的device_tree.dts，是文本形式的，可直接查看。
