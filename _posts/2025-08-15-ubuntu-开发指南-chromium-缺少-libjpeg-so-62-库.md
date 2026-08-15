---
title: "chromium 缺少 libjpeg.so.62 库"
date: 2025-08-15
last_modified_at: 2025-08-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/chromium-缺少-libjpeg-so-62-库/
toc: true
---

## 问题描述
```bash
firefly@firefly:/usr/bin$ ./chromium
./chromium: error while loading shared libraries: libjpeg.so.62: cannot open shared object file: No such file or directory
```
打开chromium，显示缺少libjpeg.so.62这个库

## 解决方法

如果是这样安装
```bash
sudo apt update
sudo apt install libjpeg62
```

再次运行，虽然能找到库了，但是会显示
```bash
undefined symbol jpeg_crop_scanline,version LIBJPEG_6.2
```
应该是库的版本不对

使用以下的方式安装即可解决
```bash
sudo apt install libjpeg62-turbo:arm64
```
