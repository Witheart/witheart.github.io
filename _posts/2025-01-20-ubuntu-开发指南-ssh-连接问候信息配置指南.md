---
title: "SSH 连接问候信息配置指南"
date: 2025-01-20
last_modified_at: 2025-01-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ssh-连接问候信息配置指南/
toc: true
---

SSH 连接时显示的问候信息称为 MOTD (Message of the Day)，在 Ubuntu 系统中可以通过静态或动态方式配置。


## 修改历史

| 时间   | 历史                               |
| ------ | ---------------------------------- |
| 250120 | 创建了本文                         |
| 260610 | 添加了toilet显示字体失败的解决方式 |

![alt text](/assets/images/ubuntu-开发指南/ssh-连接问候信息配置指南/image.png)

## 配置方式

### 1. 静态配置

直接编辑 `/etc/motd` 文件，添加或修改想要显示的文本内容。

### 2. 动态配置

动态 MOTD 由 `/etc/update-motd.d/` 目录下的脚本按序号顺序生成。

常见脚本示例：

```bash
-rwxr-xr-x 1 root root  378 Jan 18 15:51 00-header
-rwxr-xr-x 1 root root   92 Jan 18 15:52 10-help-text
-rwxr-xr-x 1 root root 8028 Mar 12  2024 30-sysinfo
-rwxr-xr-x 1 root root   84 May 11  2023 85-fwupd
-rwxr-xr-x 1 root root  165 Apr 25  2022 92-unattended-upgrades
```

### 3. ASCII Logo 配置示例

以 `00-header` 脚本为例：

```sh
#!/bin/sh

[ -r /etc/lsb-release ] && . /etc/lsb-release

TERM=linux toilet -f standard -F gay Ubuntu

if [ -z "$DISTRIB_DESCRIPTION" ] && [ -x /usr/bin/lsb_release ]; then
        DISTRIB_DESCRIPTION=$(lsb_release -s -d)
fi

printf "Welcome to %s (%s %s %s)\n" "$DISTRIB_DESCRIPTION" "$(uname -o)" "$(uname -r)" "$(uname -m)"
```

#### Logo 生成说明

- 使用 `toilet` 命令生成 ASCII 艺术字
- 参数说明：
  - `-f standard`：使用标准字体
  - `-F gay`：添加彩虹效果
  - `Ubuntu`：显示文本内容

#### 欢迎信息组成

- `$DISTRIB_DESCRIPTION`：系统描述（如 Ubuntu 20.04.6 LTS）
- `$(uname -o)`：操作系统名称
- `$(uname -r)`：内核版本
- `$(uname -m)`：系统架构

## 禁用动态 MOTD

如需使用静态 MOTD：

1. 禁用动态脚本：`sudo chmod -x /etc/update-motd.d/*`
2. 编辑静态文件：`/etc/motd`

## 不生效的解决方式

直接在终端中运行

```bash
TERM=linux toilet -f standard -F gay Ubuntu
```

如果报错如下

```bash
error: could not load font standard
```

说明缺少字体，安装对应的字体包：

```bash
sudo apt install figlet
```

或者使用其他字体，比如smblock、mono12。
