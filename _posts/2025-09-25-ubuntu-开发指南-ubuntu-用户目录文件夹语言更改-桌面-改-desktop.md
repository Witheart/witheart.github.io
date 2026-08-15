---
title: "Ubuntu 用户目录文件夹语言更改（桌面 改 Desktop）"
date: 2025-09-25
last_modified_at: 2025-09-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-用户目录文件夹语言更改-桌面-改-desktop/
toc: true
---

概要：本文介绍了在 Ubuntu 系统中，当系统语言为中文时，如何将用户目录（如“桌面”）的文件夹名称更改为中文或保持为英文的操作方法。通过设置环境变量并使用 xdg-user-dirs-gtk-update 工具，用户可以自由控制文件夹语言显示方式。


## 1. 修改文件夹语言为中文

在 Ubuntu 系统中，如果系统语言为中文，且希望用户目录（如“Desktop”）也显示为中文（即“桌面”），请按照以下步骤操作：

### 1.1 操作步骤

1. 打开桌面环境下的终端。
2. 输入以下命令，设置语言环境变量为中文：

   ```bash
   export LANG=zh_CN
   ```

3. 执行以下命令，启动文件夹名称更新工具：

   ```bash
   xdg-user-dirs-gtk-update
   ```

4. 在弹出的对话框中，勾选“Don't ask me this again”（不再询问），然后点击“Update Names”（更新名称）。
5. 文件夹名称（如 Desktop）将被更改为中文（如 桌面）。

### 1.2 原理说明

该方法的原理是通过设置环境变量 LANG=zh_CN，让系统识别当前语言环境为中文，然后调用 xdg-user-dirs-gtk-update 工具来触发用户目录名称的更新。弹出框中的操作决定了是否将英文名称更改为中文。

---

## 2. 保持文件夹路径为英文（系统语言为中文）

如果用户希望在系统语言为中文的情况下，用户目录仍保持英文路径（如 Desktop 而不是 桌面），可以按照以下方法操作。

### 2.1 操作步骤

1. 打开终端。
2. 设置语言环境变量为中文：

   ```bash
   export LANG=en_US
   ```

3. 执行文件夹更新命令：

   ```bash
   xdg-user-dirs-gtk-update
   ```

4. 在弹出的对话框中，勾选“Don't ask me this again”（不再询问），然后点击“Update Names”（更新名称）。
5. 接着再次输入语言环境设置命令：

   ```bash
   export LANG=zh_CN
   ```

6. 关闭终端并重启计算机。

> 注意：虽然设置了中文语言环境，但通过上述操作可以让文件夹路径保持英文，从而实现系统语言中文 + 文件夹英文 的混合显示。

# 3. 手动修改

勾选过"不再提醒"后，常规方式无法触发弹窗时使用。

### 3.1 重命名文件夹
```bash
mv Desktop 桌面
mv Documents 文档
mv Downloads 下载
mv Music 音乐
mv Pictures 图片
mv Public 公共的
mv Templates 模板
mv Videos 视频
```

### 3.2 修改配置文件
编辑 `user-dirs.dirs` 文件：
```bash
vim user-dirs.dirs
```

修改为以下内容：
```bash
# This file is written by xdg-user-dirs-update
XDG_DESKTOP_DIR="$HOME/桌面"
XDG_DOWNLOAD_DIR="$HOME/下载"
XDG_TEMPLATES_DIR="$HOME/模板"
XDG_PUBLICSHARE_DIR="$HOME/公共的"
XDG_DOCUMENTS_DIR="$HOME/文档"
XDG_MUSIC_DIR="$HOME/音乐"
XDG_PICTURES_DIR="$HOME/图片"
XDG_VIDEOS_DIR="$HOME/视频"
```

### 3.3 完成修改
- 重启系统
- 打开文件管理器，删除侧边栏指向不存在目录的英文映射
