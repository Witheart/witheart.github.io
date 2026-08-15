---
title: "磁盘空间已满导致 VS Code Remote-SSH 无法连接的解决过程"
date: 2024-12-06
last_modified_at: 2024-12-06
categories:
  - "其他bug解决记录"
tags:
  - "其他bug解决记录"
permalink: /其他bug解决记录/磁盘空间已满导致-vs-code-remote-ssh-无法连接的解决过程/
toc: true
---

## **问题描述**
- 在使用 VS Code 的 Remote-SSH 插件连接远程服务器 `192.168.0.22` 时，连接失败，并提示如下错误：
  ```
  Failed to parse remote port from server output
  Resolver error: Error:
  ```
  ![alt text](/assets/images/其他bug解决记录/磁盘空间已满导致-vs-code-remote-ssh-无法连接的解决过程/image.png)
- 同时，尝试使用 MobaXterm 连接远程服务器时，虽然能成功登录，但出现以下警告信息：
  ```
  /usr/bin/xauth: unable to write authority file /home/hw/.Xauthority-n
  ```
- 结合两种工具的表现，怀疑远程服务器可能存在某些问题。

---

## **排查过程**

### **初步确认问题范围**
- 使用 `ping` 测试网络连接，确认网络畅通。
- 结合 MobaXterm 的提示信息 `/usr/bin/xauth: unable to write authority file`，怀疑是用户目录写入权限或磁盘空间不足的问题。

### **检查磁盘空间**
- 登录远程服务器后，使用以下命令查看磁盘空间使用情况：
  ```bash
  df -h
  ```
- 输出结果显示 `/` 分区的使用率为 `100%`：
  ```
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  938G  891G     0 100% /
  ```

  **结论**：远程服务器的磁盘已满，导致无法创建或写入文件（如 `.Xauthority` 和 Remote-SSH 的必要文件）。


- 清理后再次检查磁盘空间：
  ```bash
  df -h
  ```
  输出结果显示 `/` 和 `/home` 分区恢复了一定的可用空间。


### **验证 VS Code Remote-SSH 连接**

- 在 VS Code 中重新连接远程服务器，连接成功！
