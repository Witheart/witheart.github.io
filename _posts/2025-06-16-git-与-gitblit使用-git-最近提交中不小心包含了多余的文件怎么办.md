---
title: "Git 最近提交中不小心包含了多余的文件怎么办"
date: 2025-06-16
last_modified_at: 2025-06-16
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-最近提交中不小心包含了多余的文件怎么办/
toc: true
---

概要：本文介绍了当最近一次 Git 提交中误包含了多余文件时，如何通过 git reset 和 git commit --amend 等命令将其移除，同时保留对该文件的修改内容，并分离为新的提交。


## 1. 问题描述

在开发过程中，如果工作区中有两个文件需要分别提交为 A 和 B 两次 commit，但不小心在 A 提交中包含了两个文件，此时如何修改 A 提交，将多余的文件移除，同时不丢失对该文件的更改？

> 适用场景：A 提交是最近一次提交，B 提交尚未进行。

---

## 2. 解决方案步骤

### 2.1 使用 git reset 移除暂存区的文件

```bash
git reset HEAD^ -- build/make/tools/buildinfo.sh
```

- **作用**：将该文件从最近一次提交（A）中移除。
- **效果**：  
  - 暂存区：该文件被移除，状态回到 A 提交前。  
  - 工作区：仍保留该文件在 A 提交时的修改内容（不会丢失变更）。

---

### 2.2 使用 git commit --amend 修改最近一次提交

```bash
git commit --amend
```

- **作用**：修改最近一次提交（A），用当前暂存区内容（已移除多余文件）覆盖原有内容。
- **结果**：A 提交不再包含 build/make/tools/buildinfo.sh 文件。

---

### 2.3 进行新的 B 提交

- 将 build/make/tools/buildinfo.sh 添加并提交：

```bash
git add build/make/tools/buildinfo.sh
git commit -m "B 提交 - 添加 buildinfo.sh 的修改"
```

---

## 3. 最终提交历史结构

- **B 提交**：包含 build/make/tools/buildinfo.sh  
- **A 提交（修正后）**：不再包含该文件，仅保留原本应包含的内容

---
