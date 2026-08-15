---
title: "3568 Android 4K显示"
date: 2026-03-13
last_modified_at: 2026-03-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-4k显示/
toc: true
---

## HDMI
### 系统下设置
设置->显示->HDMI->分辨率设置中可以调节分辨率

### 命令设置
可以使用以下命令手动设置 4K 分辨率后,重新插拔 HDMI 线
```bash
# 设置4k60：
setprop persist.vendor.resolution.main 3840x2160@60
# 每次设置完更新sys.display.timeline(每次加1)使分辨率生效
setprop vendor.display.timeline 1
```


## 辅助命令
确认内核的 HDMI 分辨率列表中是否包含 4K 分辨率
```bash
cat /sys/class/drm/card0-HDMI-A-1/modes
```
