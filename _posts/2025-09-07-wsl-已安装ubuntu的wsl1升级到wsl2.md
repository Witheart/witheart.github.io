---
title: "已安装Ubuntu的WSL1升级到WSL2"
date: 2025-09-07
last_modified_at: 2025-09-07
categories:
  - "wsl"
tags:
  - "wsl"
permalink: /wsl/已安装ubuntu的wsl1升级到wsl2/
toc: true
---

概要：本指南介绍了如何将已安装的 Ubuntu WSL1 升级为 WSL2，包括查看当前 WSL 版本、使用命令更新 WSL、处理权限问题、手动下载安装包等步骤，适用于遇到“请求的操作需要提升”的用户。  


## 1. 查看当前 WSL 版本  

在 PowerShell 中执行以下命令查看当前已安装的 WSL 版本：

```powershell
wsl -l -v
```

示例输出：

```
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         1
```

如果 `VERSION` 显示为 `1`，说明当前为 WSL1，可升级为 WSL2。

---

## 2. 升级 WSL  

### 2.1 使用命令升级  

执行如下命令进行升级：

```powershell
wsl.exe --update
```

### 2.2 如果出现权限错误  

如果出现如下错误提示：

```
正在安装: 适用于 Linux 的 Windows 子系统  
请求的操作需要提升。        0.0%
```

可能是网速问题，尝试手动安装离线版本。

---

## 3. 下载并安装离线版本  

前往以下链接手动下载最新版 WSL 安装包：

[https://github.com/microsoft/WSL/releases](https://github.com/microsoft/WSL/releases)

下载后运行安装程序，完成后再次执行更新命令：

```powershell
wsl.exe --update
```

如果显示如下信息，说明安装成功：

```
正在检查更新。  
已安装最新版本的适用于 Linux 的 Windows 子系统。
```

---

## 4. 升级已安装的 Ubuntu 为 WSL2  

执行以下命令将指定的发行版升级为 WSL2：

```powershell
wsl --set-version Ubuntu-24.04 2
```

### 升级过程输出示例：

```
有关与 WSL 2 关键区别的信息，请访问 https://aka.ms/wsl2  
正在进行转换，这可能需要几分钟时间。
.bsdtar: ./tmp/vscode-git-0b0d4128bc.sock: pax format cannot archive sockets  
bsdtar: ./tmp/vscode-ipc-129ca1fe-23ac-4703-82a6-bcb0e19f71a6.sock: pax format cannot archive sockets  
bsdtar: ./tmp/vscode-ipc-fd1d5bb5-188f-40d5-9dfc-f9aa5c572ca3.sock: pax format cannot archive sockets  
操作成功完成。
```

---

升级完成后，Ubuntu 即已成功从 WSL1 转换为 WSL2。
