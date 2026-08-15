---
title: "Ubuntu 删除普通用户"
date: 2025-07-14
last_modified_at: 2025-07-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-删除普通用户/
toc: true
---

以删除普通用户`firefly`为例：

### 1. **确认用户状态**
   首先检查`firefly`用户是否已登录或存在后台进程：
   ```bash
   who | grep firefly   # 查看用户是否在线
   sudo pkill -u firefly # 强制结束用户所有进程（如果存在）
   sudo pkill -9 -u firefly # 若上一条无效，使用强制终止
   ```

### 2. **删除用户及其主目录（推荐）**
   使用`deluser`命令**删除用户并同时删除主目录和邮件池**：
   ```bash
   sudo deluser --remove-home firefly
   ```
   - `--remove-home`：连带删除`/home/firefly`目录。
   - 系统会提示`Removing user 'firefly'...`表示成功。

### 3. **仅删除用户（保留主目录）**
   若需保留用户文件（不推荐）：
   ```bash
   sudo deluser firefly  # 仅删除用户，保留/home/firefly
   ```

### 4. **验证删除结果**
   检查用户是否已从系统中移除：
   ```bash
   id firefly  # 若输出"no such user"，说明已删除
   grep firefly /etc/passwd  # 无输出表示成功
   ```
