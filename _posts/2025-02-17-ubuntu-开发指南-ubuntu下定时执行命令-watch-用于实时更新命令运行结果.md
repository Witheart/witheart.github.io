---
title: "Ubuntu下定时执行命令 watch（用于实时更新命令运行结果）"
date: 2025-02-17
last_modified_at: 2025-02-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu下定时执行命令-watch-用于实时更新命令运行结果/
toc: true
---

`watch` 命令用于定期执行指定的命令，并实时显示其输出，通常用于监视命令的执行结果是否发生变化。


## **基本语法**
```bash
watch [选项] "命令"
```
- 监视的命令可以使用引号 `""` 包裹，避免解析错误。

## **常用选项**
| 选项 | 作用 |
|------|------|
| `-n <秒>` | 指定刷新间隔，默认 2 秒 |
| `-d` | 高亮显示变化的内容 |

## **示例**

### **1. 监视 `date` 命令，每秒刷新**
```bash
watch -n 1 date
```

### **2. 监视 `sensor` 结果**
```bash
watch -n 1 sensor
```

## **退出 `watch`**
- 按 `Ctrl + C` 终止 `watch` 进程。
