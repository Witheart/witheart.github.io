---
title: "VSCode 集成终端打开 WSL 报错“WSL 终端进程已终止，退出代码 2”的解决方法​"
date: 2025-10-27
last_modified_at: 2025-10-27
categories:
  - "VSCode使用"
tags:
  - "VSCode使用"
permalink: /vscode使用/vscode-集成终端打开-wsl-报错-wsl-终端进程已终止-退出代码-2-的解决方法/
toc: true
---

概要：本文介绍在 VSCode 中打开 WSL 集成终端时报错“退出代码 2”的原因及解决方法。通过检查 VSCode 设置中的终端配置，修复路径或参数错误，恢复 WSL 终端正常使用。


## 1. 问题描述

在 VSCode 中，集成终端打开 WSL 时，出现以下报错信息：

```
wsl 终端进程"C:\Windows\System32\bash.exe '-d", "Ubuntu-20.04"已 终止，退出代码:2。
```

示例截图：  
![alt text](/assets/images/vscode使用/vscode-集成终端打开-wsl-报错-wsl-终端进程已终止-退出代码-2-的解决方法/image.png)  
![alt text](/assets/images/vscode使用/vscode-集成终端打开-wsl-报错-wsl-终端进程已终止-退出代码-2-的解决方法/image-1.png)

---

## 2. 解决过程

该错误通常表示找不到指定的文件或目录，可能是由于 WSL 路径或参数配置错误。使用 PowerShell 输入 wsl 命令，发现 WSL 本身正常，说明问题出在 VSCode 与 WSL 的连接配置上。

### 2.1 修改 VSCode 设置

1. 按下 `Ctrl + ,` 打开设置界面。
2. 点击右上角的“打开设置（JSON）”按钮，打开 `settings.json` 文件。
3. 查看或添加 `"terminal.integrated.profiles.windows"` 项，确保里面的 WSL 配置正确。

示例配置如下：

```json
"terminal.integrated.profiles.windows": {
    "PowerShell": {
        "source": "PowerShell",
        "icon": "terminal-powershell"
    },
    "Command Prompt": {
        "path": [
            "${env:windir}\\Sysnative\\cmd.exe",
            "${env:windir}\\System32\\cmd.exe"
        ],
        "args": [],
        "icon": "terminal-cmd"
    },
    "Git Bash": {
        "source": "Git Bash",
        "path": "C:\\software\\Git\\bin\\bash.exe"
    },
    "Ubuntu-20.04 (WSL)": {
        "path": "C:\\Windows\\System32\\wsl.exe",
        "args": [
            "-d",
            "Ubuntu-20.04"
        ]
    }
}
```

### 2.2 检查 WSL 路径与参数

- 如果 `"Ubuntu-20.04 (WSL)"` 这一项不存在，请自行添加。
- 检查 `"path"` 路径是否真实存在，可手动在系统中打开该路径下的 exe 文件验证。
- 如果路径指向 `bash.exe`，则应删除 `"args"` 项，例如：

```json
"Ubuntu-20.04 (WSL)": {
    "path": "C:\\Windows\\System32\\bash.exe"
}
```

- 如果使用 `wsl.exe`，则应指定参数：

```json
"Ubuntu-20.04 (WSL)": {
    "path": "C:\\Windows\\System32\\wsl.exe",
    "args": [
        "-d",
        "Ubuntu-20.04"
    ]
}
```

> 注：Ubuntu 版本可根据实际安装情况进行修改。

### 2.3 保存并测试

编辑完成后按 `Ctrl + S` 保存，再尝试打开终端，应该可以正常启动 WSL。

如果使用 `bash.exe` 启动后发现终端缺少颜色高亮，可尝试改用 `wsl.exe` 方式启动以获得更好的终端体验。

---

## 3. 问题原因分析

为什么之前可以正常使用，现在却报错？

可能原因是：开启了 VSCode 的设置同步功能（Settings Sync），将另一台设备的设置同步到本机，导致本机的 WSL 配置被覆盖或路径发生变化，从而无法正确调用对应的 WSL 实例。
