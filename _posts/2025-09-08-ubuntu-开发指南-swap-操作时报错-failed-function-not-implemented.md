---
title: "swap 操作时报错：failed Function not implemented"
date: 2025-09-08
last_modified_at: 2025-09-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/swap-操作时报错-failed-function-not-implemented/
toc: true
---

概要：本文记录了在执行 swap 操作时遇到的报错信息 “Function not implemented”，并分析其原因与给出解决方案。问题的根源是 Linux 内核未启用对交换文件的支持，解决方法是编译内核时启用 CONFIG_SWAP 选项。


## 1. 问题描述  

在尝试创建和启用 swap 文件时，系统报错如下：

```bash
Last login: Mon Sep  8 09:31:21 2025
root@user:~# htop
root@user:~# sudo swapoff /swapfile
swapoff: /swapfile: swapoff failed: Function not implemented
root@user:~# sudo fallocate -l 2G /swapfile
root@user:~# sudo chmod 600 /swapfile
root@user:~# sudo mkswap /swapfile
Setting up swapspace version 1, size = 2 GiB (2147479552 bytes)
no label, UUID=45a4b3e2-c67e-4fd4-b333-ffc91e90fedf
root@user:~# sudo swapon /swapfile
swapon: /swapfile: swapon failed: Function not implemented
```

- 报错信息：`swapon: /swapfile: swapon failed: Function not implemented`
- 原因分析：该错误表明 Linux 内核在编译时没有启用对交换文件（swap file）的支持。

---

## 2. 解决方式  

### 2.1 启用内核配置选项  

在内核配置 `defconfig` 中，启用 `CONFIG_SWAP` 选项：

```bash
CONFIG_SWAP=y
```

- **说明**：该配置项用于启用 Linux 内核对 swap 区域（包括 swap 分区和 swap 文件）的支持。
- **操作建议**：重新编译内核，确保该配置项已被启用。
