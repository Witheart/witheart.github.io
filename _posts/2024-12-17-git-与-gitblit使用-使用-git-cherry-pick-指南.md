---
title: "使用 `git cherry-pick` 指南"
date: 2024-12-17
last_modified_at: 2024-12-17
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/使用-git-cherry-pick-指南/
toc: true
---

以下是一篇详细的操作指南，介绍如何使用 `git cherry-pick` 将一个分支上的部分提交应用到另一个分支。

## 1. 确定源分支和目标分支

- **源分支**：你想从中挑选提交的分支。
- **目标分支**：你想将这些提交应用到的分支。

## 2. 切换到目标分支

```bash
git checkout target-branch
```

确保目标分支是最新的状态：

```bash
git pull origin target-branch
```

## 3. 确定要挑选的提交

- 在源分支上查看提交历史：

```bash
git checkout source-branch
git log --oneline
```

- 记录下你想要应用到目标分支的提交的哈希值（或提交ID）。

## 4. 切换回目标分支

```bash
git checkout target-branch
```

## 5. 使用 `cherry-pick` 挑选提交

### 单个提交

如果只需要一个提交：

```bash
git cherry-pick <commit-hash>
```

### 多个连续提交

如果需要挑选一系列连续的提交：

```bash
git cherry-pick <start-commit>..<end-commit>
```

这里的 `<start-commit>` 是你想挑选的第一个提交的哈希值，`<end-commit>` 是你想挑选的最后一个提交的哈希值。

### 多个非连续提交

如果需要挑选多个非连续的提交，可以逐个挑选：

```bash
git cherry-pick <commit-hash1>
git cherry-pick <commit-hash2>
git cherry-pick <commit-hash3>
```

## 6. 解决冲突（如果有）

- 如果在 `cherry-pick` 过程中遇到冲突，Git会暂停操作并提示你解决冲突。
- 打开冲突文件，解决冲突后，使用 `git add` 标记为已解决。
- 使用 `git cherry-pick --continue` 继续下一个提交的应用。

```bash
# 解决冲突
git add <file>
git cherry-pick --continue
```

- 如果你想放弃 `cherry-pick`，可以使用 `git cherry-pick --abort`。

## 7. 检查结果

- 检查你的目标分支，确保提交已经成功应用：

```bash
git log --oneline
```

- 确保所有更改都已正确应用。

## 8. 推送更改（如果需要）

如果一切正常，并且你想将这些更改推送到远程仓库：

```bash
git push origin target-branch
```
