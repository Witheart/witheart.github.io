---
title: "update-alternatives 应用程序版本管理"
date: 2026-02-06
last_modified_at: 2026-02-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/update-alternatives-应用程序版本管理/
toc: true
---

`update-alternatives` 是 Debian/Ubuntu 等 Linux 发行版中的一个工具，用于管理系统中的**替代程序**（alternative programs）。它允许你在多个功能相似的程序版本之间进行切换，并维护一套统一的符号链接。


## 主要作用

1. **管理多个版本的程序** - 比如同时安装多个 Java、Python、GCC 版本
2. **维护统一的命令接口** - 无论实际使用哪个版本，命令名保持一致
3. **提供交互式选择界面** - 方便用户选择默认版本

## 工作原理

通过维护 `/etc/alternatives/` 目录下的符号链接，指向实际安装的不同版本程序。

```
用户执行: python3
    ↓
/usr/bin/python3 (符号链接)
    ↓
/etc/alternatives/python3 (符号链接)
    ↓
/usr/bin/python3.10 (实际可执行文件)
```

## 基本语法

```bash
update-alternatives --option
```

## 常用命令示例

### 1. 注册新备选程序
```bash
# 注册 Java 17
sudo update-alternatives --install /usr/bin/java java /usr/lib/jvm/java-17-openjdk/bin/java 1
```
- **--install**: 添加一个新的备选程序到系统中
- **/usr/bin/java**: 系统默认调用的 Java 命令符号链接路径。用户执行 java时实际调用的链接
- **java**: 备选组的管理名称，用于标识一组可替代的程序（例如后续可通过 update-alternatives --config java切换版本）
- **/usr/lib/jvm/java-17-openjdk/bin/java**: 要添加的 Java 可执行文件的实际路径（这里是 OpenJDK 17）
- **1**: 优先级数字。当自动选择版本时，系统会优先使用优先级更高的版本（例如已安装其他版本时，数字最大的会被设为默认）

### 2. 查看可选项
```bash
# 查看所有 Java 版本
sudo update-alternatives --config java

# 查看特定命令的选项
update-alternatives --list java
```

### 3. 交互式切换版本
```bash
# 会显示选择菜单
sudo update-alternatives --config java
```

### 4. 设置默认版本（非交互式）
```bash
sudo update-alternatives --set java /usr/lib/jvm/java-11-openjdk/bin/java
```

### 5. 移除备选程序
```bash
sudo update-alternatives --remove java /usr/lib/jvm/java-8-openjdk/bin/java
```
