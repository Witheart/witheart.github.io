---
title: "apk自启动并保活指南"
date: 2024-12-24
last_modified_at: 2024-12-24
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/apk自启动并保活指南/
toc: true
---

**文件路径**: `device/rockchip/rk356x/device.mk`

**添加属性**:
- 在 `PRODUCT_PROPERTY_OVERRIDES` 中添加以下属性（包名请使用具体的包名）：
  ```mk
  persist.fake.launcher.name = com.kgbs.gatecheck
  ```
![alt text](/assets/images/android-开发指南/apk自启动并保活指南/image.png)
**效果**:
- 应用会在设备开机时自动启动。
- 用户无法退出应用返回桌面。
- 若尝试退出，应用将再次自动启动。
