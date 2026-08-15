---
title: "Ubuntu 日志大小限制"
date: 2026-03-18
last_modified_at: 2026-03-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-日志大小限制/
toc: true
---

systemd-journald、rsyslog 和 logrotate 这三者的概念，请阅读《Ubuntu 日志系统简介》。

## 参考链接

[logrotate 手册](https://manpages.debian.org/jessie/logrotate/logrotate.8.en.html)
[linux日志规则](https://so1n.me/2019/12/05/linux%E6%97%A5%E5%BF%97%E6%9C%BA%E5%88%B6/)

## 1 systemd-journald

### 1.1 日志存储位置

- 存储位置：集中存储在 `/run/log/journal/`（临时）或 `/var/log/journal/`（持久化）

### 1.2 基础命令

- 以系统每次启动，列出所有日志

```bash
journalctl --list-boots
```

- 查看某次启动的日志

```bash
journalctl -b 0 # 本次启动

journalctl -b -1 # 上次启动
```

- 查看存储控件占用大小

```bash
journalctl --disk-usage
```

### 1.3 日志大小配置

- 配置文件位置

```bash
vim /etc/systemd/journald.conf
```

- 文件内容如下

```bash
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.
#
# Entries in this file show the compile time defaults.
# You can change settings by editing this file.
# Defaults can be restored by simply deleting this file.
#
# See journald.conf(5) for details.

[Journal]
Storage=persistent
#Compress=yes
#Seal=yes
#SplitMode=uid
#SyncIntervalSec=5m
#RateLimitIntervalSec=30s
#RateLimitBurst=10000
SystemMaxUse=60M
#SystemKeepFree=
#SystemMaxFileSize=
#SystemMaxFiles=100
#RuntimeMaxUse=
#RuntimeKeepFree=
#RuntimeMaxFileSize=
#RuntimeMaxFiles=100
#MaxRetentionSec=
#MaxFileSec=1month
ForwardToSyslog=no
#ForwardToKMsg=no
#ForwardToConsole=no
#ForwardToWall=yes
#TTYPath=/dev/console
#MaxLevelStore=debug
#MaxLevelSyslog=debug
#MaxLevelKMsg=notice
#MaxLevelConsole=info
#MaxLevelWall=emerg
#LineMax=48K
#ReadKMsg=yes

```

### 1.4 参数解析
**如果想修改日志的总大小，只修改SystemMaxUse字段即可！**

**Storage**

- persistent - 指定了日志持久化存储，会存储在/var/log/journal/下面
- volatile - 仅保存在/run/log/journal，关机后该目录自动消失
- none - 表示不保存任何日志(直接丢弃所有收集到的日志)， 但日志转发不受影响
- auto - 有/var/log/journal/目录时是persistent行为，没有该目录时则为volatile行为

（支持 K, M, G, T 等单位）：

**SystemMaxUse**（总大小限制）
- **作用**：限制日志在磁盘上占用的**总最大硬盘空间**。
- **当前状态**：在你的配置中，这一行已经被启用并设置为 `SystemMaxUse=60M`。这意味着所有系统日志加起来最多只会占用 60MB 的空间。如果达到这个值，旧的日志会被自动删除。

**SystemKeepFree**（保留空闲空间）
- **作用**：确保日志不会占满整个磁盘，强制为系统保留指定的**最小磁盘空闲空间**。`journald` 会在 `SystemMaxUse` 和 `SystemKeepFree` 之间取对日志限制更严格的一个。

**SystemMaxFileSize**（单文件大小）
- **作用**：限制**单个日志文件**的最大大小。当当前日志文件达到此大小时，会触发日志轮转（生成新的日志文件）。默认值通常是 `SystemMaxUse` 的 1/8。

**SystemMaxFiles**（文件数量限制）
- **作用**：限制保留的**日志文件最大数量**。在你的配置中，默认建议值为 100。

**ForwardToSyslog**: 配置为yes时，日志会转发给rsyslog，该选项默认为yes，所以如果不想转发，必须去掉注释，显式写no
（如果转发了，意味着相同的日志内容，systemd-journald会存一份，rsyslog也会存一份）

### 1.5 应用与验证
- 应用
```bash
sudo systemctl restart systemd-journald
``` 

- 验证
```bash
sudo systemctl status systemd-journald
```
输出中可看到日志总大小已经受到限制了

```bash
● systemd-journald.service - Journal Service
     Loaded: loaded (/lib/systemd/system/systemd-journald.service; static; vendor preset: enabled)
     Active: active (running) since Mon 2026-06-29 18:38:30 CST; 8s ago
TriggeredBy: ● systemd-journald-dev-log.socket
             ● systemd-journald.socket
             ● systemd-journald-audit.socket
       Docs: man:systemd-journald.service(8)
             man:journald.conf(5)
   Main PID: 1575 (systemd-journal)
     Status: "Processing requests..."
     Memory: 992.0K
     CGroup: /system.slice/systemd-journald.service
             └─1575 /lib/systemd/systemd-journald

6月 29 18:38:30 rk3568 systemd-journald[1575]: Journal started
6月 29 18:38:30 rk3568 systemd-journald[1575]: System Journal (/var/log/journal/770d7b2141af4dd19bbc290d450aaa68) is 80.0M, max 1000.0M, 919.9M free.
6月 29 18:38:30 rk3568 systemd-journald[1575]: System Journal (/var/log/journal/770d7b2141af4dd19bbc290d450aaa68) is 80.0M, max 1000.0M, 919.9M free.
```

## 2 rsyslog

### 2.1 日志存储位置

/var/log下，有kern.log syslog，比如

```bash
-rw-r-----   1 syslog            adm              171101 3月  19 17:08 kern.log
-rw-r-----   1 syslog            adm             7368349 3月  18 16:19 kern.log.1
-rw-r-----   1 syslog            adm                8273 3月  18 11:43 kern.log.2.gz
-rw-r-----   1 syslog            adm                  20 3月  27  2025 kern.log.3.gz

-rw-r-----   1 syslog            adm              171101 3月  19 17:08 syslog
-rw-r-----   1 syslog            adm             8197238 3月  18 16:19 syslog.1
-rw-r-----   1 syslog            adm               27156 3月  18 11:43 syslog.2.gz
-rw-r-----   1 syslog            adm                  20 3月  27  2025 syslog.3.gz

```

### 2.2 日志规则

主配置：/etc/rsyslog.conf
模块及自定义规则：/etc/rsyslog.d/\*.conf

## 3 logrotate

logrotate 用于管理 rsyslog 的日志。

### 3.1 日志大小配置

```bash
vim /etc/logrotate.d/rsyslog
```

内容如下

```bash
/var/log/syslog
{
        su root syslog
        rotate 7
        daily
        maxsize 5M
        missingok
        notifempty
        delaycompress
        compress
        postrotate
                /usr/lib/rsyslog/rsyslog-rotate
        endscript
}

/var/log/mail.info
/var/log/mail.warn
/var/log/mail.err
/var/log/mail.log
/var/log/daemon.log
/var/log/kern.log
/var/log/auth.log
/var/log/user.log
/var/log/lpr.log
/var/log/cron.log
/var/log/debug
/var/log/messages
{
        su root syslog
        rotate 4
        weekly
        maxsize 5M
        missingok
        notifempty
        compress
        delaycompress
        sharedscripts
        postrotate
                /usr/lib/rsyslog/rsyslog-rotate
        endscript
}
```

### 3.2 参数解析

**su root syslog**: 这个配置和/var/log目录的所有者，所有组，以及权限有关

**rotate**: 日志轮转份数，比如7就表示日志最多存7份

**轮转间隔**:
hourly
daily
weekly
monthly
yearly

**maxsize**: 每份日志的最大大小，超过此大小，将无视轮转间隔提前轮转（logrotate 3.8以上支持）
但是这里有个容易误解的点，误以为只要日志一超过此大小，就会立刻触发轮转。但实际上，logrotate是一个由systemd管理的每日任务，每天触发时，如果maxsize满足条件，才会进行轮转，而不是实时跟踪的。也就是说，maxsize对于daily的轮转间隔并没有明显的效果（因为不管有没有maxsize，都是每天轮转一次），但是对于weekly此类大于daily的轮转间隔，只要maxsize达到要求，便会提前轮转。

**size**: 实际上，还有另外一个size参数，这个参数和轮转间隔是互斥的，表示日志文件在达到size大小时，才进行自动轮转（实测也需要等logrotate任务触发或者手动触发，由于没有daily等时间间隔选项，日志可以一直累计直到指定的size大小）

### 3.3 手动触发轮转

- debug模式，不真正执行

```bash
sudo logrotate -d /etc/logrotate.d/rsyslog
```

可以看到配置

```bash
rotating pattern: /var/log/syslog
 after 1 days (7 rotations)
empty log files are not rotated
log files >= 5242880 are rotated earlier
```

每天轮转，保留 7 份，≥5MB 提前轮转，空文件不处理。

- 可能有如下报错，导致轮转失败

```bash
error: skipping "/var/log/syslog" because parent directory has insecure permissions
parent directory has insecure permissions
(It's world writable or writable by group which is not "root")
```

表示因为父目录权限不安全，跳过这个日志。
/var/log 目录权限：

1. 对所有人可写（777 / 775）
2. 或 group 不是 root 且可写

目录权限如下

```bash
ls -ld /var/log
drwxrwxr-x 16 root syslog 4096 3月  18 00:00 /var/log

```

则需要在/etc/logrotate.d/rsyslog中加入 su root syslog，问题解决。

### 3.4 自动触发轮转

**旧版本应该都是用cron**

```bash
cat /etc/cron.daily/logrotate

# skip in favour of systemd timer
if [ -d /run/systemd/system ]; then
    exit 0
fi
```

如果系统使用 systemd，就直接退出，不用 cron

**新版本使用systemd**

- 查看当前timer状态

```bash
systemctl status logrotate.timer
```

- 查看定时策略

```bash
systemctl cat logrotate.timer
```

可以查看journald日志中的轮转记录

```bash
journalctl | grep logrotate
```

输出如下

```bash
3月 18 15:05:48 user systemd[1]: logrotate.timer: Succeeded.
```

### 3.5 手动触发轮转

```bash
sudo logrotate -vf /etc/logrotate.d/rsyslog
```

-v(--verbose)：启用“详细”模式
-f(--force)：“强制”进行轮转
