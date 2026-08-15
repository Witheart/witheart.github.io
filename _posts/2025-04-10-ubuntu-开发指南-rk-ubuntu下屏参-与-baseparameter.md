---
title: "RK Ubuntu下屏参 与 baseparameter"
date: 2025-04-10
last_modified_at: 2025-04-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk-ubuntu下屏参-与-baseparameter/
toc: true
---

问题：
内核设备树修改屏参后，不生效，表现为debug口读取到的分辨率和设备树中设置的不一致，后面发现是和baseparameter 256KB处存储的屏参有关

lcdparamservice中，会在baseparameter中，256KB偏移处，写入配置文件hw_lcd中的内容

lseek(sys_fd, BASE_OFFSET, SEEK_SET);
