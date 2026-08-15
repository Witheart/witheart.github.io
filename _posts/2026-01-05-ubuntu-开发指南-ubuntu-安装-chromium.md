---
title: "Ubuntu 安装 Chromium"
date: 2026-01-05
last_modified_at: 2026-01-05
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-安装-chromium/
toc: true
---

概要：本文介绍了在 Ubuntu 系统上安装 Chromium 浏览器的具体步骤，并提供了注意事项，避免安装错误的软件包。  


## 1. 什么是 Chromium  

Chromium 是 Google 维护的开源浏览器项目，许多现代浏览器（如 Google Chrome、Microsoft Edge）都基于 Chromium 开发。  

---

## 2. 在 Ubuntu 上安装 Chromium  

### 2.1 更新软件包列表  

在安装之前，先更新软件包列表以确保获取最新的软件版本：  

```bash
sudo apt update
```

### 2.2 安装 Chromium 浏览器  

运行以下命令安装 Chromium 浏览器：  (注意，安装的是snap版本！)

```bash
sudo apt install chromium-browser
```

### 2.3 启动 Chromium  

安装完成后，可以使用以下命令启动 Chromium 浏览器：  

```bash
chromium-browser
```

如果报错

```bash
cannot set capabilities: Operation not permitted
```

使用下面的命令启动

```bash
sudo chromium-browser --no-sandbox
```

---

## 3. 注意事项  

- **避免安装错误的软件包**：请确保安装的是 `chromium-browser`，而不是 `chromium-bsu`，后者是一个游戏，而非浏览器。
