---
title: "Git 如何修改已有的分支名称"
date: 2025-01-17
last_modified_at: 2025-01-17
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-如何修改已有的分支名称/
toc: true
---

### 修改本地分支名称

1. **重命名分支**  
   使用以下命令重命名分支：

   ```bash
   git branch -m <旧分支名> <新分支名>
   ```

   或者，如果你当前不在该分支上，可以直接用：

   ```bash
   git branch -m <新分支名>
   ```

   **示例**：  
   如果你想把 `old-branch-name` 改为 `new-branch-name`，可以执行：

   ```bash
   git branch -m old-branch-name new-branch-name
   ```

   如果你当前就在 `old-branch-name` 上，只需：

   ```bash
   git branch -m new-branch-name
   ```

---

### 修改远程分支名称

重命名本地分支后，还需要同步到远程仓库，尤其是如果该分支已经推送到远程。

1. **删除旧的远程分支**  
   首先删除远程仓库中旧的分支名称：

   ```bash
   git push origin --delete <旧分支名>
   ```

2. **推送新的分支名称**  
   将本地重命名后的分支推送到远程：

   ```bash
   git push origin <新分支名>
   ```

3. **更新分支的默认跟踪**  
   如果本地新的分支需要与远程对应的新分支建立关联，可以运行：

   ```bash
   git branch --set-upstream-to=origin/<新分支名>
   ```

---

### 注意事项

- 如果其他开发人员正在使用旧的分支名称，请提前通知他们，避免混淆。
- 删除远程分支后，其他开发人员需要运行以下命令清理本地对旧分支的引用：

  ```bash
  git fetch --prune
  ```

---

### 总结命令

1. **重命名本地分支**：
   ```bash
   git branch -m <旧分支名> <新分支名>
   ```

2. **删除远程旧分支**：
   ```bash
   git push origin --delete <旧分支名>
   ```

3. **推送新分支到远程**：
   ```bash
   git push origin <新分支名>
   ```

4. **更新本地分支的跟踪设置**：
   ```bash
   git branch --set-upstream-to=origin/<新分支名>
   ```
