---
title: "编译时产生的.mod是什么，是否需要.gitignore忽略"
date: 2026-07-14
last_modified_at: 2026-07-14
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/编译时产生的-mod是什么-是否需要-gitignore忽略/
toc: true
---

`.mod` 文件是 Linux 内核编译模块时的**中间编译产物（Build Artifacts）**。

## 这些文件具体是什么？

在 Linux 内核（kbuild 系统）编译可加载内核模块（也就是 `.ko` 文件）的过程中，系统会自动生成 `.mod` 文件。它的作用是记录最终链接生成那个 `.ko` 模块所需要的所有依赖对象文件（`.o` 文件）的列表。


因为它们是每次执行 `make` 或编译内核时都会动态生成的，把它们提交到 Git 仓库里不仅没有意义，还会导致每次编译后 `git status` 都显得非常杂乱，并且容易引发代码合并冲突。

## 如何处理？
可以直接在当前仓库根目录的 `.gitignore` 文件中追加一行：

```text
# Kernel module build artifacts
*.mod

```
