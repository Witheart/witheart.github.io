---
title: "overlayroot 系统恢复出厂设置"
date: 2026-05-25
last_modified_at: 2026-05-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-系统恢复出厂设置/
toc: true
---

## 1 清空覆盖层数据

直接删除 /media/root-rw/overlay/ 目录下的所有内容。

```bash
sudo rm -rf /media/root-rw/overlay/*
```

*(注意：执行这条命令后，当前正在运行的桌面可能会出现短暂的图标变成问号或黑屏，这是正常现象，因为底层的修改被抽空了。)*

## 2 将更改写入物理硬盘

确保删除指令真正落盘，防止缓存未同步：

```bash
sync
```

## 3 重启设备

```bash
sudo reboot
```
