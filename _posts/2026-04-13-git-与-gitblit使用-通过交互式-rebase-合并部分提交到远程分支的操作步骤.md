---
title: "**通过交互式 Rebase 合并部分提交到远程分支的操作步骤**"
date: 2026-04-13
last_modified_at: 2026-04-13
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/通过交互式-rebase-合并部分提交到远程分支的操作步骤/
toc: true
---

本文介绍如何将当前分支的部分提交合并到目标远程分支，采用 **`git rebase -i`（交互式 Rebase）** 的方式进行操作。

- **注意！实测会改变提交历史，建议使用cherry-pick！**

---

## **步骤 1：确保本地和远程分支同步**

在操作之前，确保目标远程分支的最新内容已同步到本地。

1. **拉取远程分支的最新内容**：

   ```bash
   git fetch origin
   ```
2. **检查远程分支在本地是否存在对应分支**：
   如果本地没有对应分支，创建一个：

   ```bash
   git checkout -b <local-branch-name> origin/<remote-branch-name>
   ```

---

## **步骤 2：切换到工作分支**

切换到需要挑选提交的当前分支：

```bash
git checkout <current-branch-name>
```

---

## **步骤 3：启动交互式 Rebase**

启动交互式 Rebase，将当前分支的提交与目标分支进行对比：

```bash
git rebase -i <target-branch-name>
```

- 这会打开一个文本编辑器，列出当前分支中相对于目标分支的所有提交。
- 示例输出：
  ```
  pick a1b2c3d Fix issue A
  pick e4f5g6h Add feature X
  pick i7j8k9l Refactor module Y
  ```

---

## **步骤 4：选择需要的提交**

1. **保留需要的提交**：

   - 每一行的开头是 `pick`，表示保留该提交。
   - 删除或注释掉不需要的提交，只保留需要的提交。例如：
     ```
     pick a1b2c3d Fix issue A
     pick e4f5g6h Add feature X
     ```
   - 删除了 `i7j8k9l` 的提交，表示该提交不会包含在 Rebase 中。
2. **保存并退出**：

   - 在编辑器中保存并退出（具体操作视编辑器而定，通常是 `Ctrl+O` 保存，`Ctrl+X` 退出）。

---

## **步骤 5：解决冲突（如有）**

如果在 Rebase 过程中出现冲突，Git 会暂停操作，并提示需要解决冲突。

1. **查看冲突文件**：

   ```bash
   git status
   ```
2. **手动解决冲突**：
   编辑冲突文件，手动选择要保留的内容。
3. **标记冲突已解决**：

   ```bash
   git add .
   git rebase --continue
   ```

   如果中途想放弃 Rebase，可以中止操作：

   ```bash
   git rebase --abort
   ```

---

## **步骤 6：完成 Rebase 并切换分支**

Rebase 成功完成后，切换到目标分支：

```bash
git checkout <target-branch-name>
```

---

## **步骤 7：合并修改并推送**

将挑选后的提交合并到目标分支，并推送到远程仓库。

1. **合并当前分支的内容**：

   ```bash
   git merge <current-branch-name>
   ```
2. **推送修改到远程仓库**：

   ```bash
   git push origin <target-branch-name>
   ```
