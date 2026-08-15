---
title: "登录 shell 和交互式 shell"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/登录-shell-和交互式-shell/
toc: true
---

## 定义

- 登录shell：重点在 “登录”​ 。就像你回家需要“用钥匙开门”这个身份认证和初始化的过程。它的核心是为你这个用户进行一次完整的会话初始化，加载全局的和你个人专属的环境变量、路径等设置。
- 交互式shell：重点在 “交互”​ 。就像你开门后，坐下来开始跟家人（电脑）对话。它的核心是提供一个提示符，等待你输入命令，并立即给你反馈。

它们**不是对立关系**，而是两个**维度**，可以同时成立。

---


## 判断路径

### Step 1
| 场景      | 登录 shell | 交互式 shell |
| --------- | ---------- | ------------ |
| ssh 登录  | ✅         | ✅           |
| su - user | ✅         | ✅           |
| tty 登录  | ✅         | ✅           |
| 桌面终端  | ❌         | ✅           |
| bash      | ❌         | ✅           |
| 脚本      | ❌         | ❌           |

---

### Step 2

```bash
echo $-
```

如果包含 `i`：

```text
himBHs
 ^
```

✔ 交互式 shell

没有 `i`：

❌ 非交互式（脚本）

---

## 日常场景

### 场景 1：刚开机，TTY 登录

```text
Ubuntu 22.04
login: arm
Password:
```

✔ 这是：

- ✅ 登录 shell
- ✅ 交互式 shell

原因：

- 你“登录”了
- 你要开始敲命令了

---

### 场景 2：SSH 登录服务器（最常见）

```bash
ssh arm@192.168.1.100
```

✔ 这是：

- ✅ 登录 shell
- ✅ 交互式 shell

---

### 场景 3：桌面打开 Terminal（GNOME Terminal / Konsole）

```text
点击终端图标
```

默认情况下（99% 发行版）：

✔ 这是：

- ❌ 非登录 shell
- ✅ 交互式 shell

---

### 场景 4：在终端里再敲一次 `bash`

```bash
bash
```

✔ 这是：

- ❌ 非登录 shell
- ✅ 交互式 shell

---

### 场景 5：跑脚本

```bash
./build.sh
```

✔ 这是：

- ❌ 非登录 shell
- ❌ 非交互式 shell

---

### 场景 6：su 切用户（重点）

```bash
su arm
```

❌ 不是登录 shell
✔ 是交互式 shell

但：

```bash
su - arm
```

✔ 是登录 shell
✔ 是交互式 shell

`-` = **模拟一次完整登录**
