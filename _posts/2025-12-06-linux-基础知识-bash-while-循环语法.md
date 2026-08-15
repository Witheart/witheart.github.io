---
title: "Bash —— while 循环语法"
date: 2025-12-06
last_modified_at: 2025-12-06
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/bash-while-循环语法/
toc: true
---

## 基本语法

```bash
while [条件测试]
do
    # 执行的命令
done
```

或者写在一行：

```bash
while [条件测试]; do 命令; done
```

## 详细解析

### 1. 语法结构

```
while condition
do
    commands
done
```

- **condition**: 循环条件，可以是命令、测试表达式等
- **commands**: 循环体中的命令
- 当条件为真（退出状态为 0）时执行循环体

### 2. 条件测试的常见形式

**数值比较：**

```bash
while [ $counter -lt 10 ]
do
    echo $counter
    ((counter++))
done
```

**字符串比较：**

```bash
while [ "$input" != "quit" ]
do
    read -p "输入内容: " input
    echo "你输入了: $input"
done
```

**命令返回值：**

```bash
while ping -c1 example.com &> /dev/null
do
    echo "主机可达"
    sleep 5
done
echo "主机不可达"
```

## 常用示例

### 示例 1：基本计数器

```bash
#!/bin/bash
count=1
while [ $count -le 5 ]
do
    echo "循环次数: $count"
    count=$((count+1))
done
```

### 示例 2：读取文件内容

```bash
#!/bin/bash
while read line
do
    echo "行内容: $line"
done < filename.txt
```

### 示例 3：无限循环

```bash
#!/bin/bash
while true
do
    echo "按Ctrl+C退出"
    sleep 1
done
```

或者使用 `:` 命令（总是返回 0）：

```bash
while :
do
    echo "按Ctrl+C退出"
    sleep 1
done
```

### 示例 4：算术条件

```bash
#!/bin/bash
i=0
while (( i < 5 ))
do
    echo "i = $i"
    ((i++))
done
```

### 示例 5：使用 C 语言风格

```bash
#!/bin/bash
((count=1))
while ((count <= 5))
do
    echo "计数: $count"
    ((count++))
done
```

## 循环控制

### break - 跳出循环

```bash
while true
do
    read -p "输入quit退出: " input
    if [ "$input" = "quit" ]; then
        break
    fi
    echo "你输入了: $input"
done
```

### continue - 跳过本次循环

```bash
count=0
while [ $count -lt 10 ]
do
    ((count++))
    if [ $((count % 2)) -eq 0 ]; then
        continue
    fi
    echo "奇数: $count"
done
```

## 实用技巧

### 1. 结合 read 读取用户输入

```bash
while read -p "请输入命令: " cmd && [ "$cmd" != "quit" ]
do
    case $cmd in
        help) echo "帮助信息..." ;;
        list) echo "列出文件..." ;;
        *) echo "未知命令" ;;
    esac
done
```

### 2. 处理命令输出

```bash
while IFS= read -r line
do
    echo "处理: $line"
done < <(find . -name "*.txt")
```

### 3. 嵌套循环

```bash
i=1
while [ $i -le 3 ]
do
    j=1
    while [ $j -le 3 ]
    do
        echo "i=$i, j=$j"
        ((j++))
    done
    ((i++))
done
```
