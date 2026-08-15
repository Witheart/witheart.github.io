---
title: "whoopsie报错offline解决"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/whoopsie报错offline解决/
toc: true
---

该程序是用于crash上报的，直接屏蔽其服务就可以
```bash
systemctl stop whoopsie
systemctl disable whoopsie
sudo systemctl mask whoopsie
```
