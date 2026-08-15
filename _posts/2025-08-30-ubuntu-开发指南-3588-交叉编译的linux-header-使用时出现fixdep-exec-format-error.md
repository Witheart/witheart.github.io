---
title: "3588 交叉编译的linux-header，使用时出现fixdep Exec format error"
date: 2025-08-30
last_modified_at: 2025-08-30
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-交叉编译的linux-header-使用时出现fixdep-exec-format-error/
toc: true
---

## 参考链接
- [https://www.firebbs.cn/forum.php?mod=viewthread&tid=37523](https://www.firebbs.cn/forum.php?mod=viewthread&tid=37523)
- [https://blog.csdn.net/weixin_46667572/article/details/143928686](https://blog.csdn.net/weixin_46667572/article/details/143928686)
- [https://stackoverflow.com/questions/73698666/kernel-module-on-cross-compile-kernel-bin-sh-1-scripts-basic-fixdep-exec-fo](https://stackoverflow.com/questions/73698666/kernel-module-on-cross-compile-kernel-bin-sh-1-scripts-basic-fixdep-exec-fo)

## 问题背景
参考文章《RK 3588 Ubuntu SDK 编译 Linux Header（标头）》，在x86上交叉编译并在arm板上安装了linux-header，尝试使用其编译内核模块时，出现报错：
```bash
/bin/sh: 1: scripts/basic/fixdep: Exec format error

/bin/sh: 1: scripts/mod/modpost: Exec format error
```

## 问题解析
报错表面在编译内核模块时，尝试使用`/usr/src/linux-headers-5.10.160+/`下的`scripts/basic/fixdep`和`scripts/mod/modpost`，但发现架构不对。使用`file`命令查看，发现都为x86的架构。搜索这个问题，发现比较普遍，即使交叉编译时指定了正确的交叉编译链和目标架构，仍有可能出现。

## 解决方式
在rk3588上
- 重新编译生成arm64架构的fixdep
```bash
cd /usr/src/linux-headers-5.10.160+/scripts/basic

sudo gcc fixdep.c -o fixdep
```

- 重新编译生成arm64架构的modpost
```bash
cd /usr/src/linux-headers-5.10.160+/scripts/mod

sudo gcc file2alias.c sumversion.c modpost.c -o modpost
```

重新尝试编译内核模块，问题解决。
