---
title: "RK Android OTA U盘升级指南"
date: 2025-01-21
last_modified_at: 2025-01-21
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/rk-android-ota-u盘升级指南/
toc: true
---

本指南用于指导如何使用`update.zip`进行 U盘 OTA 升级。

具体的`update.zip`编译方式请看`《RK Android OTA U盘升级包编译指南》`。


## 操作
- 将 update.zip 放置到指定位置
    - 可以放置在以下任一位置：

    1. **U盘根目录**
    2. **SD卡根目录**
    3. **/data/media/0/ 目录**

- 插入 U盘/SD卡，耐心等待 1 分钟左右（请使用普通USB端口，避免因使用OTG USB端口而导致的升级失败，因为在 recovery 模式下可能未配置为 host 模式）

- 系统会自动检测升级包，并弹出升级对话框
![alt text](/assets/images/android-sdk编译指南/rk-android-ota-u盘升级指南/image.png)

- 点击安装，耐心等待即可，安装过程不要断电，直到重启成功进入系统界面
![alt text](/assets/images/android-sdk编译指南/rk-android-ota-u盘升级指南/image-1.png)
![alt text](/assets/images/android-sdk编译指南/rk-android-ota-u盘升级指南/image-2.png)

- 重启中
![alt text](/assets/images/android-sdk编译指南/rk-android-ota-u盘升级指南/image-3.png)


- 升级成功
![alt text](/assets/images/android-sdk编译指南/rk-android-ota-u盘升级指南/image-4.png)
