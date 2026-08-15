---
title: "Ubuntu查看用户所属的组及加入其他组"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu查看用户所属的组及加入其他组/
toc: true
---

## 1 查看用户所属的组
1.  **`groups` 命令：**
    ```bash
    groups [username]
    ```
    - **不加 `username`：** 查看 **当前登录用户** 所属的所有组。
    - **加 `username`：** 查看指定用户 `username` 所属的所有组。
    - **输出示例：** `username : group1 group2 group3`。第一个列出的组通常是用户的 **主组 (Primary Group)**。

2.  **`id` 命令：**
    ```bash
    id [username]
    ```
    - 不加 `username` 查看当前用户。
    - 显示的信息更全面，包括用户 ID (`uid`)、主组 ID (`gid`)、用户所属的所有组及其 ID (`groups` 或 `groups=` 后面的列表)。
    - 可以使用 `-n` 选项显示名称而非数字 ID：
        ```bash
        id -nG [username]  # 只显示所属组名列表 (包括主组)
        id -Gn [username]   # 同上
        ```
    - **输出示例：**
        ```
        uid=1001(john) gid=1001(john) groups=1001(john),27(sudo),999(docker)
        # 使用 id -nG john
        john sudo docker
        ```

## 2 加入其他组
要将指定用户（例如用户名 `target_user`）加入其他组中，请使用以下命令：
**以下为示例，请确保系统中有这些组**
```bash
sudo usermod -aG adm,disk,dialout,cdrom,sudo,audio,dip,video,plugdev,staff,systemd-journal,bluetooth,netdev,pulse-access,lpadmin,docker target_user
```

### 命令说明：
1. **`sudo`**：需要管理员权限
2. **`usermod -aG`**：
   - `-a` 表示追加（不覆盖现有组）
   - `-G` 指定要加入的组列表
3. **组名**：使用逗号分隔的组名列表（不需要组ID）
4. **`target_user`**：替换为实际需要操作的用户名

### 验证操作：
执行后检查是否成功：
```bash
groups target_user
# 或
id -nG target_user
```

### 重要提示：
- 新组权限将在用户**下次登录后生效**
