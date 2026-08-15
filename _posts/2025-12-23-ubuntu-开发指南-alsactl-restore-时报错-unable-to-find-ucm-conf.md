---
title: "alsactl restore 时报错 Unable to find ucm.conf"
date: 2025-12-23
last_modified_at: 2025-12-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/alsactl-restore-时报错-unable-to-find-ucm-conf/
toc: true
---

## 具体报错
RK3588，Ubuntu 22.04
```bash
user@rk3588:~$ sudo alsactl restore -f /root/asound.state
alsa-lib parser.c:2373:(load_toplevel_config) Unable to find the top-level configuration file '/usr/share/alsa/ucm2/ucm.conf'.
alsa-lib main.c:1412:(snd_use_case_mgr_open) error: failed to import hw:0 use case configuration -2
alsa-lib parser.c:2373:(load_toplevel_config) Unable to find the top-level configuration file '/usr/share/alsa/ucm2/ucm.conf'.
alsa-lib main.c:1412:(snd_use_case_mgr_open) error: failed to import hw:1 use case configuration -2

```
主要是说找不到ucm.conf这个配置文件，UCM​ 是 Use Case Manager（用例管理器）的缩写，负责管理复杂的音频信号路径。
比如：
插入耳机时，自动切换到耳机输出
接听电话时，自动切换到听筒模式
连接蓝牙耳机时，自动路由到蓝牙设备

相关的问题报告：
https://github.com/alsa-project/alsa-lib/issues/159
https://github.com/alsa-project/alsa-utils/issues/101

## 解决方式
不需要使用UCM情况下，在alsa restore时，添加-U或者--no-ucm选项，报错消失。
