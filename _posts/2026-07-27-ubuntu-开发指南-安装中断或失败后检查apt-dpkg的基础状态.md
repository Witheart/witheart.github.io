---
title: "安装中断或失败后检查apt、dpkg的基础状态"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/安装中断或失败后检查apt-dpkg的基础状态/
toc: true
---

## 1. 检查 apt/dpkg 的基础状态

首先看看系统的包管理系统本身有没有“半安装”或“中断”的残留：

```bash
sudo dpkg --configure -a
```

- 如果没有任何输出或很快返回命令行，说明 dpkg 状态干净。
- 如果有东西在配置，等它跑完。

接着检查依赖关系完整性：

```bash
sudo apt-get check
```

- **没有任何报错**就说明当前系统已安装的软件包之间依赖关系是正常的。

---

## 2. 检查是否有待修复的依赖（干跑）

用 `-f`（fix-broken）加上 `-s`（simulate / dry-run，只模拟不实际操作）看看 apt 觉得系统还需不需要补救：

```bash
sudo apt-get -f install -s
```

- 如果输出最后类似 `0 upgraded, 0 newly installed, 0 to remove`，说明没有破损的依赖需要修复。
- 如果它列出了要安装/卸载很多东西，说明你之前可能只是部分修复，还需要留意。
