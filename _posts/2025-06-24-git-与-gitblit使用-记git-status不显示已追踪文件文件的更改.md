---
title: "记git status不显示已追踪文件文件的更改"
date: 2025-06-24
last_modified_at: 2025-06-24
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/记git-status不显示已追踪文件文件的更改/
toc: true
---

概要：本文记录了一个 Git 问题的排查过程：文件已被 Git 追踪且未被忽略，但修改后 `git status` 不显示变更。最终发现是由于 `core.fsmonitor` 设置导致的问题，并详细介绍了其原理和解决方法。


## 1. 问题描述  

文件已经确认被 Git 追踪，也没有被 `.gitignore` 忽略，但在修改并保存后，执行 `git status` 显示“没有任何更改”。

---

## 2. 具体排查  

使用以下命令确认文件已被 Git 管理：

```bash
git ls-files -- kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi
```

输出为文件的相对路径，说明该文件真的是 Git 管理的。

随后查看 `.gitignore` 文件，确认该文件没有被忽略。

---

## 3. 问题原因  

问题最终定位为 `core.fsmonitor` 设置导致。

### 3.1 检查 fsmonitor 设置  

使用以下命令检查：

```bash
git config core.fsmonitor
```

若输出为 `true`，表示 `fsmonitor` 功能已启用。

### 3.2 解决方法  

关闭该功能即可解决问题：

- 针对当前仓库关闭：

  ```bash
  git config core.fsmonitor false
  ```

- 针对所有仓库统一关闭：

  ```bash
  git config --global core.fsmonitor false
  ```

---

## 4. core.fsmonitor 是什么  

### 4.1 核心概念：状态检测的两种模式  

- **传统模式**：Git 通过扫描整个工作目录的文件系统（遍历所有文件，检查 inode 状态和时间戳）来判断文件变更。
- **fsmonitor 模式**：Git 委托外部守护进程（如 Watchman）实时监控文件变化，仅查询被报告为“已修改”的文件。

### 4.2 潜在问题  

如果监视器配置错误或事件丢失，可能会导致 Git 无法检测到文件的实际修改，从而出现 `git status` 不显示改动的情况。
