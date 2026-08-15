---
title: "Ubuntu 20.04 停用 Snap 的方法"
date: 2025-09-08
last_modified_at: 2025-09-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-20-04-停用-snap-的方法/
toc: true
---

概要：本文介绍在 Ubuntu 20.04 系统中彻底停用 Snap 的方法。包括删除已安装的 Snap 软件、卸载核心文件、清除 Snap 管理工具及相关目录等步骤。无需停止 snapd 服务即可完成操作。


## 参考链接
[https://sysin.org/blog/ubuntu-remove-snap/#%E5%88%A0%E9%99%A4-Snap-%E7%9A%84%E6%96%B9%E6%B3%95](https://sysin.org/blog/ubuntu-remove-snap/#%E5%88%A0%E9%99%A4-Snap-%E7%9A%84%E6%96%B9%E6%B3%95)

## 1. 删除所有已安装的 Snap 软件  

可以使用命令查看当前安装的 Snap 软件
```bash
snap list
```

- 通过以下脚本逐一删除：

```bash
for p in $(snap list | awk '{print $1}'); do
  sudo snap remove $p
done
```

> 一般需要执行两次（桌面版可能需要三次）。当出现如下提示时，说明删除成功：

```bash
snap "Name" is not installed
core20 removed
snapd removed
```

再次执行上述命令时，如果提示如下，说明 Snap 软件已全部删除干净：

```bash
No snaps are installed yet. Try 'snap install hello-world'.
```

---

## 2. 删除 Snap 的 Core 文件  

执行以下命令停止 snapd，并卸载已挂载的 Core 文件：

```bash
sudo systemctl stop snapd
sudo systemctl disable --now snapd.socket

for m in /snap/core/*; do
   sudo umount $m
done
```

---

## 3. 删除 Snap 的管理工具  

使用 apt 命令卸载 snapd 包：

```bash
sudo apt autoremove --purge snapd
```

---

## 4. 删除 Snap 的相关目录  

彻底删除 Snap 所使用的所有目录：

```bash
rm -rf ~/snap
sudo rm -rf /snap
sudo rm -rf /var/snap
sudo rm -rf /var/lib/snapd
sudo rm -rf /var/cache/snapd
```
