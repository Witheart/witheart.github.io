---
title: "命令行自动纠错工具 The Fuck 安装"
date: 2025-01-07
last_modified_at: 2025-01-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/命令行自动纠错工具-the-fuck-安装/
toc: true
---

[`The Fuck`](https://github.com/nvbn/thefuck) 是一个非常强大的命令纠错工具，它可以纠正你在终端中输入的错误命令，并提供正确的命令。

### 安装 `The Fuck`：

1. 安装 Python 和 pip：

   ```bash
   sudo apt update
   sudo apt install python3 python3-pip
   ```

2. 使用 pip 安装 `The Fuck`：

   ```bash
   pip3 install thefuck --user
   ```

3. 将 `The Fuck` 添加到你的 shell 配置文件中（如 `.bashrc` 或 `.zshrc`）：

   ```bash
   echo "eval $(thefuck --alias)" >> ~/.bashrc
   ```

   如果是使用 Zsh：

   ```bash
   echo "eval $(thefuck --alias)" >> ~/.zshrc
   ```

4. 重新加载配置文件：

   ```bash
   source ~/.bashrc
   ```

   如果是使用 Zsh：

   ```bash
   source ~/.zshrc
   ```

### 使用方法：

当你输入错误的命令时，只需输入 `fuck`，它会自动纠正。例如：

```bash
$ sl
Command 'sl' not found, did you mean:
  command 'ls' from coreutils
$ fuck
ls
```
