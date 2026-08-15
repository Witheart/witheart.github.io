---
title: "Bash —— read 命令"
date: 2025-12-06
last_modified_at: 2025-12-06
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/bash-read-命令/
toc: true
---

`read -r line` 是 Bash 中读取用户输入或文件内容到变量的命令。

## 各部分含义：

### `read` 命令
- 用于从标准输入读取一行数据
- 等待用户输入直到按下回车键
- 默认以空格为分隔符将输入分割到多个变量

### `-r` 选项
- **禁用反斜杠转义**（重要！）
- 不将反斜杠 `\` 解释为转义字符
- 保持输入的原样，不处理转义序列
- 强烈建议总是使用此选项，除非确实需要处理转义

### `line` 变量
- 用户自定义的变量名
- 将读取的整行内容存储到该变量
- 可以命名为其他名称，如 `input`、`data` 等

## 示例演示：

```bash
# 示例1：从用户输入读取
echo "请输入内容："
read -r line
echo "你输入的是：$line"

# 示例2：从文件读取（逐行处理）
while read -r line; do
    echo "行内容: $line"
done < filename.txt

# 示例3：管道输入
echo "Hello\nWorld" | read -r line
echo "读取到：$line"  # 输出：Hello\nWorld
```

## 带 `-r` 和不带 `-r` 的区别：

```bash
# 不带 -r（默认处理转义）
read line
# 输入：hello\nworld
# $line 的值：hello(换行)world

# 带 -r（不处理转义）
read -r line
# 输入：hello\nworld
# $line 的值："hello\nworld"（原样字符串）
```

## 常用组合选项：

```bash
# 1. 静默读取（不显示输入）
read -r -s password
# 用于读取密码，输入时不显示

# 2. 显示提示信息
read -r -p "请输入文件名: " filename

# 3. 设置超时
read -r -t 5 -p "5秒内输入: " input
# 5秒内无输入则超时

# 4. 限制字符数
read -r -n 10 input
# 最多读取10个字符

# 5. 常见组合用法
read -r -p "问题? [y/N]: " -n 1 answer
# 带提示，只读一个字符
```

## 实际应用场景：

```bash
# 1. 配置文件读取
while IFS='=' read -r key value; do
    echo "Key: $key, Value: $value"
done < config.conf

# 2. 交互式脚本
read -r -p "是否继续? (yes/no): " choice
if [[ "$choice" == "yes" ]]; then
    echo "继续执行..."
fi

# 3. 读取文件（带行号）
line_number=1
while read -r line; do
    echo "$line_number: $line"
    ((line_number++))
done < file.txt
```

## 重要注意事项：

1. **总是使用 `-r`**，除非明确需要反斜杠转义功能
2. 在循环中读取文件时，通常结合 `IFS=` 防止行首行尾空格被修剪：
   ```bash
   while IFS= read -r line; do
       # 处理每一行
   done < file.txt
   ```
3. `read` 读取的数据会去除行尾的换行符
4. 如果行以反斜杠结尾，不带 `-r` 时会将其视为续行符
