---
title: "安装VNC服务并开机自启 实现远程桌面控制"
date: 2025-02-10
last_modified_at: 2025-02-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/
toc: true
---

VNC（Virtual Network Computing）是一种远程桌面共享协议，允许用户通过网络访问远程计算机的桌面环境。本教程介绍如何在 Linux 系统（如 Ubuntu、Debian 等）上安装 `x11vnc` 服务器，并配置其开机自启，以便远程访问和管理桌面环境。

## **1. 安装 VNC 服务器**
```bash
更新软件包列表：
sudo apt update
```
然后安装 `x11vnc`：
```bash
sudo apt install x11vnc -y
```

---

## **2. 设置 VNC 访问密码**
注意：一般来说，使用桌面环境登录的账户，进行VNC配置。

我们需要为 VNC 服务器设置访问密码：
```bash
x11vnc -storepasswd
```
系统会要求你输入并确认密码，并提示密码保存的位置（默认为 `/home/user/.vnc/passwd`）。请记住这个路径，因为后续配置需要用到它。

---

## **3. 手动启动 VNC 服务器（测试连接）**
在配置开机自启前，我们先手动启动 `x11vnc` 进行测试。

### **步骤 1：设置 `DISPLAY` 环境变量**
```bash
export DISPLAY=:0
```
如果系统有多个显示器，可能需要调整 `:0` 为适当的值（如 `:1` 或 `:2`）。

### **步骤 2：启动 VNC 服务器**
```bash
x11vnc -auth guess -once -loop -noxdamage -repeat -rfbauth /home/user/.vnc/passwd -rfbport 5900 -shared
```
> **说明**：
> - `-auth guess`：自动检测 X 服务器的认证文件（可能需要调整）。
> - `-once`：连接一次后自动退出（测试用）。
> - `-loop`：如果连接断开，会重新等待新的连接。
> - `-noxdamage`：提高兼容性，防止画面损坏。
> - `-repeat`：允许重复按键输入。
> - `-rfbauth`：指定 VNC 密码文件。
> - `-rfbport 5900`：设置 VNC 监听端口。
> - `-shared`：允许多个客户端同时连接。

---

## **4. 连接到 VNC 服务器**
在另一台主机（需与 VNC 服务器在同一网络内），使用 VNC 客户端进行连接：

### **使用 RealVNC Viewer**
1. 打开 RealVNC Viewer，输入：
   ```
   远程主机的IP:5900
   ```
   ![alt text](/assets/images/ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/image.png)
2. 按下回车键，输入之前设置的 VNC 密码，即可访问远程桌面。
![alt text](/assets/images/ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/image-1.png)

### **使用 MobaXterm**
1. 新建一个远程桌面连接，输入远程主机 IP 地址，端口设为 `5900`
![alt text](/assets/images/ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/image-2.png)
![alt text](/assets/images/ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/image-3.png)
2. 连接成功
![alt text](/assets/images/ubuntu-开发指南/安装vnc服务并开机自启-实现远程桌面控制/image-4.png)


如果连接成功，说明 `x11vnc` 正常运行。接下来，我们配置开机自启。


---

## **5. 配置 `x11vnc` 开机自启**
为了在系统启动时自动运行 `x11vnc`，我们使用 `systemd`。

### **步骤 1：创建 `systemd` 服务文件**
使用 `vim` 或 `nano` 编辑 `/etc/systemd/system/x11vnc.service`：
```bash
sudo nano /etc/systemd/system/x11vnc.service
```
粘贴以下内容（请替换 `user` 为你的 Linux 用户名）：

```ini
[Unit]
Description=Start x11vnc at system boot
After=display-manager.service
Requires=display-manager.service

[Service]
Type=simple
User=user
Group=user
ExecStart=/usr/bin/x11vnc -auth /home/user/.Xauthority -display :0 -rfbauth /home/user/.vnc/passwd -rfbport 5900 -forever -loop -noxdamage -repeat -shared -capslock -nomodtweak
Restart=always
RestartSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target
```

> **参数说明**：
> - `-forever`：保持 VNC 服务器运行，不会在客户端断开后退出。
> - `-nomodtweak`：防止某些键盘的修饰键（如 Ctrl/Alt）失效。
> - `Restart=always`：如果 `x11vnc` 进程崩溃或退出，自动重启。

---

### **步骤 2：确保 `.Xauthority` 文件权限正确**
`x11vnc` 需要访问 `.Xauthority` 文件，否则可能无法连接到 X 服务器。

执行以下命令：
```bash
sudo chown user:user /home/user/.Xauthority
sudo chmod 600 /home/user/.Xauthority
```
如果 `.Xauthority` 不存在，可以使用以下命令手动创建：
```bash
touch /home/user/.Xauthority
```

---

### **步骤 3：启用并启动 `x11vnc` 服务**
```bash
sudo systemctl daemon-reload
sudo systemctl enable x11vnc
sudo systemctl start x11vnc
```

---

## **6. 验证 VNC 服务状态**
运行以下命令检查 `x11vnc` 是否成功启动：
```bash
systemctl status x11vnc
```
如果输出包含 `Active: active (running)`，说明 VNC 服务器已成功运行。
重启远程主机后，使用VNC软件进行连接，连接成功则VNC自启服务配置成功。
