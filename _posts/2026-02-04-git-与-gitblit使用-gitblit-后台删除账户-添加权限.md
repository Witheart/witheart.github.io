---
title: "Gitblit 后台删除账户 添加权限"
date: 2026-02-04
last_modified_at: 2026-02-04
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/gitblit-后台删除账户-添加权限/
toc: true
---

概要：本篇文章介绍了在 Gitblit 后台环境中如何通过命令行停止服务、编辑配置文件来删除用户或变更其权限，并展示了具体操作实例和服务启动方式。  


## 1. 查看并终止 Gitblit 服务进程  

使用 `ps` 命令查找 Gitblit 进程并终止其运行：  

```bash
ps aux | grep gitblit
```

示例输出：  
```bash
root        1126  0.2  4.1 22648600 2696644 ?    Sl   Jan07  98:07 java -cp gitblit.jar:ext/* com.gitblit.GitBlitServer --baseFolder data --dailyLogFile
arm      1227642  0.0  0.0  12304  2432 pts/3    S+   10:49   0:00 grep --color=auto gitblit
```

尝试杀掉进程：  

```bash
kill -9 1126
```

若权限不足，使用 `sudo`：  

```bash
sudo kill -9 1126
```

---

## 2. 编辑用户配置文件  

切换到 Gitblit 的数据目录，并使用 `vim` 打开 `users.conf` 文件：  

```bash
cd /mnt/nvme/gitblit-1.9.1/data
sudo vim users.conf
```

### 2.1 删除账户或修改权限  

在该配置文件中，每个用户的信息结构如下所示。可通过删除整个 `[user "xxx"]` 模块来移除用户，或调整 `role` 项添加/删除权限。以下是两个用户的实例：

#### 用户 admin 示例  

```ini
[user "admin"]
        password = PBKDF2:$0$79b29f52dc68a528728ead9ef7edfa75928a06e787ca2596b6bf47cdae104855e014bd90d1daf022e2b79dfd721c5ab467a630bb1a4e43ec15cc1c2fdb6487a1
        cookie = 0f4c04c1e084efce62bdd90c3f52a3b0771ae216
        accountType = LOCAL
        emailMeOnMyTicketChanges = true
        role = "#admin"
        role = "#notfederated"
```

#### 用户 arm 示例  

```ini
[user "arm"]
        password = PBKDF2:$0$03cfb5a8f7ace915e989fea8eae0ba8b7f294837227d74810b78aa9ba26e987e3234dcf28302a8ac67f97760dbff97a556522b49e526c9a91b12efda7844219c
        cookie = d50f8c5343e6252b79a4893e9365683cde38dece
        accountType = LOCAL
        emailMeOnMyTicketChanges = true
        role = "#admin"
        role = "#fork"
        role = "#create"
```

---

## 3. 启动 Gitblit 服务  

编辑完 `users.conf` 后，使用以下命令重新启动 Gitblit 服务：  

```bash
sudo /mnt/nvme/gitblit-1.9.1/gitblit.sh
```
