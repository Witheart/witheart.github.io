---
title: "Ubuntu 修改 ssh 端口"
date: 2026-05-08
last_modified_at: 2026-05-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-修改-ssh-端口/
toc: true
---

## 第一步：备份并修改 SSH 配置文件

1. **备份配置文件**（防止改错后无法恢复）：

   ```bash
   sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
   ```

2. **编辑 SSH 配置文件**：
   可以使用 `nano` 或 `vim` 打开文件：

   ```bash
   sudo vim /etc/ssh/sshd_config
   ```

3. **修改端口号**：
   在文件中找到 `#Port 22` 这一行，打开注释，修改为想要的端口号。

## 第二步：调整防火墙规则

如果跳过这一步直接重启 SSH，可能会被锁定在服务器外，因为新的 55555 端口默认是被防火墙拦截的。

**如果使用的是 UFW 防火墙（Ubuntu 自带）：**

```bash
# 允许 55555 端口的 TCP 流量
sudo ufw allow 55555/tcp
# 重新加载 UFW 使配置生效（可选，有时需要）
sudo ufw reload
```

> 💡 **云服务器用户特别注意**：如果使用的是阿里云、腾讯云、AWS 等云服务商，除了系统内部的 UFW，还需要去**云控制台的“安全组”**中，手动添加入站规则，放行 `55555` 端口。

## 第三步重启 SSH 服务并验证

1. **重启 SSH 服务**：

   ```bash
   sudo systemctl restart ssh
   ```

2. **检查服务状态，确认没有报错**：

   ```bash
   sudo systemctl status ssh
   ```

   _如果看到绿色的 `active (running)` 字样，说明服务重启成功。_

3. **本地验证端口监听**：
   在服务器上运行以下命令，看看是不是在监听 55555：
   ```bash
   ss -tlnp | grep 55555
   ```
   _如果看到输出中有 `:55555`，说明 SSH 已经成功在该端口上待命。_

## 最终测试：建立新连接

**在断开当前 SSH 连接之前，先开一个全新的终端窗口进行测试！**

在的本地电脑（或者 SSH 客户端如 FinalShell、Termius 等）中，新建一个连接，将端口号填为 `55555`，尝试是否能正常登录。

- **如果新连接能正常登录**：现在可以安心关闭旧的 SSH 窗口了。为了安全起见，还可以回到 `sshd_config` 把默认的 22 端口彻底关掉（如果有其他管理面板，也记得同步修改端口设置）。
- **如果新连接连不上**：当前的旧 SSH 连接应该还在。回头检查一下是不是漏了哪个步骤（比如 UFW 没放行，或者云控制台安全组没配）。
