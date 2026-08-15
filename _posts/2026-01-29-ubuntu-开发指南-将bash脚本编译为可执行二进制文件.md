---
title: "将bash脚本编译为可执行二进制文件"
date: 2026-01-29
last_modified_at: 2026-01-29
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/将bash脚本编译为可执行二进制文件/
toc: true
---

## 目的
将bash脚本编译或封装为二进制可执行文件，这样就不会暴露源代码。

## 方式
- 下载shc
```bash
sudo apt install shc
```

- 进行编译
```bash
shc -f script.sh -o binary_name
```

- 如果提示没有cc，则需要安装gcc
```bash
sudo apt install -y gcc
```
