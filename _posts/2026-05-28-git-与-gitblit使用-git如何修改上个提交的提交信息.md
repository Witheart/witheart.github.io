---
title: "git如何修改上个提交的提交信息"
date: 2026-05-28
last_modified_at: 2026-05-28
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git如何修改上个提交的提交信息/
toc: true
---

## 1. 基本方法（修改最后一次提交）
```bash
git commit --amend
```
运行后会打开编辑器，让你修改提交信息。

## 2. 快速修改（不打开编辑器）
```bash
git commit --amend -m "新的提交信息"
```

## 3. 如果已经推送到远程仓库
修改本地提交后，需要强制推送到远程：
```bash
git push --force
# 或更安全的
git push --force-with-lease
```
