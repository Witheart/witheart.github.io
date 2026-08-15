---
title: "apt 卸载软件包"
date: 2025-03-26
last_modified_at: 2025-03-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/apt-卸载软件包/
toc: true
---

### 1. 卸载软件包（保留配置文件）
```bash
sudo apt remove 软件包名
```
- 仅删除软件包，但保留配置文件（便于重新安装时恢复配置）。

---

### 2. 彻底卸载软件包（删除配置文件）
```bash
sudo apt purge 软件包名
```
- 彻底删除软件包及其配置文件（更干净）。

---

### 3. 同时卸载依赖包（如果不再需要）
```bash
sudo apt autoremove
```
- 在卸载后运行此命令，删除自动安装但不再需要的依赖包。
- 说实话，这个命令有点危险，有时候会卸载一些被标记为不需要但是实际上很重要的包(如果你曾经手动安装过某个库（如libxyz1），后来另一个软件把它标记为依赖并自动安装了，当你移除那个软件时，libxyz1可能会被autoremove删除，即使你最初手动安装过它。)
建议实际运行前加上--dry-run看看哪些包将被已移除
```bash
sudo apt autoremove --dry-run
```
