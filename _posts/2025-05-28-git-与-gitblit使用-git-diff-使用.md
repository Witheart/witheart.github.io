---
title: "git diff 使用"
date: 2025-05-28
last_modified_at: 2025-05-28
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-diff-使用/
toc: true
---

`git diff` 是 Git 中用于比较代码差异的核心命令，可以查看工作区、暂存区、不同提交或分支之间的差异。以下是其常见使用场景和参数详解：


### **基础用法**

#### 1. **工作区 vs 暂存区（默认行为）**
```bash
git diff
```
- 显示 **工作区**（已修改但未暂存的文件）与 **暂存区**（已 `git add` 的文件）之间的差异。

#### 2. **暂存区 vs 最新提交**
```bash
git diff --staged
# 或
git diff --cached
```
- 显示 **暂存区** 与 **最新提交**（`HEAD`）之间的差异。

#### 3. **工作区 vs 最新提交**
```bash
git diff HEAD
```
- 显示 **工作区** 与 **最新提交** 之间的差异（包含未暂存的修改）。

---

### **比较历史提交**

#### 1. **两个提交之间的差异**
```bash
git diff <commit1> <commit2>
```
- 比较两个提交的差异，例如：
  ```bash
  git diff abc123 def456   # 比较两个提交哈希
  git diff HEAD~2 HEAD     # 比较前两次提交与最新提交
  ```

#### 2. **某次提交的更改**
```bash
git diff <commit>^ <commit>
```
- 查看某次提交（如 `abc123`）与其父提交的差异：
  ```bash
  git diff abc123^ abc123
  ```

---

### **限定比较范围**

#### 1. **比较指定文件**
```bash
git diff <file-path>
```
- 仅比较工作区中某个文件的差异：
  ```bash
  git diff src/app.js
  ```

### 不以交互方式展示
```bash
git --no-pager diff

```
这会临时禁用 Git 的分页器（如 less），直接将差异内容输出到终端。
