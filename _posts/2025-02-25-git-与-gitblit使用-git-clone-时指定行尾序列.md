---
title: "Git Clone 时指定行尾序列"
date: 2025-02-25
last_modified_at: 2025-02-25
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-clone-时指定行尾序列/
toc: true
---

概要：在 Windows 主机上进行 `git clone` 后，文件的行尾序列可能会从 LF 变为 CRLF，导致一些问题。本文介绍如何在 `git clone` 之前配置 `core.autocrlf` 以确保文件的行尾序列保持为 LF。  


## 1. 问题描述  

在 Windows 主机上 `git clone` 代码仓库后，文件的行尾序列可能会从 LF 变为 CRLF。当这些文件被同步到 Linux 服务器时，可能会导致兼容性问题。  

---

## 2. 解决方案：使用 `core.autocrlf`  

在执行 `git clone` 之前，先运行以下命令设置 `core.autocrlf`：  

```sh
git config --global core.autocrlf input
```

### 2.1 `core.autocrlf` 配置选项说明  

| 选项值            | 作用说明 |
|------------------|--------------------------------------|
| `false`         | 保持文件原样，不更改换行符（适合 Windows 上的 Unix 风格开发）。 |
| `input`         | 提交时转换 CRLF 为 LF，检出时保持 LF（推荐）。 |
| `true`          | 检出时将 LF 转换为 CRLF，提交时转换回 LF（不推荐）。 |

---

## 3. 执行 `git clone`  

在设置 `core.autocrlf` 之后，再执行 `git clone` 命令：  

```sh
git clone <repo-url>
```

这样，拉取的文件会保持 LF 作为换行符，避免因 CRLF 变更导致的问题。  
