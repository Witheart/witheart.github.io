---
title: "使用 OSTree进行文件系统 commit 指南"
date: 2025-01-08
last_modified_at: 2025-01-08
categories:
  - "OSTree 使用"
tags:
  - "OSTree 使用"
permalink: /ostree-使用/使用-ostree进行文件系统-commit-指南/
toc: true
---

本文介绍如何使用 OSTree 提交文件系统内容，适用于从 `.img` 文件中导入根文件系统并提交到 OSTree 仓库的场景。

## 1. 仓库模式对比与选择

| 模式               | 存储形式              | 是否压缩 | 是否支持远程 `pull` | 使用场景                           |
|--------------------|-----------------------|----------|---------------------|------------------------------------|
| **bare**           | 文件硬链接           | 否       | 否                  | 本地开发或直接部署                 |
| **bare-user**      | 文件硬链接（非 root 用户） | 否   | 否                  | 非特权用户的本地开发               |
| **bare-user-only** | 文件硬链接（权限更严格） | 否       | 否                  | 更高安全性需求的本地开发           |
| **archive-z2**     | 压缩存档             | 是       | 是                  | 远程分发，节省存储和带宽           |

### 仓库模式选择建议

- **本地开发和调试**：使用 `bare` 或 `bare-user` 模式（根据权限需求选择）。
- **直接部署到文件系统**：使用 `bare` 模式。
- **远程分发更新（如 OTA）**：使用 `archive-z2` 模式。
- **严格文件权限控制**：使用 `bare-user-only` 模式。

---

## 2. 初始化仓库

在指定目录中初始化仓库，选择 `archive-z2` 模式：

```bash
ostree --repo=/mnt/hdd/ostree/repo init --mode=archive-z2
```

> **说明**：`/mnt/hdd/ostree/repo` 是 OSTree 仓库的存储路径。

---

## 3. 从 `.img` 文件提交文件系统

OSTree 操作的是文件系统目录树，而非 `.img` 格式的磁盘镜像文件。需按以下步骤操作：

### 3.1 挂载 `.img` 文件

将 `.img` 文件挂载到一个目录，以访问其根文件系统内容：

```bash
sudo mount -o loop /path/to/rootfs.img /mnt
```

### 3.2 提交文件系统内容

使用 OSTree 将挂载目录的文件系统内容提交到仓库：

```bash
ostree --repo=/srv/ostree/repo commit -b my-linux-rootfs \
    --subject="Initial commit from img" --tree=dir=/mnt
```

- **`my-linux-rootfs`**：分支名称。
- **`--subject`**：提交说明。
- **`--tree=dir=/mnt`**：挂载目录路径。

### 3.3 卸载 `.img` 文件

完成提交后，卸载挂载的根文件系统：

```bash
sudo umount /mnt
```

---

## 4. 处理 Commit 异常

在某些场景（如 `bare-user` 模式）下，提交文件系统时可能会出现以下错误：

```bash
error: Not a regular file or symlink: X0
```

### 4.1 错误原因

OSTree 要求提交的内容必须是以下类型之一：

- 普通文件（regular file）  
- 符号链接（symlink）  
- 目录（directory）  

错误提示表明路径中存在其他类型的文件（如设备文件、套接字、管道等），而这些文件不被 OSTree 接受。

---

### 4.2 查找并删除异常文件

#### 查找异常文件

使用以下命令定位不被支持的文件：

```bash
sudo find /mnt/my_rootfs -type s -o -type p -o -type b -o -type c
```

#### 删除异常文件

定位后，删除这些文件：

```bash
sudo find /mnt/my_rootfs/var/lib/spamassassin/sa-update-keys/S.gpg-agent.extra \
           /mnt/my_rootfs/var/lib/spamassassin/sa-update-keys/S.gpg-agent.ssh \
           /mnt/my_rootfs/var/lib/spamassassin/sa-update-keys/S.gpg-agent \
           /mnt/my_rootfs/var/lib/spamassassin/sa-update-keys/S.gpg-agent.browser \
           /mnt/my_rootfs/var/lib/docker/volumes/backingFsBlockDev \
           /mnt/my_rootfs/tmp/.X11-unix/X0 \
           /mnt/my_rootfs/tmp/.ICE-unix/2063 -delete
```

> **提示**：文件路径仅为示例，请根据实际情况修改命令。

#### 检查删除是否成功

再次使用 `find` 命令确认是否还有异常文件未被删除：

```bash
sudo find /mnt/my_rootfs -type s -o -type p -o -type b -o -type c
```

---

### 4.3 重新提交

清理异常文件后，重新提交文件系统内容：

```bash
ostree --repo=/srv/ostree/repo commit -b my-linux-rootfs \
    --subject="Initial commit from img" --tree=dir=/mnt
```
