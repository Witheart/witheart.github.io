---
title: "Ubuntu 支持 NTFS U盘"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-支持-ntfs-u盘/
toc: true
---

概要：本文介绍了如何在 Ubuntu 系统中安装 NTFS 支持工具，以便能够正常读写 NTFS 格式的 U 盘。通过简单的命令行操作，您可以快速实现 NTFS 文件系统的支持。  


## 1. 更新系统软件包列表  

在安装 `ntfs-3g` 工具之前，建议先更新系统的软件包列表，以确保获取最新的软件包信息。  

```bash
sudo apt update
```  

---

## 2. 安装 ntfs-3g 工具  

安装 `ntfs-3g` 工具，该工具提供了对 NTFS 文件系统的读写支持。  

```bash
sudo apt install ntfs-3g
```  

--- 

完成以上步骤后，Ubuntu 系统就可以正常读写 NTFS 格式的 U 盘了。
