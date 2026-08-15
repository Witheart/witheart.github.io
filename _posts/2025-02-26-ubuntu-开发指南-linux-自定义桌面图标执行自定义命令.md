---
title: "Linux 自定义桌面图标执行自定义命令"
date: 2025-02-26
last_modified_at: 2025-02-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-自定义桌面图标执行自定义命令/
toc: true
---

概要：本指南介绍如何在 Linux 桌面环境下创建自定义图标，并定义其执行的命令。通过 `.desktop` 文件，可以便捷地启动应用程序，本文以 VNC Viewer 为例进行演示。  


## 1. 创建 `.desktop` 快捷方式  

### 1.1 新建 `.desktop` 文件  
在桌面或任意目录创建自定义图标文件，例如 `myapp.desktop`：  
```bash
nano ~/Desktop/myapp.desktop
```

### 1.2 填写配置内容  
`.desktop` 文件包含应用程序的基本信息和执行配置，例如以下 VNC Viewer 示例：  
```ini
[Desktop Entry]
Type=Application
Name=VNC Viewer
Comment=Connect to VNC Server
Exec=/usr/bin/vncviewer 192.168.1.100:5900 -passwd ~/.vnc/passwd
Icon=/usr/share/icons/hicolor/48x48/apps/tigervnc.png
Terminal=false
Categories=Network;
```

#### **参数说明**  
- **`Type=Application`**：指定此快捷方式为应用程序类型。  
- **`Name=VNC Viewer`**：设置快捷方式名称。  
- **`Comment=Connect to VNC Server`**：描述该快捷方式的用途。  
- **`Exec=/usr/bin/vncviewer 192.168.1.100:5900 -passwd ~/.vnc/passwd`**：定义执行的命令。  
- **`Icon=/usr/share/icons/hicolor/48x48/apps/tigervnc.png`**：指定快捷方式图标路径。  
- **`Terminal=false`**：决定是否在终端中运行，`false` 表示以 GUI 方式运行。  
- **`Categories=Network;`**：定义应用类别，便于分类管理。  

---

## 2. 设置权限与验证  

### 2.1 赋予可执行权限  
创建 `.desktop` 文件后，需要赋予可执行权限：  
```bash
chmod +x ~/Desktop/myapp.desktop
```

### 2.2 测试图标有效性  
- **双击图标**，检查是否能够正常启动应用程序。  
- **若提示权限问题**，可能需要调整相关文件权限，例如 VNC Viewer 需要修改密码文件权限：  
  ```bash
  chmod 600 ~/.vnc/passwd
  ```
