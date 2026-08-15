---
title: "首次烧录后无法查看journalctl(systemd)日志 (no journal files were found)"
date: 2026-01-05
last_modified_at: 2026-01-05
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/首次烧录后无法查看journalctl-systemd-日志-no-journal-files-were-found/
toc: true
---

## 问题描述
Ubuntu烧录后，使用journalctl -f查看日志，提示`no journal files were found`，看不到日志输出。

## 问题原因
由于客户要求，在烧录后首次开机，系统将会执行重置machine-id的操作，而journal日志是通过机器id来区分不同机器的日志的。由于重置machine-id的操作晚于systemd-journald.service 服务，导致journalctl找不到新机器id对应的日志。

## 解决方式
在重置机器id后，重启日志服务：
```bash
sudo systemctl restart systemd-journald
```

## 补充
日志文件所处位置如下：
```bash
ls -la /var/log/journal/
```

查看机器id方式：
```bash
cat /etc/machine-id
```
