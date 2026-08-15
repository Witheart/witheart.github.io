---
title: "zsh npm run watch error command not found"
date: 2026-01-31
last_modified_at: 2026-01-31
categories:
  - "vscode 扩展 Extensions 开发"
tags:
  - "vscode 扩展 Extensions 开发"
permalink: /vscode-扩展-extensions-开发/zsh-npm-run-watch-error-command-not-found/
toc: true
---

## 问题描述
vscode开发扩展时，F5调试，虽然弹出了Extension Development Host，但实际上没有成功编译，终端处报错
```bash
 *  正在执行任务: npm run watch 

zsh:1: command not found: npm

 *  终端进程“/usr/bin/zsh '-c', 'npm run watch'”启动失败(退出代码: 127)。 
```

这是因为zsh找不到npm，原因是vscode直接启动的zsh没有npm的环境变量，运行插件命令还会报如下的错误：
```
Activating extension 'undefined_publisher.device-tree-visualizer' failed: Cannot find module '/home/hw/hdd/device-tree-visualizer/device-tree-visualizer/out/extension.js' Require stack: - /home/hw/.vscode-server/cli/servers/Stable-6f17636121051a53c88d3e605c491d22af2ba755/server/out/vs/workbench/api/node/extensionHostProcess.js.
```

## 解决方式
```zsh
cat >> ~/.zshenv << 'EOF'
# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF
```
