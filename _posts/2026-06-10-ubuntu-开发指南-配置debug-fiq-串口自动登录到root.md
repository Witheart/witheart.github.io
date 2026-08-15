---
title: "配置debug fiq 串口自动登录到root"
date: 2026-06-10
last_modified_at: 2026-06-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/配置debug-fiq-串口自动登录到root/
toc: true
---

## firefly系统

查看firefly官方的系统，发现其debug串口是自动登录的。

寻找配置文件：

```bash
systemctl status serial-getty@ttyFIQ0.service

● serial-getty@ttyFIQ0.service - Serial Getty on ttyFIQ0
     Loaded: loaded (/lib/systemd/system/serial-getty@.service; enabled-runtime>
    Drop-In: /etc/systemd/system/serial-getty@.service.d
             └─override.conf
     Active: active (running) since Wed 2026-06-10 13:40:50 CST; 2min 34s ago
       Docs: man:agetty(8)
             man:systemd-getty-generator(8)
             http://0pointer.de/blog/projects/serial-console.html
   Main PID: 798 (login)
     Memory: 3.1M
     CGroup: /system.slice/system-serial\x2dgetty.slice/serial-getty@ttyFIQ0.se>
             ‣ 798 /bin/login -f


6月 10 13:40:50 user systemd[1]: Started Serial Getty on ttyFIQ0.
6月 10 13:40:51 user login[798]: pam_unix(login:session): session opened for us>
lines 1-15/15 (END)
```

其对`/lib/systemd/system/serial-getty@.service`这个模板使用了`/etc/systemd/system/serial-getty@.service.d/override.conf`进行覆盖。

查看其内容

```bash
cat /etc/systemd/system/serial-getty@.service.d/override.conf
[Service]
ExecStart=
ExecStart=-/sbin/agetty -a root --keep-baud 115200,38400,9600 %I $TERM
```

- ExecStart=：第一行空置，作用是把 systemd 默认模板里的那一长串要求输入密码的启动命令给清空。
- ExecStart=-/sbin/agetty -a root ...：这就是真正的接管命令。这里的 -a root 其实就是 --autologin root 的简写。agetty 看到这个参数后，就会跳过密码校验，直接拉起 /bin/login -f，给你一个拥有最高权限的 root shell。

## 配置方式

### 第一步：创建全局串口服务覆盖目录

这个命令会创建一个 `serial-getty@.service.d` 文件夹。注意这里带了 `@` 但没有写死 `ttyFIQ0`，意味着只要是系统的串口，都会应用这个免密规则（和厂家一模一样）。

```bash
mkdir -p /etc/systemd/system/serial-getty@.service.d/

```

### 第二步：写入 Override 配置文件

直接复制这一整段代码并回车执行：

```bash
cat <<EOF > /etc/systemd/system/serial-getty@.service.d/override.conf
[Service]
ExecStart=
ExecStart=-/sbin/agetty -a root --keep-baud 1500000,115200,38400,9600 %I \$TERM
EOF

```

### 第三步：重新加载 systemd 并生效

告诉系统配置已经更新，并重启当前的串口服务：

```bash
systemctl daemon-reload
systemctl restart serial-getty@ttyFIQ0.service

```
