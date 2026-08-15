---
title: "Android 音频框架"
date: 2025-12-25
last_modified_at: 2025-12-25
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-音频框架/
toc: true
---

概要：本文介绍了 Android 音频框架的整体架构与各个组成部分的职责和作用，包括应用框架、JNI、原生框架、Binder IPC、媒体服务器、HAL 以及内核驱动程序等模块。


## 来源
https://source.android.com/docs/core/audio?hl=zh-cn

![alt text](/assets/images/android-开发指南/android-音频框架/image.png)

## 1. 应用框架  

应用框架包含应用代码，该代码使用 `android.media` API 与音频硬件进行交互。在内部，此代码会调用相应的 JNI 粘合类来访问与音频硬件互动的原生代码。

---

## 2. JNI  

与 `android.media` 关联的 JNI 代码会调用较低级别的原生代码来访问音频硬件。JNI 位于以下目录中：

- `frameworks/base/core/jni/`
- `frameworks/base/media/jni/`

---

## 3. 原生框架  

原生框架提供相当于 `android.media` 软件包的原生软件包，它调用 Binder IPC 代理来访问媒体服务器的音频专属服务。原生框架代码位于：

- `frameworks/av/media/libmedia`

---

## 4. Binder IPC  

Binder IPC 代理用于促进跨越进程边界的通信。代理位于：

- `frameworks/av/media/libmedia`

通常以字母 “I” 开头命名。

---

## 5. 媒体服务器  

媒体服务器包含音频服务，这些音频服务是与您的 HAL 实现进行交互的实际代码。媒体服务器代码位于：

- `frameworks/av/services/audioflinger`

---

## 6. HAL（硬件抽象层）  

HAL 定义了音频服务会调用且您必须实现才能使音频硬件正常运行的标准接口。

- 如需了解详情，请参阅音频 HAL 接口。
- 查看相应 HAL 版本目录中的 `*.hal` 文件及其注释。

---

## 7. 内核驱动程序  

音频驱动程序用于同您的硬件和 HAL 实现进行交互。可以使用以下方案之一：

- 高级 Linux 声音架构（ALSA）
- 开放声音系统（OSS）
- 自定义驱动程序

> HAL 与驱动程序无关。

📌 注意：  
如果您使用的是 ALSA，建议将 `external/tinyalsa` 用于驱动程序的用户部分，因为它具有兼容的许可（标准的用户模式库已获得 GPL 许可）。
