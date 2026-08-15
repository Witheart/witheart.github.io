---
title: "Ubuntu桌面如何去除弹窗要求输入密码提示 —— “解锁密钥环、认证”"
date: 2025-08-11
last_modified_at: 2025-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu桌面如何去除弹窗要求输入密码提示-解锁密钥环-认证/
toc: true
---

## 1 修改历史

| 时间   | 历史                                          |
| ------ | --------------------------------------------- |
| 250811 | 创建了本文                                    |
| 260413 | 更改了文章名称，区分了keyring和polkit两种情况 |

## 2 参考链接

[https://zhuanlan.zhihu.com/p/128133025](https://zhuanlan.zhihu.com/p/128133025)

## 3 密码弹窗类型区分

有两种提示输入密码的弹窗

- 比如打开chromium时，弹出的是keyring相关的弹窗 
  ![alt text](/assets/images/ubuntu-开发指南/ubuntu桌面如何去除弹窗要求输入密码提示-解锁密钥环-认证/be2d187f2be50cdd46eadf89dc371666_compress.jpg)

- 进行时间修改、打印机应用时，弹出的是polkit的弹窗
  ![alt text](/assets/images/ubuntu-开发指南/ubuntu桌面如何去除弹窗要求输入密码提示-解锁密钥环-认证/7858205bcf09e9ed60d40fcd35350748_compress.jpg)

这两种弹窗对应两种不同的机制。

### 3.1 核心机制解析

1.  **GNOME Keyring（密钥环）**
    - **职责**：**安全存储密码和密钥**。它是一个加密的密码管理器。
    - **触发场景**：当应用程序（如浏览器、电子邮件客户端、Wi-Fi连接）需要访问您之前保存的密码、加密证书或网络密钥时，会向密钥环“索要”密码。
    - **在您描述中的体现**：“打开浏览器要求输入密码”**有可能**是密钥环在起作用（例如解锁保存的网站密码）。浏览器自身保存的密码通常由密钥环管理。

2.  **PolicyKit（polkit）**
    - **职责**：**管理系统级别的权限提升**。它定义了“哪些用户可以在什么条件下执行哪些需要特权的操作”。
    - **触发场景**：当普通用户尝试执行涉及系统全局设置、硬件配置或其他用户数据的操作时，PolicyKit会介入，要求验证身份（输入当前用户密码或管理员密码）。
    - **在您描述中的体现**：“时间修改”（修改系统时间）、“打印机删除”（修改系统打印配置）是典型的系统管理操作，因此触发PolicyKit进行认证。即使桌面自动登录，您的会话仍以普通用户权限运行，进行这些操作就需要通过PolicyKit授权。

### 3.2 为什么配置了自动登录还需要密码？

“桌面自动登录”仅意味着系统启动时自动以您的账户进入桌面环境，**跳过了登录管理器（如GDM）的密码验证步骤**。但这并不改变您的用户权限等级（您仍然是普通用户，不是root）。

当您的应用程序（通过PolicyKit）请求执行高特权操作时，系统必须确认“确实是您本人意图执行此操作”，因此会弹出密码对话框。这是Linux桌面系统的一项基本安全设计，防止恶意程序在后台随意修改系统。

## 4 GNOME Keyring（密钥环）弹窗去除方式

1. 桌面环境下，终端中输入seahorse

2. 点击左上角返回

![alt text](/assets/images/ubuntu-开发指南/ubuntu桌面如何去除弹窗要求输入密码提示-解锁密钥环-认证/PixPin_2025-08-11_14-42-18.png)

3. 右键默认密钥环，点击更改密码

![alt text](/assets/images/ubuntu-开发指南/ubuntu桌面如何去除弹窗要求输入密码提示-解锁密钥环-认证/PixPin_2025-08-11_14-43-13.png)

4. 输入原密码验证身份，新密码留空即可

## 5 PolicyKit（polkit）弹窗去除方式
```bash
vim /etc/polkit-1/localauthority/50-local.d/99-allow-all.pkla
```

填入以下内容后，保存重启(Ubuntu20.04)
```
[Allow All Management]
Identity=unix-group:sudo
Action=*
ResultAny=yes
ResultInactive=yes
ResultActive=yes
```
