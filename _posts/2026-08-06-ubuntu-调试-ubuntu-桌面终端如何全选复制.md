---
title: "Ubuntu 桌面终端如何全选复制"
date: 2026-08-06
last_modified_at: 2026-08-06
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/ubuntu-桌面终端如何全选复制/
toc: true
---

Ubuntu桌面终端有大量日志时，想要全选复制，发现Ctrl+A或者Ctrl+Shift+A不生效，无法全选。

解决方式：
- Shift+Ctrl+Home 跳到缓冲区顶端并起选
- 按住鼠标左键
- Shift+Ctrl+End 选到缓冲区底端

当然，如果命令可以重新跑，还是建议直接将输出重定向。
