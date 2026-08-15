---
title: "清理fcitx输入法框架"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/清理fcitx输入法框架/
toc: true
---

## 背景
输入法框架从fcitx更换为ibus，为了避免冲突，决定清理fcitx

**核心原则：** 使用 `apt` 的 `purge` 命令移除 Fcitx 核心包及其依赖，同时避免移除 IBus 相关的包。

## 步骤详解

1.  **打开终端：** 使用快捷键（如 `Ctrl+Alt+T`）或从应用程序菜单启动终端。

2.  **卸载 Fcitx 核心及相关输入法引擎：**
    ```bash
    sudo apt purge fcitx*  # 注意末尾的星号(*)
    ```
    *   `sudo`: 获取管理员权限。
    *   `apt purge`: 不仅删除软件包，还会**删除其全局配置文件**（位于 `/etc/fcitx` 等）。这比 `apt remove` 更彻底，有助于防止残留配置干扰。
    *   `fcitx*`: 这个通配符会匹配所有以 `fcitx` 开头的包名。这会卸载 `fcitx-bin`, `fcitx-config-common`, `fcitx-data`, `fcitx-frontend-*`, `fcitx-module-*`, `fcitx-ui-*` 以及**最重要的** `fcitx-rime` 等所有 Fcitx 主框架和插件。
    *   **关键点：** `ibus` 和 `ibus-rime` 的包名**不**以 `fcitx` 开头，所以它们**不会被这个命令卸载**。系统会精确地移除所有 Fcitx 相关的包。

3.  **移除不再需要的依赖项 (可选)：**
    ```bash
    sudo apt autoremove
    ```
    *   这条命令会移除那些因为卸载 Fcitx 而不再被任何其他软件需要的依赖包。这有助于保持系统清洁。
    *   同样，它**不会**移除 IBus 或 `ibus-rime` 的依赖，因为这些包仍然安装着。

4.  **清理用户配置文件 (可选但推荐)：**
    *   虽然 `apt purge` 删除了全局配置，但用户目录下可能还有 Fcitx 的配置文件。这些文件通常不会影响 IBus，但如果你追求彻底清理或遇到奇怪问题，可以删除它们：
        ```bash
        rm -rf ~/.config/fcitx  # 删除 Fcitx 的用户配置文件夹
        rm -rf ~/.local/share/fcitx5  # 如果安装了较新的 fcitx5，删除其用户数据
        ```
    *   **注意：** 删除 `~/.config/fcitx` 会清除你之前在 Fcitx 中的所有个人设置（包括 Rime 在 Fcitx 下的配置状态）。如果你以后重新安装 Fcitx，需要重新配置。

5.  **检查并禁用 Fcitx 自启动 (重要)：**
    *   打开 Xfce 的设置管理器：`设置` -> `会话和启动` -> `应用程序自启动` 标签页。
    *   在列表中查找任何与 `fcitx` 相关的条目（例如 `Fcitx`， `fcitx-autostart` 等）。
    *   确保这些条目**没有被勾选**。如果勾选了，取消勾选。
    *   点击 `关闭` 保存更改。

6.  **检查环境变量 (可选但推荐)：**
    *   打开你的用户主目录 (`~`)，检查以下文件是否存在：
        *   `~/.profile`
        *   `~/.xprofile`
        *   `~/.pam_environment` (不太常见)
    *   使用文本编辑器（如 `nano`, `gedit`, `mousepad`）打开这些文件。
    *   查找并**删除或注释掉**任何明确设置 `GTK_IM_MODULE`, `QT_IM_MODULE`, `XMODIFIERS` 指向 `fcitx` 的行。例如：
        ```bash
        # 删除或注释掉类似这样的行：
        export GTK_IM_MODULE=fcitx
        export QT_IM_MODULE=fcitx
        export XMODIFIERS=@im=fcitx

        # 确保它们指向 ibus (如果之前同时设置了，现在只保留 ibus)：
        export GTK_IM_MODULE=ibus
        export QT_IM_MODULE=ibus
        export XMODIFIERS=@im=ibus
        ```
    *   保存文件并关闭编辑器。

7.  **重启会话或注销登录：**
    *   为了使所有更改生效（特别是禁用自启动和环境变量更改），**请务必注销你的用户账户，然后重新登录**。或者直接重启电脑。

**验证：**

1.  重新登录后，打开一个终端，输入：
    ```bash
    ps aux | grep -E 'ibus|fcitx'
    ```
    *   你应该能看到 `ibus` 相关的进程（如 `ibus-daemon`），但**不应该**看到任何 `fcitx` 相关的进程（如 `fcitx` 或 `fcitx-rime`）。
2.  打开一个应用程序（如文本编辑器、浏览器），尝试使用 `ibus-rime` 输入中文。切换输入法应该使用 IBus 的快捷键（通常是 `Super+Space`）。
3.  检查系统托盘区域，应该只看到 IBus 的图标（可能是一个键盘或“中/英”标识），**不应该**看到 Fcitx 的图标。
