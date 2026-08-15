---
title: "去除Qt程序文件选择对话框中最近位置（Select File - Recent Place）"
date: 2026-03-03
last_modified_at: 2026-03-03
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/去除qt程序文件选择对话框中最近位置-select-file-recent-place/
toc: true
---

## 问题描述
- 客户要求去除Qt程序文件选择对话框中最近位置（Select File - Recent Place）
![alt text](/assets/images/ubuntu-开发指南/去除qt程序文件选择对话框中最近位置-select-file-recent-place/b94896a751f4d1e91bea28a91c094f10.jpg)

## 解决方式
删除~/.config/QtProject.conf

## 原理
查看~/.config/QtProject.conf，内容如下
[FileDialog]
history=file:///home/KangHua/\x684c\x9762
lastVisited=file:///home/KangHua/\x684c\x9762
qtVersion=5.15.2
shortcuts=file:, file:///home/KangHua

里面有 UTF-8 编码的历史位置。
