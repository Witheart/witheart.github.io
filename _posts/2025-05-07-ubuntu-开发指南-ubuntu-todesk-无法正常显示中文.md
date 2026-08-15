---
title: "Ubuntu todesk 无法正常显示中文"
date: 2025-05-07
last_modified_at: 2025-05-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-todesk-无法正常显示中文/
toc: true
---

## 执行以下命令安装Noto CJK字体系列
```bash
sudo apt update
sudo apt install fonts-noto-cjk
sudo apt install fonts-noto-cjk-extra
```

- 重启，然后重新启动todesk
