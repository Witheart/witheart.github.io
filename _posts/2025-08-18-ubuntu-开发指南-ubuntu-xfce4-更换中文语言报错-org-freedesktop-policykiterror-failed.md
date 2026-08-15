---
title: "Ubuntu XFCE4 更换中文语言报错 org.freedesktop.PolicyKitError.Failed"
date: 2025-08-18
last_modified_at: 2025-08-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-xfce4-更换中文语言报错-org-freedesktop-policykiterror-failed/
toc: true
---

## 1 问题描述
在XFCE4的语言支持中，选择添加中文简体语言，报错：
```err
Could not install the full language support. Details: org.freedesktop.PolicyKitError.Failed:('system-bus-name',{'name': ':1.72'}): ord.debian.apt.install-or-remove-package
```

## 2 参考链接
[https://askubuntu.com/questions/1031319/language-support-in-18-04-not-working-org-freedesktop-policykiterror-failed](https://askubuntu.com/questions/1031319/language-support-in-18-04-not-working-org-freedesktop-policykiterror-failed)

## 3 解决方法
安装下面的软件
```bash
sudo apt install policykit-1-gnome
```

## 4 原理分析

### 4.1 **核心问题：Polkit 认证代理缺失**
   - **Polkit（PolicyKit）** 是 Linux 系统的权限管理框架，用于控制非特权进程与特权进程（如 `apt` 包管理）的交互。
   - 当 **语言支持**（Language Support）需要安装语言包时，会通过 Polkit 请求管理员权限（`apt install` 操作）。
   - **XFCE4 默认未集成图形化的 Polkit 代理**，导致认证对话框无法弹出，触发 `PolicyKitError.Failed` 错误。

### 4.2 **关键机制：身份认证代理（Authentication Agent）**
   - Polkit 需依赖 **图形化的认证代理** 向用户请求密码。GNOME 桌面自带代理（`polkit-gnome`），但 XFCE4 未内置。
   - 错误信息中的 `ord.debian.apt.install-or-remove-package` 表明：**语言支持** 试图调用 `apt` 安装包，但权限请求因无代理而失败。

### 4.3 **解决方案原理：补充认证代理**
   安装 `policykit-1-gnome` 包：
   ```bash
   sudo apt install policykit-1-gnome
   ```
   - 该软件包提供 **Polkit 的 GNOME 认证代理**（`/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1`）。
   - 安装后，XFCE4 可调用此代理弹出密码输入窗口，完成权限认证流程。

### 4.4 **深层工作流程**
   ```mermaid
   graph TB
   A[语言支持请求安装中文包] --> B[触发 Polkit 权限认证]
   B --> C{认证代理是否存在？}
   C -->|否| D[抛出 PolicyKitError.Failed]
   C -->|是| E[弹出密码输入窗口]
   E --> F[用户输入密码]
   F --> G[认证成功，执行 apt install]
   G --> H[完成语言包安装]
   ```
