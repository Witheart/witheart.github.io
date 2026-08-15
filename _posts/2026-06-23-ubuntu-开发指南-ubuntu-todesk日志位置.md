---
title: "Ubuntu todesk日志位置"
date: 2026-06-23
last_modified_at: 2026-06-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-todesk日志位置/
toc: true
---

## 日志位置

- 服务端日志
```bash
/var/log/todesk/
```

- 客户端日志
```bash
~/.local/share/todesk/Logs/
```

## 打包方式
```bash
tar -czvf todesk-service.tgz /var/log/todesk

tar -czvf todesk-client.tgz ~/.local/share/todesk/Logs
```
