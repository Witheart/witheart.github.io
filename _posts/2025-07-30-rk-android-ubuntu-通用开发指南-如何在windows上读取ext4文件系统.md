---
title: "如何在Windows上读取ext4文件系统"
date: 2025-07-30
last_modified_at: 2025-07-30
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/如何在windows上读取ext4文件系统/
toc: true
---

使用软件​​DiskInternals Linux Reader，支持免费​​、只读访问 Ext4。（同目录下的Linux_Reader.exe）

## 下载地址
[https://www.diskinternals.com/linux-reader/](https://www.diskinternals.com/linux-reader/)

## 使用方式
- 打开软件
- 插入ext4格式的U盘，软件会自动识别，如下
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/如何在windows上读取ext4文件系统/PixPin_2025-07-30_18-31-44.png)

- 点击进入，选中要保存到windows的文件，然后点击Save
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/如何在windows上读取ext4文件系统/PixPin_2025-07-30_18-33-00.png)

- 选择Save Files，Next
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/如何在windows上读取ext4文件系统/PixPin_2025-07-30_18-33-47.png)

- 选择要保存到的目标文件夹，②中的选项分别是保持目录结构、保存元数据、跳过软链接的意思，按需选择，点击Next
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/如何在windows上读取ext4文件系统/PixPin_2025-07-30_18-34-47.png)

- 再次点击 Next 即可，文件开始复制到Windows主机
