---
title: "Ubuntu xfce在语言支持中设置中文后汉化不全，右键菜单、应用程序等仍为英文"
date: 2026-06-10
last_modified_at: 2026-06-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-xfce在语言支持中设置中文后汉化不全-右键菜单-应用程序等仍为英文/
toc: true
---

## 问题描述
Ubuntu xfce在语言支持中设置中文后汉化不全，右键菜单、应用程序等仍为英文。
language-pack-zh-hans language-pack-gnome-zh-hans显示都已经安装。

## 问题分析
这种情况大概是因为使用Ubuntu base构建了精简版的根文件系统，为了压缩体积，官方在打包时直接剔除了所有的本地化文件（Locales）、多语言包、说明文档（man pages）以及非核心的缓存机制。它的默认且唯一的语言环境就是纯英文（POSIX/C）。

## 解决方式
```bash
sudo unminimize
```

## 命令执行过程

### 1. 解除 dpkg 的全局过滤规则

在日志的开头：

> `Re-enabling installation of all documentation in dpkg...`

`ubuntu-base` 为了追求极小的体积，默认在 `/etc/dpkg/dpkg.cfg.d/` 目录下配置了过滤规则（例如 `path-exclude=/usr/share/locale/*`），强制系统在安装软件时丢弃所有的翻译文件、帮助文档（man pages）和额外字体。`unminimize` 脚本的第一步就是**删除了这些限制规则**，恢复了系统接收多语言文件的能力。

### 2. 生成目标语言环境 (Locale)

在日志的中段，系统自动完成了 Locale 的重新配置：

> `Generating locales (this might take a while)...`
> `  zh_CN.UTF-8... done`

这相当于系统在后台自动为你执行了 `locale-gen` 命令，正式在系统底层编译并启用了 UTF-8 编码的简体中文支持。

### 3. 强制重装以拉取翻译文件 (核心步骤)

这是耗时最长，也是最关键的一步。仔细看日志中的统计：

> `升级了 0 个软件包，新安装了 0 个软件包， 重新安装了 278 个软件包...`
> `Restoring system translations...`
> `重新安装了 33 个软件包...`

系统**并没有安装新的软件**，而是将你系统里已经存在的核心组件（包括 `xfce4`, `thunar`, `libc6`, `glib` 等等）强制执行了 `Reinstall`。因为第一步已经解除了 dpkg 的过滤限制，这次重新安装会将这些软件原本被剥离的中文 `.mo` 语言包文件和自带的 `.desktop` 文件完整地下载并解压到你的文件系统中。

### 4. 自动触发全局缓存刷新 (Triggers/Hooks)

在日志的末尾，出现了大量的触发器（Triggers）执行记录：

> `正在处理用于 desktop-file-utils (0.24-1ubuntu3) 的触发器 ...`
> `正在处理用于 gnome-menus (3.36.0-1ubuntu1) 的触发器 ...`
> `正在处理用于 hicolor-icon-theme (0.17-2) 的触发器 ...`
