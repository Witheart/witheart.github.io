---
title: "关于 uname 查看的内核版本号的后缀"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/关于-uname-查看的内核版本号的后缀/
toc: true
---

概要：本文介绍了在 Linux 内核中，`uname -r` 命令显示的内核版本号后缀的来源，以及如何通过 `CONFIG_LOCALVERSION_AUTO` 选项控制哈希值、`dirty` 标记和 `+` 号的显示情况。  


## 1. 内核版本号的后缀来源  

在 Linux 内核的 `defconfig` 中，`CONFIG_LOCALVERSION_AUTO=y` 选项会在内核版本号后加入哈希值。例如：  

```bash
root@user:~# uname -r
5.10.160-g83b4af0502f2
```

其中 `83b4af0502f259a2bfd9a831792b53771e978ba5` 是 Git 仓库的哈希值。如果 Git 仓库中还有未提交的更改，则版本号还会附加 `dirty` 标记。  

---

## 2. 影响 `uname -r` 结果的配置  

### 2.1 `CONFIG_LOCALVERSION_AUTO=n` 的影响  

如果设置 `CONFIG_LOCALVERSION_AUTO=n`，则：  

- **不会** 加入哈希值和 `dirty` 标记。  
- **但如果** 对内核进行了非官方修改，`uname -r` 显示的版本号会附加 `+` 号，例如：  

  ```bash
  5.10.160+
  ```

### 2.2 如何去除 `+` 号  

去除 `+` 号的方法可以参考以下文章：[如何去除 `+` 号](https://www.cnblogs.com/Rainingday/p/13943130.html)。  

但是，实测修改构建脚本后可能会引入 **kernel panic** 问题，因此最终未去除 `+` 号。  
