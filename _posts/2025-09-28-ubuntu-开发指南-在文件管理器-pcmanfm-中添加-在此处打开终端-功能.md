---
title: "在文件管理器 PCManFM 中添加“在此处打开终端”功能"
date: 2025-09-28
last_modified_at: 2025-09-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/在文件管理器-pcmanfm-中添加-在此处打开终端-功能/
toc: true
---

概要：本教程介绍了如何在文件管理器 PCManFM 中添加“在此处打开终端”功能，包括使用原生方式配置终端模拟器以及通过自定义右键菜单实现更快捷的终端调用。  


## 1. 方法一：原生方式配置终端  
### 1.1 使用方式
PCManFM 提供了内置功能以在当前目录中打开终端，方法如下：  

1. 点击选项栏中的“工具”，选择“在终端中打开当前文件夹”。  
   ![原生终端功能](/assets/images/ubuntu-开发指南/在文件管理器-pcmanfm-中添加-在此处打开终端-功能/PixPin_2025-09-28_17-01-43.png)

### 1.2 终端配置方式
1. 默认打开的终端可能不是你想要的，可以通过以下方式进行修改：

   - 点击“编辑” -> “偏好设置”  
     ![偏好设置入口](/assets/images/ubuntu-开发指南/在文件管理器-pcmanfm-中添加-在此处打开终端-功能/PixPin_2025-09-28_17-02-38.png)

   - 在“高级”选项卡中设置终端模拟器  
     ![设置终端模拟器](/assets/images/ubuntu-开发指南/在文件管理器-pcmanfm-中添加-在此处打开终端-功能/PixPin_2025-09-28_17-03-29.png)

2. 在“终端模拟器”字段中填写你希望使用的终端程序，例如使用 lxterminal：

   ```
   lxterminal %s
   ```

3. 设置完成后再次尝试使用“工具”菜单中的打开终端功能，验证配置是否生效。

---

## 2. 方法二：自定义右键菜单  

如果希望在 PCManFM 的右键菜单中添加“在此处打开终端”的选项，可以通过以下步骤实现：  

### 2.1 创建动作文件夹  

在桌面用户登录终端中运行以下命令，创建文件夹：

```bash
mkdir -p ~/.local/share/file-manager/actions/
```

### 2.2 编辑动作文件  

使用文本编辑器创建并编辑如下文件：

```bash
~/.local/share/file-manager/actions/open-terminal.desktop
```

填入以下内容：

```ini
[Desktop Entry]
Icon=Terminal
Type=Action
Name=在终端中打开
Profiles=open-terminal

[X-Action-Profile open-terminal]
MimeTypes=inode/directory
Exec=lxterminal
```

> Tips：`Exec` 中的 `lxterminal` 可以替换为你喜欢的终端程序，如 `xterm`, `gnome-terminal` 等。

### 2.3 应用更改  

保存文件后，重启系统以使更改生效。

### 2.4 效果演示  

右键点击文件夹，即可看到“在终端中打开”的选项：  
![右键菜单效果](/assets/images/ubuntu-开发指南/在文件管理器-pcmanfm-中添加-在此处打开终端-功能/PixPin_2025-09-28_17-07-01.png)
