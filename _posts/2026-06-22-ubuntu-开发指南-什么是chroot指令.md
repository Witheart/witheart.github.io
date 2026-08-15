---
title: "什么是chroot指令"
date: 2026-06-22
last_modified_at: 2026-06-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/什么是chroot指令/
toc: true
---

## 一、什么是 chroot？

**chroot（Change Root）** 是 Linux / Unix 的一个机制，用来：

> **改变某个进程及其子进程看到的“根目录 `/`”**

换句话说：

| 正常系统       | chroot 后                |
| -------------- | ------------------------ |
| `/` 是整个系统 | `/` 变成你指定的某个目录 |
| 能访问所有文件 | 只能访问该目录里的文件   |

---

## 二、chroot 的本质

```text
真实系统
/
├── bin
├── etc
├── home
└── myrootfs
    ├── bin
    ├── etc
    └── lib
```

执行：

```bash
chroot myrootfs /bin/bash
```

之后：

```text
新环境 /
├── bin
├── etc
└── lib
```

**对 bash 来说，`myrootfs` 就是真正的 `/`**

---

## 三、chroot 能做什么？

### ✅ 常见用途

#### 1️⃣ 构建 / 调试 Linux rootfs

- 嵌入式 Linux
- ARM / RISC-V 板子
- OpenWrt / Buildroot

#### 2️⃣ 修复系统

- 系统无法启动
- 进入损坏系统的 rootfs 修 grub、密码、配置

#### 3️⃣ 软件编译 & 测试

- 在老 rootfs 里编译兼容程序
- 测试不同 libc / 不同发行版行为

## 四、chroot 的基本用法

### 1️⃣ 基本命令格式

```bash
chroot <新根目录>

chroot <新根目录> <要执行的程序>
```

示例：

```bash
sudo chroot /mnt/ubuntu-rootfs /bin/bash
```
