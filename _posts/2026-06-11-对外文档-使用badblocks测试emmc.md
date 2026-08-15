---
title: "使用badblocks测试EMMC"
date: 2026-06-11
last_modified_at: 2026-06-11
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/使用badblocks测试emmc/
toc: true
---

- 终端中输入命令
```bash
sudo badblocks -v -s /dev/mmcblk0
```

上述命令会开启EMMC全盘扫描，可能持续几十分钟。
