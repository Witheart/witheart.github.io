---
title: "vscode插件调试窗口中看不到命令"
date: 2026-01-31
last_modified_at: 2026-01-31
categories:
  - "vscode 扩展 Extensions 开发"
tags:
  - "vscode 扩展 Extensions 开发"
permalink: /vscode-扩展-extensions-开发/vscode插件调试窗口中看不到命令/
toc: true
---

## 问题描述
在Extension Development Host中看不到设定的命令。

## 解决方式
检查 package.json 文件，并确保 engines.vscode 版本与已安装的 VS Code 版本兼容。

![alt text](/assets/images/vscode-扩展-extensions-开发/vscode插件调试窗口中看不到命令/PixPin_2026-01-31_14-49-16.png)
![alt text](/assets/images/vscode-扩展-extensions-开发/vscode插件调试窗口中看不到命令/PixPin_2026-01-31_14-49-43.png)
