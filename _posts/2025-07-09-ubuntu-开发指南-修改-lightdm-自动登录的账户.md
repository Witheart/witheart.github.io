---
title: "修改 LightDM 自动登录的账户"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/修改-lightdm-自动登录的账户/
toc: true
---

### 1. **编辑 LightDM 配置文件**
   - 打开终端，使用管理员权限编辑 LightDM 的主配置文件：
     ```bash
     sudo nano /etc/lightdm/lightdm.conf
     ```
   - **如果文件不存在**，检查 `/etc/lightdm/lightdm.conf.d/` 目录下的配置文件（如 `autologin.conf`），或直接创建新文件。

### 2. **修改自动登录账户**
   - 在文件中找到 `[Seat:*]` 部分（若不存在则手动添加），修改以下两行：
     ```ini
     [Seat:*]
     autologin-user = 新用户名  # 替换为你的新账户名
     autologin-user-timeout = 0  # 设置为 0 表示立即登录
     ```
   - 示例（将用户改为 `john`）：
     ```ini
     [Seat:*]
     autologin-user = john
     autologin-user-timeout = 0
     ```

### 3. **保存并退出**
   - 按 `Ctrl + O` 保存文件，`Ctrl + X` 退出编辑器。

### 4. **重启 LightDM 服务**
   - 应用更改：
     ```bash
     sudo systemctl restart lightdm
     ```
   - 如果当前在图形界面，系统会重新加载登录管理器。

### 5. **验证自动登录**
   - 重启系统或重新登录，检查是否自动进入新账户的 Xfce 桌面。
