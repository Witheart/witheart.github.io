---
title: "用户添加 sudo 权限"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/用户添加-sudo-权限/
toc: true
---

### 方法1：使用 `usermod` 命令（推荐）
1. **打开终端**，使用已拥有 `sudo` 权限的用户登录。
2. **将用户添加到 `sudo` 组**：
   ```bash
   sudo usermod -aG sudo user
   ```
   - `-aG`：表示追加（`a`）到指定的组（`G`），不覆盖原有组。
   - `sudo`：目标用户组。
   - `user`：需要权限的用户名（替换为你的用户名）。

3. **生效变更**：
   - **重新登录**该用户（注销并重新登录）。
   - 或在终端刷新组权限（仅当前会话有效）：
     ```bash
     newgrp sudo
     ```

4. **验证权限**：
   ```bash
   sudo whoami
   ```
   若返回 `root`，表示配置成功。

---

### 方法2：手动编辑 `/etc/sudoers` 文件（谨慎操作）
1. 使用命令安全编辑配置：
   ```bash
   sudo visudo
   ```

2. **在文件末尾添加**（任选一行）：
   ```bash
   user   ALL=(ALL:ALL) ALL     # 允许执行所有命令（需密码）
   # 或免密码使用sudo（不推荐）：
   user   ALL=(ALL) NOPASSWD:ALL
   # 或免密码且可同时指定组
   user   ALL=(ALL:ALL) NOPASSWD:ALL	
   ```

3. **保存并退出**：
   - 按 `Ctrl+X` → 按 `Y` → 按 `Enter`。
   - **注意**：语法错误可能导致系统锁死！务必使用 `visudo` 而非直接编辑。

---

### 检查用户所属组
```bash
groups user
```
若输出包含 `sudo`，表示用户已在组中：
```
user : user sudo ...其他组...
```
