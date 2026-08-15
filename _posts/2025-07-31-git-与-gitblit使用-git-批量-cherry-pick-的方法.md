---
title: "Git 批量 cherry-pick 的方法"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-批量-cherry-pick-的方法/
toc: true
---

### 方法 1：使用连续提交范围（适用于连续提交）
```bash
git cherry-pick <最早提交哈希>^..<最晚提交哈希>
```
**示例**：  
若需 cherry-pick 分支上的提交 `a1b2c3d`、`e4f5g6h`、`i7j8k9l`、`m0n1o2p`（按时间顺序排列），其中 `a1b2c3d` 最早，`m0n1o2p` 最晚：
```bash
git cherry-pick a1b2c3d^..m0n1o2p
```
**说明**：  
- `^` 表示包含起始提交（否则范围语法默认不包含起点）
- 确保提交通道提交时间**从旧到新**

---

### 方法 2：直接列出多个提交哈希（适用于任意提交）
```bash
git cherry-pick <提交哈希1> <提交哈希2> <提交哈希3> <提交哈希4>
```
**示例**：
```bash
git cherry-pick a1b2c3d e4f5g6h i7j8k9l m0n1o2p
```
**关键**：  
- **必须按时间顺序排列**（从最早到最新）
- 可用 `git log --oneline 分支名` 查看提交顺序

---

### 注意事项：
1. **冲突处理**：  
   若中途出现冲突，Git 会暂停操作。解决冲突后需手动执行：
   ```bash
   git cherry-pick --continue
   ```
   或放弃操作：
   ```bash
   git cherry-pick --abort
   ```

2. **非连续提交**：  
   若提交不连续，只能使用方法 2 明确列出每个哈希（按时间排序）。
