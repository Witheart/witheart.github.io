---
title: "rk 预装apk失败 —— apk无签名"
date: 2025-09-16
last_modified_at: 2025-09-16
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-预装apk失败-apk无签名/
toc: true
---

## 问题描述
3568 预装apk（使用device/rockchip/rkxxxx/preinstall_del目录），编译无报错，但烧录系统后发现没有预装成功。


## 问题原因
参考文章《如何验证 apk 签名状态》，验证apk签名状态，输出如下
```cmd
"F:\Android\Sdk\build-tools\30.0.3\apksigner.bat" verify --verbose  ReaderDemo-release-v1.14.apk

DOES NOT VERIFY
ERROR: Missing META-INF/MANIFEST.MF
```
缺少 META-INF/MANIFEST.MF，意味着这个 APK 文件没有通过签名验证。（META-INF/MANIFEST.MF文件是 APK 签名过程中​​自动生成​​的核心文件之一。它包含了 APK 包中所有其他文件的哈希值（摘要）列表。）

## 解决方式
在Android.mk中，使用系统签名（LOCAL_CERTIFICATE := platform）。
