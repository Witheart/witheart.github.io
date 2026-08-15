---
title: "单独克隆单个分支"
date: 2026-06-25
last_modified_at: 2026-06-25
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/单独克隆单个分支/
toc: true
---

要单独拉取（clone）这个特定的分支，你可以使用 `git clone` 命令并结合 `-b` 和 `--single-branch` 参数。

请在终端中运行以下命令：

```bash
git clone -b libmali --single-branch https://github.com/JeffyCN/mirrors.git

```

**参数说明：**

- `-b libmali`：指定要克隆的分支名称为 `libmali`。
- `--single-branch`：告诉 Git 只获取这一个分支的历史记录，忽略仓库中的其他分支。
- `https://github.com/JeffyCN/mirrors.git`：这是该仓库的 `.git` 克隆地址。
