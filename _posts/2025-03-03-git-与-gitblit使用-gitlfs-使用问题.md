---
title: "GitLFS 使用问题"
date: 2025-03-03
last_modified_at: 2025-03-03
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/gitlfs-使用问题/
toc: true
---

概要：本文介绍了如何跳过 LFS 文件的下载，使其显示为指针文件，以及在本地 push 时确保大文件成功上传的方法。  


## 1. 跳过 LFS 文件的下载  

在克隆仓库时，可以使用以下命令跳过 LFS 文件的下载，这样 LFS 文件会显示为指针文件：  

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone <repo_url>
```

---

## 2. 确保本地大文件成功 push  

在本地直接 push 时，可能出现大文件未成功上传的情况。此时，可以执行以下命令确保所有 LFS 文件都被正确推送到远程仓库：  

```sh
git lfs push --all origin
```
