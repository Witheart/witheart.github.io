---
title: "strings 分析二进制文件基本用法"
date: 2026-08-20
last_modified_at: 2026-08-20
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/strings-分析二进制文件基本用法/
toc: true
---

`strings` 是分析二进制文件（如可执行文件、库文件、固件、内存转储）时最常用、最快速的工具之一，用于提取其中的**可打印字符串**。以下是详细的使用指南和技巧。


## 一、基本用法

### 1. 直接查看二进制中的字符串

```bash
strings binary_file
```

示例：

```bash
strings /bin/ls
```

输出示例：

```
/lib64/ld-linux-x86-64.so.2
ITM0
...
Usage: %s [OPTION]... [FILE]...
```

---

## 二、常用参数详解

| 参数        | 作用                                                         |
| ----------- | ------------------------------------------------------------ |
| `-n <长度>` | 只显示长度 ≥ N 的字符串                                      |
| `-t <格式>` | 显示字符串在文件中的偏移量（o=八进制，x=十六进制，d=十进制） |
| `-e <编码>` | 指定字符编码                                                 |
| `-a`        | 扫描整个文件（默认行为）                                     |
| `-f`        | 在输出前显示文件名                                           |
| `--help`    | 查看帮助                                                     |

### 示例

```bash
strings -n 6 -t x /bin/ls
```

输出：

```
    1a3c Usage: %s [OPTION]... [FILE]...
```

含义：字符串位于 **0x1a3c** 偏移处。

---

## 三、指定字符编码（非常重要）

不同架构/编译器可能使用不同编码：

```bash
strings -e s binary   # 7-bit ASCII（默认）
strings -e l binary   # 16-bit little-endian
strings -e b binary   # 16-bit big-endian
strings -e B binary   # 32-bit big-endian
```

👉 在分析 **Windows 程序、固件、ARM 二进制**时尤其重要。

---

## 四、结合 grep 精准查找

```bash
strings binary | grep -i password
strings binary | grep -E "http|https"
```

结合偏移量：

```bash
strings -t x binary | grep "main"
```
