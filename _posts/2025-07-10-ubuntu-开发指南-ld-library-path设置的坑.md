---
title: "LD_LIBRARY_PATH设置的坑"
date: 2025-07-10
last_modified_at: 2025-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ld-library-path设置的坑/
toc: true
---

- LD_LIBRARY_PATH被显式设置时，系统可能就不会去/etc/ld.so.conf.d/aarch64-linux-gnu.conf文件中找动态链接库路径了！导致很多软件运行不正常！

- 最好是将要显式设置的LD_LIBRARY_PATH加入该文件中
（血泪教训）
