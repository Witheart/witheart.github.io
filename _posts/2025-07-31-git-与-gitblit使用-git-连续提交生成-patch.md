---
title: "Git 连续提交生成 patch"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-连续提交生成-patch/
toc: true
---

要生成两个连续 commit（比如较早的 4c9fea 和较晚的 d439dd）的补丁，可以使用以下 Git 命令。

---

### 方法 1：生成一个合并所有修改的单一补丁文件
此方法生成一个 diff 文件，包含 **两个 commit 的所有修改**（不保留 commit 元信息）：
```bash
# 比较 4c9fea 的父节点到 d439dd 的差异
git diff 4c9fea^ d439dd > combined.patch
```

**说明**：
- `4c9fea^` 表示 `4c9fea` 的直接父节点（确保获取完整的修改范围）。
- 若 `4c9fea` 是根 commit（无父节点），改用：
  ```bash
  git diff 4c9fea d439dd > combined.patch  # 此时仅包含 d439dd 的改动
  ```

---

### 方法 2：生成每个 commit 独立的补丁文件（推荐）
此方法为每个 commit 生成单独的 `.patch` 文件（保留作者/日期/提交信息），便于用 `git am` 应用：
```bash
# 生成 4c9fea 和 d439dd 两个 commit 的独立补丁文件
git format-patch 4c9fea^..d439dd
```
**输出示例**：
```
0001-commit-message-of-4c9fea.patch
0002-commit-message-of-d439dd.patch
```

**关键参数**：
- `4c9fea^..d439dd`：指定范围（`4c9fea` 到 `d439dd`，含两端）。
- 若需输出到单个文件：追加 `--stdout > all_commits.patch`

---

### 应用补丁时的区别
| 方法        | 应用命令          | 保留 Commit 信息 |
|------------|------------------|----------------|
| 方法 1     | `git apply`      | ❌             |
| 方法 2     | `git am`         | ✅             |

选择建议：
- **需要完整提交记录**：用方法 2。
- **仅需代码修改**：用方法 1。
