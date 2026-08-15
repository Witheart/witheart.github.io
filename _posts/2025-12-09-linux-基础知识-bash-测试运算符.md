---
title: "Bash —— 测试运算符"
date: 2025-12-09
last_modified_at: 2025-12-09
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/bash-测试运算符/
toc: true
---

## 基本语法

```bash
if [ ! -d $LOG_DIR ]
```

## 各部分含义

- **`if`**：条件判断语句的开始
- **`[` 和 `]`**：测试命令的边界（前后必须有空格）
- **`!`**：逻辑"非"运算符，表示"取反"
- **`-d`**：测试运算符，检查指定参数是否是**目录**（directory）
- **`$LOG_DIR`**：一个变量，应该包含目录路径

## 整句意思

**"如果变量 LOG_DIR 所代表的路径不是一个目录（或不存在）"**

## 等价写法

```bash
if [ ! -d "$LOG_DIR" ]  # 推荐加上引号，防止路径中有空格
```

## 常见使用场景

通常用于在操作前检查目录是否存在：

```bash
#!/bin/bash
LOG_DIR="/var/log/myapp"

# 如果日志目录不存在，则创建它
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
    echo "创建日志目录: $LOG_DIR"
fi

# 继续执行其他操作...
```

## 其他相关测试操作符

```bash
-e FILE    # 文件/目录是否存在
-f FILE    # 是否是普通文件
-r FILE    # 是否可读
-w FILE    # 是否可写
-x FILE    # 是否可执行
-s FILE    # 文件是否存在且大小>0
-z STRING  # 字符串是否为空
-n STRING  # 字符串是否非空
```

## 注意

1. **`[` 实际上是 `test` 命令的别名**，所以也可以写成：

   ```bash
   if test ! -d "$LOG_DIR"
   ```

2. 在 bash 中，推荐使用双中括号 `[[ ]]`，功能更强大且更安全：

   ```bash
   if [[ ! -d "$LOG_DIR" ]]
   ```

3. 在脚本开头使用 `set -u` 可以避免变量未定义时出错
