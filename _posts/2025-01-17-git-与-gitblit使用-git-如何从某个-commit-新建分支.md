---
title: "Git 如何从某个 commit 新建分支"
date: 2025-01-17
last_modified_at: 2025-01-17
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-如何从某个-commit-新建分支/
toc: true
---

### 步骤 1: 查看 commit 历史
首先，确保你知道要基于哪个 commit 创建分支。可以使用以下命令查看 commit 历史：

```bash
git log --oneline
```

这会列出所有的 commit，显示每个 commit 的简短哈希值和消息。例如：

```
a1b2c3d Fix bug in login
e4f5g6h Add new feature
i7j8k9l Initial commit
```

记下你想要基于的 commit 的哈希值（例如 `a1b2c3d`）。

---

### 步骤 2: 新建分支
使用以下命令从该 commit 创建一个新分支：

```bash
git branch <新分支名> <commit-hash>
```

例如，如果要创建一个名为 `new-feature-branch` 的分支，并且基于 commit `a1b2c3d`，可以运行：

```bash
git branch new-feature-branch a1b2c3d
```

---

### 步骤 3: 切换到新分支
创建分支后，切换到新分支：

```bash
git checkout new-feature-branch
```

或者，你也可以在创建分支时直接切换到该分支，使用：

```bash
git checkout -b <新分支名> <commit-hash>
```

例如：

```bash
git checkout -b new-feature-branch a1b2c3d
```

---

### 验证分支
切换到新分支后，可以使用以下命令查看当前所在的分支：

```bash
git branch
```

当前分支会被用 `*` 标记。

---

### 总结
- `git branch <新分支名> <commit-hash>`：创建分支但不切换过去。
- `git checkout -b <新分支名> <commit-hash>`：创建分支并直接切换过去。
