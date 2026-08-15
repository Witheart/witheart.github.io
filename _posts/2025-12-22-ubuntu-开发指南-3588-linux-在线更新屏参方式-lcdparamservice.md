---
title: "3588 Linux 在线更新屏参方式(lcdparamservice)"
date: 2025-12-22
last_modified_at: 2025-12-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-linux-在线更新屏参方式-lcdparamservice/
toc: true
---

## 编译
gcc -o lcdparamservice lcdparamservice.c

## 部署
lcdparamservice 放到 /usr/local/bin

## 使用
将hw_lcd放到u盘中，以root身份执行./lcdparamservice
