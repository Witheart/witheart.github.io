---
title: "指南：如何撤销某个特定 commit 的更改"
date: 2024-12-19
last_modified_at: 2024-12-19
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/指南-如何撤销某个特定-commit-的更改/
toc: true
---

在 Git 中，可以通过 `git revert` 或 `git rebase` 来撤销某个特定 commit 的更改。以下是两种方法的操作步骤：

### 方法 1：使用 `git revert` 撤销特定 commit 的更改
如果你不想改变提交历史（比如避免 `--force` 操作），可以用 `git revert` 来生成一个新的 commit，专门撤销目标 commit 的更改。

1. 找到目标 commit 的哈希值。
   ```bash
   git log
   ```
   在日志中找到要撤销的 commit 哈希值，例如 `abc1234`。

2. 运行 `git revert`：
   ```bash
   git revert abc1234
   ```
   - 这会生成一个新的 commit，逆转目标 commit 所做的更改。


### 方法 2：使用 `git rebase` 删除特定的 commit（协作开发时不建议使用！）
1. 确保你当前位于目标分支（例：`V3.011`）。
   ```bash
   git checkout V3.011
   ```

2. 交互式 rebase，找到并删除你要移除的 commit。
   ```bash
   git rebase -i HEAD~n
   ```
   - `n` 是从当前 HEAD 回退的 commit 数量。根据你的截图，`n` 确保包含目标 commit 即可。

3. 在打开的编辑器中，找到目标 commit，将其前面的 `pick` 改为 `drop` 或直接删除整行。

4. 保存并退出编辑器，Git 会重新应用其余的 commit，跳过被删除的那个。

5. 如果 rebase 没有冲突，完成后直接运行：
   ```bash
   git push --force
   ```
   > ⚠️ 注意：`--force` 会覆盖远程分支，请确保其他协作者已知此操作。

---

### 两种方法对比
- **`git revert`**：
  - 优点：不会破坏历史记录，不需要强制推送。
  - 缺点：历史中仍然保留目标 commit 痕迹。

- **`git rebase`**：
  - 优点：清理历史记录，移除目标 commit 痕迹。
  - 缺点：需要强制推送（`--force`），可能影响其他协作者。
  
根据你的需求选择适合的方法。如果团队协作密切，建议使用 `git revert`。如果是个人分支且历史需要保持整洁，可以选择 `git rebase`。
