---
title: "Linux 桌面环境设置应用开机自启（.config autostart 方式）"
date: 2025-12-23
last_modified_at: 2025-12-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-桌面环境设置应用开机自启-config-autostart-方式/
toc: true
---

无论程序是否具备图形用户界面（GUI），本方案均适用。


## 修改历史

| 时间   | 历史                                                 |
| ------ | ---------------------------------------------------- |
| 250828 | 创建了本文                                           |
| 250911 | 增加了命令行创建，启动用户说明，启动失败问题排查章节 |
| 251223 | 增加了优先级说明                                     |

## 1 图形界面创建

- 开始菜单 -> 设置 -> 会话和启动 -> 应用程序自启动
  ![alt text](/assets/images/ubuntu-开发指南/linux-桌面环境设置应用开机自启-config-autostart-方式/PixPin_2025-08-28_11-24-56.png)

- 点击添加，填写相关内容，最重要的是要执行的命令，命令填写可以参考已有的自启动项
  ![alt text](/assets/images/ubuntu-开发指南/linux-桌面环境设置应用开机自启-config-autostart-方式/PixPin_2025-08-28_11-25-46.png)

## 2 命令行创建

上述方式会在 `~/.config/autostart/` 目录下创建 `.desktop` 文件，此文件也可不通过图形界面，手动创建。
一个示例内容如下

```bash
[Desktop Entry]
Encoding=UTF-8
Version=0.9.4
Type=Application
Name=check
Comment=
Exec=sh -c "sleep 5 && /home/user/user_identity_logger.sh"
OnlyShowIn=XFCE;
RunHook=0
StartupNotify=false
Terminal=false
Hidden=false
```

这个文件中的 Name、Comment、Exec 分别对应图形界面创建的“名称”、“描述”、“命令”。

## 3 启动用户说明

- 使用图形界面方式设置的，会使用该图形界面登录桌面时的用户身份进行启动
- 使用手动创建方式的，`.desktop` 文件在哪个用户的`~/.config/autostart/` 目录下，就会在该用户登录图形界面时使用该用户的身份启动

## 4 启动失败问题排查

### 4.1 尝试延时

- 使用了上述方式配置的自启动，如果启动失败，可以加入延时看看是否可以启动，如果加入延时后成功启动了，那么就是启动时序的问题（该程序在启动时依赖的其他程序还未启动导致的启动失败）
- 需要使用`sh -c " "`进行命令的包裹，原因是当桌面环境执行 .desktop 文件中的 Exec 行时，它默认不会启动一个完整的交互式 shell（如 bash）来解析该行
- 使用如下的命令，填入图形设置界面的“命令”处，或者是手动创建的.desktop 文件的 Exec 字段中

```bash
sh -c "sleep 5 && 启动命令"
```

- 实测，使用该方式延时，也会使用正确的用户和桌面环境变量

### 4.2 环境变量（以 Qt GUI 程序为例）

如果尝试了加延时的方式后，仍无法正常启动，则考虑是环境变量问题。使用以下流程排查：

1. 在可以正常启动程序的终端下，导出环境变量

```bash
env > /home/user/user_manual_env.txt
```

2. 使用自启动程序的方式，导出环境变量，如下，在“会话与启动”中，创建自启动项，执行如下的命令

```bash
env > /home/user/user_auto_env.txt
```

3. 比较两次启动使用的环境变量的区别，可以看到自启动时缺少了 Qt 的环境变量声明
   ![比较](/assets/images/ubuntu-开发指南/linux-桌面环境设置应用开机自启-config-autostart-方式/PixPin_2025-09-11_11-05-45.png)
4. 配置一脚本，脚本先导出缺少的环境变量，再进行程序的启动

```bash
vim start_test_app.sh
```

填写以下内容

```bash
#!/bin/bash

# 导出缺少的环境变量
export LD_LIBRARY_PATH=/opt/Qt5.12.9/lib:/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH
export QT_PLUGIN_PATH=/opt/Qt5.12.9/plugins
export QT_QPA_PLATFORM=xcb
export PATH="/opt/Qt5.12.9/bin:$PATH"
export QTDIR=/opt/Qt5.12.9
export PKG_CONFIG_PATH="/opt/Qt5.12.9/lib/pkgconfig:$PKG_CONFIG_PATH"

# 要启动的Qt程序
/home/user/test_tool/qt_test/test_app

```

5. 给予该脚本可执行权限，并使用该脚本作为自启动项

```bash
chmod +x start_test_app.sh
```

使用图形界面或者命令行界面自启动 start_test_app.sh 即可。

## 5 优先级覆盖

autostart 有两个位置的设置

```
~/.config/autostart/  # 用户级
/etc/xdg/autostart/   # 系统级
```

- 用户级别的设置通常会覆盖或优先于系统级别的设置
- 如果想要禁用系统级的一个自动启动项，可以在用户级目录中创建一个同名的.desktop 文件，并设置 Hidden=true。这样，这个启动项就不会被显示和运行。
