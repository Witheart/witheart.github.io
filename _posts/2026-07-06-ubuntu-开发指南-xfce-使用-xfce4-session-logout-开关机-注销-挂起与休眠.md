---
title: "XFCE 使用 xfce4-session-logout 开关机、注销、挂起与休眠"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-使用-xfce4-session-logout-开关机-注销-挂起与休眠/
toc: true
---

`xfce4-session-logout` 其实是调出那个**带选项的对话框**（注销/重启/关机/挂起都在里面），不是单独的重启命令。XFCE 下常用的几个开关机相关命令：

## xfce4-session-logout 带参数直奔主题
```bash
xfce4-session-logout --logout    # 注销
xfce4-session-logout --halt      # 关机
xfce4-session-logout --reboot    # 重启
xfce4-session-logout --suspend   # 挂起
xfce4-session-logout --hibernate # 休眠
```
加 `--fast` 可以跳过确认倒计时。

## 不用 XFCE 自带工具的通用方案（systemd）
```bash
systemctl poweroff   # 关机
systemctl reboot     # 重启
systemctl suspend    # 挂起
systemctl hibernate  # 休眠
```
这几个在任何桌面（包括 XFCE）都能用，前提是当前用户有权限（一般桌面会话里 polkit 会自动放行）。
