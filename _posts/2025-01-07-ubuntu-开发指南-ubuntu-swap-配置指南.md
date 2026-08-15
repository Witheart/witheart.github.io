---
title: "Ubuntu Swap 配置指南"
date: 2025-01-07
last_modified_at: 2025-01-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-swap-配置指南/
toc: true
---

以下是如何在 Ubuntu 系统中启用、关闭和删除 Swap 的详细步骤。Swap 是虚拟内存的一部分，可以在物理内存不足时提供额外的内存支持。


## 一、开启 Swap

### 1. 检查当前 Swap 状态
执行以下命令检查系统是否已经启用了 Swap：

```bash
free -h
```

查看 `Swap` 字段的大小。如果显示为 `0B`，说明当前没有启用 Swap。

### 2. 创建 Swap 文件

使用 `fallocate` 创建一个指定大小的 Swap 文件，例如 8GB：

```bash
sudo fallocate -l 8G /swapfile
```

如果 `fallocate` 不可用，可以使用以下命令代替（性能较慢）：

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=8192
```

检查 Swap 文件是否正确创建：

```bash
ls -lh /swapfile
```

### 3. 设置文件权限

为了安全性，需要将 `/swapfile` 的权限设置为只有 root 用户可读写：

```bash
sudo chmod 600 /swapfile
```

### 4. 配置 Swap 文件

将 `/swapfile` 设置为 Swap 空间：

```bash
sudo mkswap /swapfile
```

激活 Swap 文件：

```bash
sudo swapon /swapfile
```

再次检查 Swap 状态：

```bash
free -h
```

你应该能看到 `Swap` 字段已经显示了 8GB。

### 5. 配置开机自动挂载 Swap 文件

编辑 `/etc/fstab` 文件：

```bash
sudo vim /etc/fstab
```

在文件末尾添加以下内容：

```plaintext
/swapfile none swap sw 0 0
```

保存并退出。

---

## 二、关闭和删除 Swap

### 1. 关闭当前的 Swap 文件

如果需要关闭 Swap 文件，可以使用以下命令：

```bash
sudo swapoff /swapfile
```

### 2. 从 `/etc/fstab` 中移除 Swap 配置

编辑 `/etc/fstab` 文件：

```bash
sudo vim /etc/fstab
```

删除或注释掉以下行：

```plaintext
/swapfile none swap sw 0 0
```

保存并退出。

### 3. 删除 Swap 文件

确认 Swap 文件已关闭后，删除文件：

```bash
sudo rm /swapfile
```

### 4. 确认 Swap 已完全关闭

再次检查 Swap 状态，确保 Swap 已完全关闭：

```bash
free -h
```

`Swap` 字段应显示为 `0B`。
