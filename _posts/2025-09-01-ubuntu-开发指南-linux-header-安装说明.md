---
title: "linux-header 安装说明"
date: 2025-09-01
last_modified_at: 2025-09-01
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-header-安装说明/
toc: true
---

以在RK3588上安装Linux-Header为例。

### **步骤 1：传输 DEB 包到 RK3588**
通过 `scp` 或 U 盘将文件复制到 RK3588：
```bash
# 从本地计算机复制（在本地终端执行）
scp linux-headers-5.10.160+_5.10.160+-62_arm64.deb user@rk3588-ip:~/ 
```

---

### **步骤 2：安装 DEB 包**
在 RK3588 上执行：
```bash
# 进入文件目录
cd ~/

# 安装包（自动处理依赖）
sudo apt install ./linux-headers-5.10.160+_5.10.160+-62_arm64.deb
# 若提示依赖问题，先修复：
sudo apt --fix-broken install
```

---

### **步骤 3：验证安装**
检查文件是否成功安装：
```bash
# 查看 Headers 路径
ls /usr/src/linux-headers-5.10.160+/

# 检查 Makefile 和内核版本
cat /usr/src/linux-headers-5.10.160+/Makefile | grep "VERSION"
# 应输出：VERSION = 5
```

除了会被安装到`/usr/src/linux-headers-5.10.160+/`下，同时还会创建一个名为`/lib/modules/<version>`的软链接。
