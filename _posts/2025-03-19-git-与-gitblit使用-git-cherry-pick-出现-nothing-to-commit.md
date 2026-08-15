---
title: "git cherry-pick 出现 nothing to commit"
date: 2025-03-19
last_modified_at: 2025-03-19
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-cherry-pick-出现-nothing-to-commit/
toc: true
---

概要：在使用 `git cherry-pick` 命令时，可能会遇到 `nothing to commit, working tree clean` 的提示。本文将分析该问题的原因，并提供两种解决方案。  


## 1. 具体报错信息  

```sh
➜  rk3568_rk_android11.0_sdk git:(V3.005) git cherry-pick e1537e
[V3.005 ad3408bcfa] 修复8G内存下相机预览画面绿屏的问题-修复错误的提交
 Author: arm <arm@arm.com>
 Date: Mon Jul 22 16:45:55 2024 +0800
 1 file changed, 1 insertion(+), 1 deletion(-)
➜  rk3568_rk_android11.0_sdk git:(V3.005) git cherry-pick 691615
On branch V3.005
Your branch is ahead of 'origin/V3.005' by 5 commits.
  (use "git push" to publish your local commits)

You are currently cherry-picking commit 691615fbca.
  (all conflicts fixed: run "git cherry-pick --continue")
  (use "git cherry-pick --skip" to skip this patch)
  (use "git cherry-pick --abort" to cancel the cherry-pick operation)

nothing to commit, working tree clean
The previous cherry-pick is now empty, possibly due to conflict resolution.
If you wish to commit it anyway, use:

    git commit --allow-empty

Otherwise, please use 'git cherry-pick --skip'
```

---

## 2. 问题原因  

- **该提交的变更已存在于当前分支中**（最常见）。  
- **Git 检测到解决冲突后没有实际代码变化**，因此提示“空提交”。  

---

## 3. 解决方案  

根据你的需求选择以下两种操作之一：  

### **3.1 允许空提交（保留操作记录）**  

```bash
git commit --allow-empty
```

- **使用场景**：如果你希望保留这次 cherry-pick 的记录（例如：需要关联提交信息中的任务追踪号）。  
- **结果**：生成一个空提交，提交信息与 `691615` 相同。  

### **3.2 跳过该提交（不保留记录）**  

```bash
git cherry-pick --skip
```

- **使用场景**：如果该提交的变更已被其他提交覆盖，或你确认无需应用此变更。  
- **结果**：跳过 `691615`，继续后续操作（如果有其他提交在队列中）。  
