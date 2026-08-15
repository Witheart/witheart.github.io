---
title: "sharedUserId 和 android.uid.system"
date: 2025-12-17
last_modified_at: 2025-12-17
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/shareduserid-和-android-uid-system/
toc: true
---

- AndroidManifest.xml中，有如下声明
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:sharedUserId="android.uid.system">
```
`android::sharedUserId="android.uid.system"` 是一个重要的 Android 系统属性，它表示应用要以**系统级特权**运行。

## 具体含义：

### 1. **共享用户ID（Shared User ID）**
- 允许多个应用共享同一个 Linux 用户 ID
- 这些应用可以互相访问彼此的数据，运行在同一个进程中
- 类似 Linux 系统中同一个用户的多个进程

### 2. **android.uid.system**
- 这是 Android 系统保留的特殊用户 ID
- 值为 1000，是系统进程（如 system_server）的用户 ID
- 拥有最高级别的系统权限

## 这带来的能力包括：

### 系统级权限：
- **访问受保护的 API**：调用普通应用无法调用的隐藏 API
- **修改系统设置**：直接读写系统数据库（如 Settings.System）
- **静默安装/卸载应用**：无需用户确认
- **关机/重启**：调用系统关机方法
- **访问硬件**：直接控制某些硬件设备
- **权限绕过**：某些权限检查会被绕过

## 使用场景：

### 1. **系统应用**
- 设备制造商预装的应用
- 系统服务（如设置、系统UI）
- 底层硬件控制应用

### 2. **特殊功能应用**
- 工厂测试程序
- 设备管理工具
- 定制ROM的增强功能
