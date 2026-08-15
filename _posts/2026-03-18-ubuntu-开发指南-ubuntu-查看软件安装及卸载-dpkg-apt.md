---
title: "Ubuntu 查看软件安装及卸载 dpkg apt"
date: 2026-03-18
last_modified_at: 2026-03-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-查看软件安装及卸载-dpkg-apt/
toc: true
---

## 查看软件是否安装

- 以 ffmedia-demo 为例

1.  **使用 `dpkg` 命令查询**：
    在终端中执行以下命令，查找包含“ffmedia”或相关名称的已安装包。

```bash
dpkg -l | grep -i ffmedia
```

输出如下

```bash
ii  ffmedia-demo                           2.0.0                                  arm64        qt_ffmedia_demo
ii  libffmedia                             2.4.0-firefly2                         arm64        <Firefly Media Library>
```

2.  **使用 `apt` 命令查询**：
    执行以下命令，查看所有已安装的软件包列表中是否有它。

```bash
apt list --installed | grep -i ffmedia
```

3.  **直接查找可执行文件或路径**：
    尝试在终端中直接运行命令，或者查找其常见的安装路径。

```bash
# 尝试运行（如果已安装且路径在系统环境变量中）
ffmedia-demo --version
# 或
which ffmedia-demo

# 查找相关文件
find /usr -name "*ffmedia*" 2>/dev/null
```

## 卸载软件

**1. 卸载 `ffmedia-demo` 主程序（推荐先执行此步骤）**

```bash
sudo apt remove ffmedia-demo
```

此命令会移除 `ffmedia-demo` 软件包，但通常会保留其配置文件。

**2. 彻底清除（包括配置文件）**
如果想完全删除所有相关文件（包括配置文件），可以使用 `purge` 命令：

```bash
sudo apt purge ffmedia-demo
```

**3. 自动移除不再需要的依赖**
在卸载主程序后，可以运行以下命令自动删除那些因为 `ffmedia-demo` 而被安装、但现在已不再被任何其他程序依赖的软件包（例如 `libffmedia` 库）：

```bash
sudo apt autoremove
```

执行此命令前，请确认 `libffmedia` 是否确实不再被其他程序需要。如果它是其他重要软件的依赖，`autoremove` 不会将其移除。
