---
title: "nautilus Called net usershare info but it failed 执行子进程“net”失败（No such file or directory）"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/nautilus-called-net-usershare-info-but-it-failed-执行子进程-net-失败-no-such-file-or-directory/
toc: true
---

## 问题描述
打开文件管理器，报错如下
```bash
nautilus[213633]: Called "net usershare info" but it failed: 执行子进程“net”失败（No such file or directory）
```

nautilus-share 是 Nautilus 的 Samba 文件夹共享扩展，每次 nautilus 启动它都会调用 net usershare info 查询共享列表。但 nautilus-share 只 Recommends（推荐）samba-common-bin，不是 Depends（硬依赖），所以安装时没把 net 命令带进来。

## 解决方式
```bash
sudo apt install samba-common-bin
```
