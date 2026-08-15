---
title: "OSTree 常用命令"
date: 2025-01-06
last_modified_at: 2025-01-06
categories:
  - "OSTree 使用"
tags:
  - "OSTree 使用"
permalink: /ostree-使用/ostree-常用命令/
toc: true
---

OSTree 是一种强大的文件系统管理工具，广泛应用于操作系统版本控制和分发。本文总结了 OSTree 的常用命令，按功能进行分类，便于读者快速查阅。

## **1 仓库管理**

### **1.1 初始化仓库**

- 初始化压缩存档模式仓库（用于远程分发）：

  ```bash
  ostree --repo=/path/to/repo init --mode=archive-z2
  ```

#### 1.1.1 仓库模式对比与选择

| 模式               | 存储形式              | 是否压缩 | 是否支持远程 `pull` | 使用场景                           |
|--------------------|-----------------------|----------|---------------------|------------------------------------|
| **bare**           | 文件硬链接           | 否       | 否                  | 本地开发或直接部署                 |
| **bare-user**      | 文件硬链接（非 root 用户） | 否   | 否                  | 非特权用户的本地开发               |
| **bare-user-only** | 文件硬链接（权限更严格） | 否       | 否                  | 更高安全性需求的本地开发           |
| **archive-z2**     | 压缩存档             | 是       | 是                  | 远程分发，节省存储和带宽           |

#### 仓库模式选择建议

- **本地开发和调试**：使用 `bare` 或 `bare-user` 模式（根据权限需求选择）。
- **直接部署到文件系统**：使用 `bare` 模式。
- **远程分发更新（如 OTA）**：使用 `archive-z2` 模式。
- **严格文件权限控制**：使用 `bare-user-only` 模式。


---

### **1.2 查看和管理分支**

- 列出仓库中的分支：

  ```bash
  ostree --repo=/path/to/repo refs
  ```

- 删除分支：

  ```bash
  ostree --repo=/path/to/repo refs --delete <branch-name>
  ```

---

### **1.3 查看仓库配置**

- 查看远程仓库列表：

  ```bash
  ostree --repo=/path/to/repo remote list
  ```

- 删除远程仓库配置：

  ```bash
  ostree --repo=/path/to/repo remote delete <REMOTE_NAME>
  ```

---

## **2 提交文件系统**

### **2.1 提交文件系统内容**

- 将目录内容提交到特定分支：

  ```bash
  ostree --repo=/path/to/repo commit -b <branch-name> \
      --subject="Commit message" --tree=dir=/path/to/dir
  ```

- 从挂载的 `.img` 文件提交文件系统内容：

  ```bash
  sudo mount -o loop /path/to/rootfs.img /mnt
  ostree --repo=/path/to/repo commit -b <branch-name> \
      --subject="Initial commit from img" --tree=dir=/mnt
  sudo umount /mnt
  ```

---

### **2.2 查看提交记录**

- 查看分支的提交历史：

  ```bash
  ostree --repo=/path/to/repo log <branch-name>
  ```

---

## **3 签出文件系统**

### **3.1 签出分支内容**

- 签出分支最新提交到指定目录：

  ```bash
  ostree checkout <branch-name> /path/to/target \
      --repo=/path/to/repo
  ```

- 签出特定提交到指定目录：

  ```bash
  ostree checkout -C <commit-hash> /path/to/target \
      --repo=/path/to/repo
  ```

- 查看签出结果：

  ```bash
  ls /path/to/target
  ```

---

## **4 远程操作**

### **4.1 添加远程仓库**

- 添加远程仓库：

  ```bash
  ostree remote add <remote-name> <remote-url> \
      --repo=/path/to/local/repo
  ```

- 列出远程仓库的分支：

  ```bash
  ostree remote refs <remote-name> --repo=/path/to/local/repo
  ```

---

### **4.2 拉取远程数据**

- 从远程仓库拉取分支内容：

  ```bash
  ostree pull <remote-name> <branch-name> \
      --repo=/path/to/local/repo
  ```

- 深度拉取完整提交历史：

  ```bash
  ostree pull <remote-name> <branch-name> \
      --repo=/path/to/local/repo --depth=-1
  ```

- 生成远程仓库 `summary` 文件（解决分支不可见问题）：

  ```bash
  ostree --repo=/path/to/remote/repo summary -u
  ```

---

### **4.3 禁用 GPG 验证**

- 如果拉取时报 GPG 验证错误，在本地仓库配置文件 `/mnt/hdd/ostree_local/repo/config`中禁用 GPG 验证：

  ```ini
  [remote "<remote-name>"]
  url=<remote-url>
  gpg-verify=false
  ```

---

## **5 环境变量配置**

- 临时设置仓库路径环境变量：

  ```bash
  export OSTREE_REPO=/path/to/repo
  ```

- 永久设置环境变量（添加到 `~/.bashrc` 或 `~/.zshrc` 中）：

  ```bash
  export OSTREE_REPO=/path/to/repo
  source ~/.bashrc
  ```
