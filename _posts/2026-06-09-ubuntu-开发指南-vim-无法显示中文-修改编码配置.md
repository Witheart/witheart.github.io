---
title: "vim 无法显示中文 —— 修改编码配置"
date: 2026-06-09
last_modified_at: 2026-06-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/vim-无法显示中文-修改编码配置/
toc: true
---

在自己构建的根文件中，`vim`（或 `vi`）显示中文乱码通常是由编码不匹配导致的。从系统底层到终端软件，任何一个环节的字符集配置不对都会引发这个问题。


## 修改 Vim 的编码配置

如果是 `vim` 读取文件时使用了错误的编码，可以直接在 Vim 的配置文件中强制指定支持 UTF-8 和常见的中文编码（GBK）。

在根文件系统中创建或编辑 `~/.vimrc`（全局的话是 `/etc/vim/vimrc`）：

```bash
sudo vim /etc/vim/vimrc
```

添加以下内容：

```vim
" 设置 Vim 内部使用的字符编码
set encoding=utf-8

" 设置终端使用的编码
set termencoding=utf-8

" 设置 Vim 读取文件时尝试的编码顺序（优先 utf-8，其次是各种中文编码）
set fileencodings=utf-8,gbk,gb2312,gb18030,cp936,latin-1

```

保存后重新进入 `vim` 查看中文是否恢复正常。

> **注意：** 如果你使用的其实是 BusyBox 自带的精简版 `vi`，它是忽略 `.vimrc` 配置的。
