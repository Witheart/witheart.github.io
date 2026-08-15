---
title: "Ubuntu 下查看当前目录下目录及文件大小"
date: 2024-12-28
last_modified_at: 2024-12-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下查看当前目录下目录及文件大小/
toc: true
---

1. **使用 `du` 命令**：
   ```bash
   du -sh *
   ```
   这个命令会列出当前目录下每个文件和目录的大小。`-s` 选项表示总结（只显示总大小），`-h` 选项表示以人类可读的格式显示大小（如 KB, MB, GB）。

2. **查看单个文件大小**：
   如果你只想查看单个文件的大小：
   ```bash
   du -sh filename
   ```
