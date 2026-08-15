---
title: "Ubuntu 22.04 XFCE 面板出现两个网络图标，圆角消失"
date: 2025-12-24
last_modified_at: 2025-12-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-22-04-xfce-面板出现两个网络图标-圆角消失/
toc: true
---

首先说明，这个问题没有解决，只是规避了
这个问题在Ubuntu20.04 XFCE上没有遇见过，貌似和面板首选项中新增的暗黑模式相关
开启暗黑模式后，重启，面板上便会出现两个网络图标，其中一个是暗黑模式的，另一个是正常模式

面板的圆角不能正确显示

重启面板可以修复
xfce4-panel --restart

相关问题报告
https://bugs.launchpad.net/ubuntu/+source/xfce4-panel/+bug/1685502
https://bugs.launchpad.net/ubuntu/+source/lubuntu-default-settings/+bug/1761606


PS：关于xfce panel的圆角自定义
https://www.reddit.com/r/xfce/comments/kghsiz/round_xfce4panel/?tl=zh-hans
