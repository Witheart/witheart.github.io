---
title: "什么是SONAME —— so库文件的别名"
date: 2026-07-15
last_modified_at: 2026-07-15
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/什么是soname-so库文件的别名/
toc: true
---

## SONAME 是什么

**SONAME**（Shared Object Name）是**嵌入在 ELF 共享库文件内部的"逻辑名称"**，不是文件名。它告诉系统："无论这个文件实际叫什么，运行时请用这个名字来找我。"

---

### 三层命名体系

以 `librga` 为例，Linux 共享库有三层名字：

| 层级 | 示例 | 存在形式 | 用途 | 谁提供 |
|------|------|----------|------|--------|
| **Real Name** | `librga.so.2.1.0` | 磁盘上的真实文件 | 存放实际代码 | runtime 包 |
| **SONAME** | `librga.so.2` | ELF 文件内部记录 | 运行时动态链接器查找 | 由 Real Name 通过符号链接指向 |
| **Linker Name** | `librga.so` | 符号链接 | 编译时 `gcc -lrga` 使用 | dev 包 |

---

### 为什么需要 SONAME？

假设你有一个程序 `my_app`，编译时链接了 `librga.so.2.1.0`。后来 librga 升级到 `2.2.0`：

```
# 没有 SONAME（糟糕的设计）
my_app → librga.so.2.1.0   # 升级后文件没了，程序崩溃！

# 有 SONAME（正确的设计）
my_app → librga.so.2 → librga.so.2.1.0   # 升级前
my_app → librga.so.2 → librga.so.2.2.0   # 升级后，自动切换！
```

程序编译时，链接器会**把 SONAME `librga.so.2` 写进 my_app 的 ELF 头**，而不是真实文件名。运行时动态链接器 (`ld.so`) 读取这个 SONAME，去找 `librga.so.2`，再由它指向实际文件。

**SONAME 版本号规则**：主版本号相同 = ABI 兼容。所以 `librga.so.2.1.0` 和 `librga.so.2.2.0` 的 SONAME 都是 `librga.so.2`，表示它们 ABI 兼容，程序可以无缝切换。

---

### 总结一条链

```
gcc -lrga          → 用 linker name:     librga.so       （编译时）
程序里记录           → 用 SONAME:          librga.so.2     （链接时写入 ELF）
运行时 ld.so 加载   → 找到实际文件:        librga.so.2.1.0 （运行时）
```
