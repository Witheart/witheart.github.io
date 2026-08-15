---
title: "Ubuntu 允许 SSH 登录 root 账户"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-允许-ssh-登录-root-账户/
toc: true
---

• 作者：吴思含（Witheart）  
• 更新时间：20250407  

概要：本文介绍了如何在 Ubuntu 系统中配置 SSH 服务以允许 root 账户登录。通过修改配置文件并重启 SSH 服务，您可以轻松启用 root 用户的远程登录功能。  


## 1. 修改 SSH 配置文件  

编辑 `/etc/ssh/sshd_config` 文件

```bash
vim /etc/ssh/sshd_config
```

找到 `PermitRootLogin` 选项并将其值修改为 `yes`：  

```plaintext
PermitRootLogin yes
```  

---

## 2. 重启 SSH 服务  

修改完成后，需要重启 SSH 服务以使更改生效。  

```bash
systemctl restart ssh
```  

--- 

完成以上步骤后，您就可以通过 SSH 使用 root 账户登录 Ubuntu 系统了。
