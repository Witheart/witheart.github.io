---
title: "Ubuntu20.04 编译安装stessapptest"
date: 2026-06-10
last_modified_at: 2026-06-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu20-04-编译安装stessapptest/
toc: true
---

## 问题：Ubuntu 20.04 没有为 ARM64 编译这个包

在 Ubuntu 20.04 (Focal) 版本中，官方的 `universe` 仓库里虽然有 `stressapptest` (版本 1.0.6)，但**官方当时并没有把它编译为 `arm64` 架构的包**。它当时只提供了 `amd64` (PC机)、`armhf` (32位ARM) 等架构的版本。


---

## 解决方案：
在要部署的板子上编译：

**1. 安装编译环境**

```bash
sudo apt install build-essential git -y

```

**2. 下载源码并编译**

```bash
git clone https://github.com/stressapptest/stressapptest.git
cd stressapptest
./configure
make

```

**3. 安装到系统并运行**

```bash
sudo make install
# 测试运行，例如分配 256MB 内存测试 60秒
stressapptest -s 60 -M 256M

```

安装完成后，可以删除源码文件夹
```bash
rm -rf stressapptest
```
