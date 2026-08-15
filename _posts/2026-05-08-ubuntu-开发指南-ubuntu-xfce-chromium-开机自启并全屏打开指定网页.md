---
title: "Ubuntu XFCE Chromium 开机自启并全屏打开指定网页"
date: 2026-05-08
last_modified_at: 2026-05-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-xfce-chromium-开机自启并全屏打开指定网页/
toc: true
---

- 会话和启动 -> 应用程序自启动 -> 新建项目
- 启动命令改为如下
```bash
chromium http://127.0.0.1 --kiosk --no-first-run
```

- 网址根据需要更改，有的需要改为https
