---
title: "缺少librag.so"
date: 2026-07-15
last_modified_at: 2026-07-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/缺少librag-so/
toc: true
---

## 问题描述
安装后`librga2_2.2.0-1_arm64.deb`，发现/usr/lib/aarch64-linux-gnu/ 下缺少了 librga.so

```bash
lrwxrwxrwx   1 root root       15 1月   7  2022 librga.so.2 -> librga.so.2.1.0
-rw-r--r--   1 root root   188552 1月   7  2022 librga.so.2.1.0
```

期望是这样
```bash
# ls -al /usr/lib/aarch64-linux-gnu/*librga*
lrwxrwxrwx 1 root root     11 Dec 22  2023 /usr/lib/aarch64-linux-gnu/librga.so -> librga.so.2
lrwxrwxrwx 1 root root     15 Dec 22  2023 /usr/lib/aarch64-linux-gnu/librga.so.2 -> librga.so.2.1.0
-rw-r--r-- 1 root root 183360 Dec 22  2023 /usr/lib/aarch64-linux-gnu/librga.so.2.1.0
```

## 解决方式
安装`librga-dev_2.2.0-1_arm64.deb`

此处要注意，如果在Windows下解包`librga-dev_2.2.0-1_arm64.deb`，会发现其中根本没有librga.so。原因是Windows不支持软链接，实际上该librga.so是存在包内的。
