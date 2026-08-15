---
title: "source 和 . 点命令"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/source-和-点命令/
toc: true
---

在 Unix/Linux shell 中，`source` 命令和 `.`（点）命令是**等价的**，它们执行完全相同的功能。

## 具体含义

### `source` 命令

```bash
source filename [arguments]
```

在当前 shell 环境中执行指定脚本文件，而不是创建子 shell 执行。

### `.` 命令（点命令）

```bash
. filename [arguments]
```

这是 `source` 的**POSIX 标准简写形式**，功能完全一致。

## 关键特性

| 特性                  | 说明                                                    |
| --------------------- | ------------------------------------------------------- |
| **在当前 shell 执行** | 脚本中的变量、函数、环境变量设置会影响当前 shell        |
| **不创建子进程**      | 与直接执行 `./script.sh`（fork 子 shell）有本质区别     |
| **可以传递参数**      | `source script.sh arg1 arg2` 或 `. script.sh arg1 arg2` |

## 对比示例

```bash
# 假设脚本 set_env.sh 内容为：
# export MY_VAR="hello"

# 方式1：使用 source
source set_env.sh
echo $MY_VAR  # 输出: hello ✅ 当前 shell 有了 MY_VAR

# 方式2：使用点（完全等价）
. set_env.sh
echo $MY_VAR  # 输出: hello ✅ 效果相同

# 方式3：直接执行（不同！）
./set_env.sh
echo $MY_VAR  # 输出为空 ❌ 子 shell 设置，不影响父 shell
```

## 使用场景区别

虽然功能相同，但选择上有惯例：

| 场景                      | 推荐用法                  |
| ------------------------- | ------------------------- |
| 交互式 shell / 可读性优先 | `source`（更直观）        |
| 脚本编写 / 兼容性优先     | `.`（POSIX 标准，更通用） |
| 需要快速输入              | `.`（少打几个字母）       |

## 总结

> **`.` 就是 `source` 的别名**，就像 `[` 是 `test` 的别名一样。两者在 100% 的情况下可以互换使用，选择哪个主要取决于个人/团队的编码风格偏好。
