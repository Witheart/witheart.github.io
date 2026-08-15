---
title: "git 批量修改一段连续commit的用户名和邮箱 —— rebase"
date: 2026-03-30
last_modified_at: 2026-03-30
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-批量修改一段连续commit的用户名和邮箱-rebase/
toc: true
---

```bash
git rebase -i HEAD~5 --exec "git commit --amend --author='新名字 <新邮箱>' --no-edit"
```

如果要修改的提交中有空提交，需要加入--allow-empty选项：
```bash
git rebase -i HEAD~5 --exec "git commit --amend --author='新名字 <新邮箱>' --no-edit --allow-empty"
```

敲入命令后，会打开一个编辑器显示修改的内容，直接保存退出即可。
