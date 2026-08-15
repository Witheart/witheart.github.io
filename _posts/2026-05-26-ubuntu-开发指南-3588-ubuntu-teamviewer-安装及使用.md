---
title: "3588 Ubuntu TeamViewer 安装及使用"
date: 2026-05-26
last_modified_at: 2026-05-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-ubuntu-teamviewer-安装及使用/
toc: true
---

## 1 下载地址
**下载TeamViewer full client版本，该版本可控制也可被控。**

- ARM64 Linux版本：https://www.teamviewer.com/cn/download/portal/linux/
![alt text](/assets/images/ubuntu-开发指南/3588-ubuntu-teamviewer-安装及使用/PixPin_2026-05-26_18-15-17.png)

- x86 Windows版本：https://www.teamviewer.com/cn/download/windows/
![alt text](/assets/images/ubuntu-开发指南/3588-ubuntu-teamviewer-安装及使用/PixPin_2026-05-26_18-14-46.png)

## 2 3588 Ubuntu上安装方式
### 2.1 先进行apt软件包更新
```bash
sudo apt update
```

### 2.2 安装可能缺少的依赖
```bash
sudo apt install libxcb-glx0
```

### 2.3 安装TeamViewer
```bash
sudo apt install ./teamviewer_15.78.3_arm64.deb
```

## 3 方法一：使用命令启动
- 通过注入环境变量，强迫 TeamViewer 放弃使用 GPU，完全依赖 CPU 进行软件渲染:
```bash
QT_XCB_GL_INTEGRATION=none LIBGL_ALWAYS_SOFTWARE=1 teamviewer
```

## 4 方法二：使用桌面图标启动 —— 修复桌面图标启动问题
### 关于使用桌面图标无法启动的说明
- 点击桌面图标直接启动，窗口可能不会弹出，查看journalctl日志，没有看到什么异常
```bash
May 26 17:43:12 user systemd[1048]: Started Application launched by gnome-shell.
May 26 17:43:12 user com.teamviewer.TeamViewer.desktop[5966]: Init...
May 26 17:43:12 user com.teamviewer.TeamViewer.desktop[5979]: CheckCPU: aarch64
May 26 17:43:12 user com.teamviewer.TeamViewer.desktop[5954]: Checking setup...
May 26 17:43:12 user com.teamviewer.TeamViewer.desktop[5954]: Launching TeamViewer ...
May 26 17:43:12 user com.teamviewer.TeamViewer.desktop[5954]: Launching TeamViewer GUI ...
May 26 17:43:12 user systemd[1048]: gnome-launched-com.teamviewer.TeamViewer.desktop-5896.scope: Succeeded. 
```

- 直接在命令行启动，可以看到核心已转储的信息
```bash
$XDG_SESSION_TYPE是x11，直接在命令行启动，输出如下
user@user:~$ teamviewer status

Init...
CheckCPU: aarch64
Checking setup...
Launching TeamViewer ...
Launching TeamViewer GUI ...
已放弃 (核心已转储)
```

- 只能使用上面提到的命令行命令启动：原因大致如下：
TeamViewer 的图形界面是基于 Qt 开发的，默认会尝试调用系统的 OpenGL (GLX) 进行硬件加速渲染。但是，RK3588 的自带 GPU（Mali 架构）通常只完美支持 OpenGL ES，对传统桌面版 OpenGL 的支持依赖于转译或软解，这极易导致 Qt 程序在初始化显卡上下文时直接崩溃。

使用下面的方式进行修复

### 4.1 复制快捷方式到本地目录

在user的终端中执行以下命令。

```bash
mkdir -p ~/.local/share/applications/
cp /usr/share/applications/com.teamviewer.TeamViewer.desktop ~/.local/share/applications/
```

### 4.2 编辑快捷方式文件

使用 `nano`（或其他你习惯的文本编辑器）打开刚才复制的文件：

```bash
nano ~/.local/share/applications/com.teamviewer.TeamViewer.desktop
```

### 4.3 修改 `Exec` 行

在打开的文件中，向下滚动，找到以 `Exec=` 开头的那一行（通常在文件的前几行）。它原本看起来大概是这样的：
`Exec=/opt/teamviewer/tv_bin/script/teamviewer`

需要在这行等号的后面，加上 `env QT_XCB_GL_INTEGRATION=none LIBGL_ALWAYS_SOFTWARE=1 `，也就是把它改成：

```ini
Exec=env QT_XCB_GL_INTEGRATION=none LIBGL_ALWAYS_SOFTWARE=1 /opt/teamviewer/tv_bin/script/teamviewer %U

```

*(注意：保留原本 `Exec=` 后面的所有内容，只是在它前面插入 `env` 和环境变量，并用空格隔开。)*

### 4.4 保存并退出


### 4.5 重启

```bash
sudo reboot
```

现在可以直接点击桌面图标启动了

## 5 x86 windows版本使用
- 远程Linux需要登录TeamViewer，而不是点击加入会话
![alt text](/assets/images/ubuntu-开发指南/3588-ubuntu-teamviewer-安装及使用/PixPin_2026-05-26_18-59-37.png)

- 登陆后跳转到这个界面，才能输入远程Linux的用户ID进行远程
![alt text](/assets/images/ubuntu-开发指南/3588-ubuntu-teamviewer-安装及使用/PixPin_2026-05-26_19-01-10.png)
