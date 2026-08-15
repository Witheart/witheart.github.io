---
title: "GNOME Shell Extension 相关"
date: 2026-01-06
last_modified_at: 2026-01-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gnome-shell-extension-相关/
toc: true
---

### 核心定义

**GNOME Shell 扩展** 是一种小型插件或脚本，用于修改、增强或定制 **GNOME 桌面环境** 的外观、功能和行为。可以把它理解为 GNOME 的“扩展程序”或“附加组件”。

GNOME Shell 是 GNOME 3 桌面环境的核心用户界面，它负责管理顶栏、活动概览、应用程序网格、消息托盘等。扩展允许用户在**不修改核心系统文件**的情况下，对这个界面进行个性化调整。

---

### 技术本质

- **基于 JavaScript 和 CSS**：扩展主要使用 JavaScript 来编写逻辑，使用 CSS 来定义样式。它们通过 GNOME 的 GObject Introspection 系统与底层的 GNOME 服务（如 Mutter 窗口管理器）进行交互。
- **沙盒与集成**：扩展运行在一个受控的环境中，但能深度集成到 Shell 进程中。这意味着一个编写不当的扩展可能导致 Shell 崩溃（需要按 `Alt + F2`，输入 `r` 然后回车来重启 Shell）。
- **版本依赖性强**：扩展与特定版本的 GNOME Shell 紧密绑定。当的系统升级到新的 GNOME 版本（例如从 45 升级到 46）时，许多旧扩展可能会失效，需要开发者更新。

---

### 如何安装扩展？

1.  **官方仓库**：

    - **https://extensions.gnome.org/**：这是最主流、最安全的来源。可以直接在网站上浏览、安装、启用/禁用扩展（通过浏览器扩展实现）。网站会自动检测的 GNOME Shell 版本，并显示兼容的扩展。
    - **浏览器集成**：访问上述网站时，通常需要安装一个名为 “GNOME Shell Integration” 的浏览器扩展和一个名为 “Extension Manager” 的本地连接器，才能实现一键安装。(火狐浏览器可能会出现`The add-on downloaded from this site could not be installed because it appears to be corrupt.`问题，请改用非snap版本的chromium尝试)

2.  **命令行安装**

```bash
# 命令行安装器下载
sudo wget https://raw.githubusercontent.com/brunelli/gnome-shell-extension-installer/master/gnome-shell-extension-installer -O /usr/local/bin/gnome-shell-extension-installer

# 赋予可执行权限
sudo chmod +x /usr/local/bin/gnome-shell-extension-installer

# 根据扩展ID进行安装
gnome-shell-extension-installer 4413
```

- 扩展 ID 获取方式
  ![alt text](/assets/images/ubuntu-开发指南/gnome-shell-extension-相关/PixPin_2026-01-06_16-50-41.png)
  这里的 4413 是该扩展在 extensions.gnome.org 网站上的唯一编号。
- 安装完成后，需要重启 GNOME Shell 来激活扩展：按 Alt + F2，输入 r 然后回车。
- 在下文提到的扩展管理软件中去开关扩展

3.  **手动安装**：
    - 也可以从 GitHub 等平台下载扩展源代码，将其放入本地扩展目录 `~/.local/share/gnome-shell/extensions/` 中。

---

### 如何管理扩展？

- **扩展管理器**：这是一个专门的 GUI 应用（如 `gnome-shell-extension-manager` 或 `extension-manager`），是管理扩展最方便的方式。它可以浏览、安装、更新、配置和删除扩展。
  ![alt text](/assets/images/ubuntu-开发指南/gnome-shell-extension-相关/PixPin_2026-01-06_16-40-31.png)
  ![alt text](/assets/images/ubuntu-开发指南/gnome-shell-extension-相关/PixPin_2026-01-06_16-40-55.png)
- **GNOME Tweaks**：一个系统调整工具，也包含一个“扩展”标签页，用于启用/禁用已安装的扩展。
  ![alt text](/assets/images/ubuntu-开发指南/gnome-shell-extension-相关/PixPin_2026-01-06_16-42-33.png)
- 查看已安装的扩展
```bash
gnome-extensions list
```
