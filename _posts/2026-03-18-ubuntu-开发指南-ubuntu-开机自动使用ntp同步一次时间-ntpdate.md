---
title: "Ubuntu 开机自动使用ntp同步一次时间 ntpdate"
date: 2026-03-18
last_modified_at: 2026-03-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-开机自动使用ntp同步一次时间-ntpdate/
toc: true
---

- 在开机脚本中加入
```bash
# ntp======
(sleep 20; echo "[witheart] ntp时间同步" > /dev/kmsg; ntpdate ntp.aliyun.com 2>&1 | awk '{print "[witheart] ntpdate: " $0}' > /dev/kmsg) &
```
