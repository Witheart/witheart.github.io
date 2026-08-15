---
title: "理解Shell中的输出重定向"
date: 2025-10-11
last_modified_at: 2025-10-11
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/理解shell中的输出重定向/
toc: true
---

概要：本文深入讲解了 Linux/Unix Shell 中的输出重定向，特别是 2>&1 的用法。通过文件描述符的变化过程和图示，帮助读者理解输出重定向的机制及其顺序的重要性。


- 参考的一篇非常好的文章
https://catonmat.net/bash-one-liners-explained-part-three

## 1. 输出重定向基础

在 Linux/Unix 命令行中，`2>&1` 是一个重要的重定向操作符。

当 bash 启动时，它会打开三个标准文件描述符：

- stdin（文件描述符 0）
- stdout（文件描述符 1）
- stderr（文件描述符 2）

`&1` 可以理解为对文件描述符进行取址，类似 C 语言中的 `&` 符号。

假设终端是 `/dev/tty0`，以下是 bash 启动时文件描述符表的样子：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image.png)

---

## 2. 常见重定向用法解析

### 2.1 command > file

该命令会将 `command` 的标准输出（stdout）发送到新打开的文件。如果打开文件失败，整个命令都会失败。

写入 `command > file` 与写入 `command 1> file` 相同。数字 `1` 代表标准输出的文件描述符编号。

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-1.png)

---

### 2.2 command 2> file

此命令将 `stderr` 重定向到文件。数字 `2` 代表标准错误。

文件描述符表的变化如下所示：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-2.png)

---

### 2.3 command > file 2>&1

用于将两个流（stdout 和 stderr）都重定向到文件。

- 首先，stdout 被重定向到 file。
- 然后，stderr 被复制为与 stdout 相同。

所以最终两个流都指向 file。

处理流程如下：

当 bash 看到多个重定向时，它会从左到右处理它们。最开始，bash 的文件描述符表看起来是这样的：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-3.png)

现在 bash 处理第一个重定向 `>file`。这会让 stdout 指向 file：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-4.png)

接下来，bash 处理第二个重定向 `2>&1`，这会将文件描述符 2 复制为文件描述符 1 的副本，得到以下结构：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-5.png)

---

## 3. 重定向顺序对执行结果的影响

注意：`command > file 2>&1` 和 `command 2>&1 > file` 的效果不同！

在 bash 中，重定向的顺序很重要！

- `command > file 2>&1`：stdout 和 stderr 都被重定向到文件。
- `command 2>&1 > file`：只将 stdout 重定向到文件，stderr 仍然打印到终端。

为什么会这样？

因为在 `command 2>&1 > file` 中：

- 一开始文件描述符 1 还指向终端。
- 此时将 2 复制到 1 的位置，即 stderr 仍然指向终端。
- 然后 1 才更改为指向 file。

如下图所示：

![alt text](/assets/images/linux-基础知识/理解shell中的输出重定向/image-6.png)
