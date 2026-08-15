---
title: "新增目录在vscode git中不可见但git status可见的问题"
date: 2025-06-20
last_modified_at: 2025-06-20
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/新增目录在vscode-git中不可见但git-status可见的问题/
toc: true
---

## 问题描述
新增的目录在vscode的git视图中不显示，且目录并非空目录；而git status查看时，显示该目录untrack，但是没有列出该目录下的其他文件，而只列出了目录本身。
![alt text](/assets/images/git-与-gitblit使用/新增目录在vscode-git中不可见但git-status可见的问题/PixPin_2025-06-20_10-42-58.png)

## 问题原因
该目录下本身也有一个.git，且该git仓库配置损坏，直接git add 该目录便会报错。

## 解决方式
删除该目录下的.git目录
