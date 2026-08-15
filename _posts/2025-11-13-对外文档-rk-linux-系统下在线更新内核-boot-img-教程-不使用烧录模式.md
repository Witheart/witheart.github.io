---
title: "rk Linux 系统下在线更新内核 boot.img 教程（不使用烧录模式）"
date: 2025-11-13
last_modified_at: 2025-11-13
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/rk-linux-系统下在线更新内核-boot-img-教程-不使用烧录模式/
toc: true
---

概要：本文介绍如何在 rk Linux 系统中不使用烧录模式（Loader）进行内核 boot.img 的在线更新。适用于无法进入烧录模式的场景，如客户装机完成后的现场调试等，通过命令行实现内核的替换与更新。


## 参考链接
https://wiki.t-firefly.com/zh_CN/ROC-RK3328-PC/ubuntu_manual.html#zai-xian-geng-xin-nei-he-he-u-boot

## 1. 使用目的  

此方式无需进入烧录模式（Loader），不使用瑞芯微开发工具进行烧录，而是在 Linux 系统启动后，通过系统内执行命令直接更新内核。  

适用于以下场景：

- 不方便进入烧录模式（如设备已部署、现场调试）  
- 无需额外工具，仅依赖已有 Linux 系统运行环境  

---

## 2. 具体原理  

系统启动时，会将内核从 boot 分区加载并复制到内存中运行。此时，可以通过写入命令更新存储设备上的 boot.img 文件。  

更新完成后，系统仍旧运行在旧内核中，但下次重启时，将从硬盘加载新的 boot.img，从而完成内核的更新。

---

## 3. 具体命令  

使用如下命令将新的 boot.img 写入 boot 分区：

```bash
dd conv=fsync,notrunc if=/usr/share/kernel/boot.img of=/dev/disk/by-partlabel/boot
```

- **if=** 指定新的 boot.img 路径（本示例为 /usr/share/kernel/boot.img）  
- **of=** 指定 boot 分区设备路径（本示例使用 by-partlabel 方式定位）  
- **conv=fsync,notrunc** 确保写入后同步磁盘，且不截断目标文件  

> 注意事项：
> - 确保路径 /dev/disk/by-partlabel/boot 正确指向 boot 分区  
> - 建议操作前备份原始 boot.img，以便恢复  
