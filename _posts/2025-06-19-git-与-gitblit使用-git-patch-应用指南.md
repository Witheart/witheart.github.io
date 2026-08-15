---
title: "git patch 应用指南"
date: 2025-06-19
last_modified_at: 2025-06-19
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-patch-应用指南/
toc: true
---

概要：本文介绍了在 Git 项目中如何正确应用补丁文件，包括使用 git apply 和 git am 两种方式的详细说明，以及处理路径问题、解决冲突和验证变更的操作指南，适合需要合并补丁或协作开发的用户参考。


## 1. 检查当前仓库状态

确保工作目录是干净的（没有未提交的修改），以避免冲突：

```bash
git status
```

如果有未保存的修改，可以先提交或暂存（使用 `git stash`）。

---

## 2. 应用补丁文件

使用 `git apply` 或 `git am` 命令应用补丁：

### 2.1 方法一：`git apply`（仅应用更改，不保留提交信息）

1. 在 Git 仓库的根目录执行
2. patch 中 ab 文件的相对路径要正确

```bash
git apply /path/to/your.patch
```

- 添加 `--check` 可测试补丁是否能正常应用（不实际修改文件）：
  ```bash
  git apply --check /path/to/your.patch
  ```
- 如果补丁包含二进制文件，添加 `--binary` 选项。

3. 补丁路径少了几层的情况

比如 Git 根目录下有 kernel 目录，而 patch 是以 kernel 本身为根目录的。  
使用 `git apply` 的 `--directory` 选项（推荐）在 Git 仓库根目录执行：

```bash
git apply --directory=kernel your_patch.patch
```

**作用**：  
自动将补丁中的路径从 `a/file.c` 和 `b/file.c` 转换为 `a/kernel/file.c` 和 `b/kernel/file.c`，确保补丁应用到正确的文件上。

4. 补丁路径多了几层的情况

使用 -p 选项：

- `-p1` 去掉一层
- `-p2` 去掉两层

### 2.2 方法二：`git am`（保留原始提交信息，适用于从 `git format-patch` 生成的补丁）

```bash
git am /path/to/your.patch
```

---

## 3. 解决冲突（如果有）

- 如果补丁与当前代码冲突，Git 会标记冲突文件。
- 手动编辑文件解决冲突后，标记为已解决：
  ```bash
  git add <冲突的文件>
  git am --continue
  ```
- 如果放弃补丁：
  ```bash
  git am --abort
  ```

---

## 4. 验证更改

```bash
git status  # 检查应用后的状态
git diff    # 查看具体修改
```

---

## 常见问题

- **补丁路径问题**：如果补丁中的路径与仓库结构不匹配，使用 `-p<n>` 参数剥离路径层级（例如 `-p1` 适用于多数情况）。
- **版本不匹配**：补丁可能基于旧代码，需手动调整。
- **二进制文件**：确保补丁中的二进制文件能被正确应用。

---

## 总结

- 优先使用 `git am` 保留提交历史（适用于 `format-patch` 生成的补丁）。
- 使用 `git apply` 更灵活，但需手动提交更改。
