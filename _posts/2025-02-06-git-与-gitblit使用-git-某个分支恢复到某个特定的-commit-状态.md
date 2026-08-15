---
title: "Git 某个分支恢复到某个特定的 commit 状态"
date: 2025-02-06
last_modified_at: 2025-02-06
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-某个分支恢复到某个特定的-commit-状态/
toc: true
---

## **方法 1：使用 `git reset`（常用于本地分支，不推荐用于共享分支）**
如果你想让你的分支回退到某个特定的 commit，并且 **丢弃** 之后的所有提交，可以使用 `git reset` 命令。

### **硬重置（`--hard`，会丢弃更改）**
```sh
git reset --hard <commit-hash>
```
**效果：**
- 直接将当前分支指向 `<commit-hash>`，并且 **工作区和暂存区的更改都会丢失**。
- 适用于本地修改，不适用于已经推送到远程的分支。

### **软重置（`--soft`，保留更改）**
```sh
git reset --soft <commit-hash>
```
**效果：**
- 仅仅回退 commit 记录，保留修改的文件在暂存区（staging area）。
- 适用于想要重新提交（`git commit`）的情况。

### **混合重置（`--mixed`，保留更改但取消暂存）**
```sh
git reset --mixed <commit-hash>
```
**效果：**
- 仅回退 commit 记录，同时保留更改的文件在工作目录（但取消暂存）。
- 适用于需要重新添加（`git add`）再提交的情况。

---

## **方法 2：使用 `git checkout`（适用于临时查看）**
如果你只是想临时查看某个 commit 的状态（不会修改当前分支），可以使用：
```sh
git checkout <commit-hash>
```
**注意：**
- 这样做会让 Git 进入 "分离 HEAD（detached HEAD）" 状态，不推荐直接在这个状态下做修改。
- 如果想要继续开发，你应该创建一个新的分支：
  ```sh
  git checkout -b new-branch
  ```

---

## **方法 3：使用 `git revert`（适用于已推送的分支）**
如果你已经推送了 commit，但想要回滚到之前的状态，同时 **保留提交历史**，可以使用：
```sh
git revert <commit-hash>
```
**效果：**
- 这会创建一个新的 commit，撤销 `<commit-hash>` 之后的更改，而不会修改提交历史。

如果你想回滚多个 commit，可以使用：
```sh
git revert HEAD~3..HEAD
```
这会撤销最近 3 次提交（从 `HEAD~3` 到 `HEAD`）。

---

## **方法 4：使用 `git reset` 并强制推送（远程分支）**
如果你已经将 commit 推送到了远程，并且想要强制回退：
```sh
git reset --hard <commit-hash>
git push origin <branch-name> --force
```
**⚠️ 注意：**
- 这会强制修改远程分支，可能导致其他人的代码丢失。
- **如果多人协作，建议使用 `git revert` 而不是 `git reset --hard`。**

---

## **总结**
| 方法 | 适用场景 | 是否修改历史(对已提交的commit是否有影响) | 是否会丢失本地更改 |
|------|----------|------------|----------------|
| `git reset --hard <commit>` | 本地回退到某个 commit | ✅ 是 | ✅ 是 |
| `git reset --soft <commit>` | 回退提交但保留更改 | ✅ 是 | ❌ 否 |
| `git reset --mixed <commit>` | 回退提交并取消暂存 | ✅ 是 | ❌ 否 |
| `git checkout <commit>` | 临时查看 commit | ❌ 否 | ❌ 否 |
| `git revert <commit>` | 已推送分支回滚 | ❌ 否 | ❌ 否 |
| `git reset --hard <commit> && git push --force` | 强制回退远程分支 | ✅ 是 | ✅ 是（远程也丢失） |

如果你的分支已经推送到了远程，**建议使用 `git revert` 而不是 `git reset --hard`**，以防止影响其他协作者。

## 关于是否影响已提交的commit历史
假设你的提交历史是这样的：
```
A -- B -- C -- D -- E  (当前在 E)
```
如果你执行：
```sh
git reset --hard C
```
那么 `D` 和 `E` 这两个 commit 都会被删除，`git log` 里看不到它们了：
```
A -- B -- C (当前在 C)
```
但如果你执行：
```sh
git revert E
```
Git 会创建一个新的 commit 来撤销 `E` 的修改，而不会影响 `E` 之前的提交：
```
A -- B -- C -- D -- E -- (新 commit: 撤销 E)
```
这样所有历史仍然可见，只是 `E` 的更改被撤销了。
