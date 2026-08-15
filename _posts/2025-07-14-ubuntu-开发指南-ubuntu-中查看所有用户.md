---
title: "Ubuntu 中查看所有用户"
date: 2025-07-14
last_modified_at: 2025-07-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-中查看所有用户/
toc: true
---

在Ubuntu系统中，可以通过以下方法查看用户列表：

### 1. **查看所有用户**
   ```bash
   getent passwd
   ```
   - **说明**：显示系统所有用户（包括系统账户和普通用户），格式为：
     ```
     用户名:密码占位符(x):UID:GID:描述:家目录:登录Shell
     ```

### 2. **查看普通用户（UID ≥ 1000）**
   ```bash
   getent passwd {1000..60000}
   ```
   - **说明**：过滤 UID ≥ 1000 的用户（Ubuntu 默认普通用户范围）。
   - **简化输出**：
     ```bash
     getent passwd | awk -F: '$3 >= 1000 && $3 < 60000 {print $1}'
     ```

### 注意事项：
- **系统用户**：UID 通常为 `0-999`（如 `root`、`www-data`），用于运行服务。
- **普通用户**：UID ≥ 1000，由管理员手动创建。
- 用户信息存储在 `/etc/passwd`，密码哈希存储在 `/etc/shadow`（需 `sudo` 权限查看）。
