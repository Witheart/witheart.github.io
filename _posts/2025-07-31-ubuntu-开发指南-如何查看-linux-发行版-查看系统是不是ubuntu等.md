---
title: "如何查看 Linux 发行版？（查看系统是不是Ubuntu等）"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/如何查看-linux-发行版-查看系统是不是ubuntu等/
toc: true
---

### 1. **检查 `/etc/os-release` 文件**  
   **适用场景**：所有 Linux 发行版通用方法（最可靠）。  
   **操作步骤**：  
   - 打开终端（快捷键：`Ctrl + Alt + T`）。  
   - 输入命令：  
     ```bash
     cat /etc/os-release
     ```  
   - **关键字段**：  
     - 若输出中包含 `ID=ubuntu`，则为 Ubuntu 系统。  
     - `NAME="Ubuntu"` 或 `PRETTY_NAME="Ubuntu ..."` 也直接表明系统身份。

---

### 2. **检查 `/etc/issue` 文件**  
   **适用场景**：快速查看系统登录提示信息。  
   **操作步骤**：  
   - 在终端输入：  
     ```bash
     cat /etc/issue
     ```  
   - 若输出中包含 `Ubuntu` 字样（如 `Ubuntu 22.04 LTS`），则为 Ubuntu 系统。


---

### 验证示例：
- ✅ **Ubuntu 系统典型输出**：  
  ```bash
  $ cat /etc/os-release
  ID=ubuntu
  NAME="Ubuntu"
  VERSION="22.04 LTS (Jammy Jellyfish)"
  ...

  $ lsb_release -a
  Distributor ID: Ubuntu
  Description:    Ubuntu 22.04 LTS
  ...
  ```

- ❌ **非 Ubuntu 系统输出**（如 CentOS）：  
  ```bash
  $ cat /etc/os-release
  ID="centos"
  NAME="CentOS Linux"
  ...
  ```
