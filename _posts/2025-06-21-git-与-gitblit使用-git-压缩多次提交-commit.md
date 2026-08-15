---
title: "Git 压缩多次提交 commit"
date: 2025-06-21
last_modified_at: 2025-06-21
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-压缩多次提交-commit/
toc: true
---

概要：本文介绍了在 Git 开发过程中如何将多个提交（commit）压缩为一个提交，以便在功能测试成熟后更方便地应用到其他分支。通过 git reset --soft 和 cherry-pick 等命令实现提交合并的操作。


## 1. 背景介绍  

在开发过程中，开发者可能会为了便于维护而频繁提交多个 commit，但当功能开发和测试成熟后，这些过多的 commit 会导致在将功能集成到其他分支时变得不方便。为了简化变更历史，可以将多个提交压缩为一个提交。

---

## 2. 操作步骤  

假设当前提交历史如下：  

```
A -> B -> C -> D（D 是 HEAD）
```

你希望将 B、C、D 三个提交压缩为一个提交。

### 2.1 使用 cherry-pick 应用变更  

首先在本地分支上，可以使用 git cherry-pick 按时间顺序逐个应用提交，并解决冲突。这样可以确保每个提交的变更正确地集成到新的提交中。

### 2.2 使用 git reset --soft 进行压缩  

使用以下命令将 HEAD 重置到提交 A，但保留 B、C、D 的变更内容：

```bash
git reset --soft A
```

此命令会将暂存区（staging area）和工作区的内容保持不变，但将当前分支指针移回到 A。

### 2.3 重新提交  

此时，B、C、D 的变更仍然保留在暂存区中，你只需重新提交一次即可：

```bash
git commit -m "压缩后的提交信息"
```

这样，原本的 B、C、D 提交就被压缩成了一个新的提交。

---

## 3. 应用到其他分支  

完成上述操作后，可以使用 cherry-pick 将压缩后的单个提交方便地应用到其他分支中，避免繁琐的冲突处理和多次 cherry-pick。
