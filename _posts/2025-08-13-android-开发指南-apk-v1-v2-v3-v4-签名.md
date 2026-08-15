---
title: "apk v1 v2 v3 v4 签名"
date: 2025-08-13
last_modified_at: 2025-08-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/apk-v1-v2-v3-v4-签名/
toc: true
---

下面用简明扼要的方式介绍 Android APK 的四种签名方案（v1、v2、v3、v4）、它们的特点、兼容性与常用操作建议。


## 1 为什么需要 APK 签名
APK 签名用于保证应用来源与完整性：系统通过签名确认安装包确实由特定开发者签发且安装包内容未被篡改。不同签名方案在保护范围、速度和兼容性上有所不同。

## 2 各版本概要

- v1（JAR 签名）
  - 引入背景：Android 一开始采用的标准 Java JAR 签名（META-INF/*.SF、*.RSA 等）。
  - 工作方式：对 APK 中单个文件条目做散列并把签名写入 META-INF。
  - 优点：兼容所有 Android 版本（向后兼容）。
  - 缺点：不能保护 ZIP 元数据（central directory 等），容易被某些修改手段绕过；验证较慢。
  - 适用场景：必须支持非常旧的设备 (< Android 7.0) 时需要保留。

- v2（APK Signature Scheme v2）
  - 引入版本：Android 7.0（Nougat，API 24）。
  - 工作方式：将签名块（APK Signing Block）写入 ZIP 与 Central Directory 之间，签名覆盖 APK 的大部分字节范围，保护文件内容和大多数元数据。
  - 优点：更全面的完整性保护、验证更快、更难被篡改。
  - 缺点：不向下兼容到 < Android 7.0（这些系统仍只识别 v1）。
  - 适用场景：现代设备必用，推荐默认开启。

- v3（APK Signature Scheme v3）
  - 引入版本：Android 9（Pie，API 28）。
  - 新增特性：支持签名证书轮换（signing certificate rotation）、允许在 APK 中声明多签名者或旋转信息，增强对签名变更场景的支持（如迁移密钥或后续证书替换）。
  - 优点：对证书轮换和更复杂的签名需求提供原生支持；与 v2 相比增加签名灵活性与策略。
  - 适用场景：需要证书轮换、与 Play App Signing 联动或对签名管理有更高要求时启用；在 Android 9+ 上可用。

- v4（APK Signature Scheme v4）
  - 引入版本：Android 11（R，API 30）。
  - 目标与特性：作为附加签名方案，旨在加速某些安装/验证场景（例如更快速的完整性验证），并用于某些分发途径或优化流程（Play 或设备厂商实现中可能利用 v4 的加速特性）。
  - 优点：可缩短安装时的验证开销（针对支持的系统）。
  - 适用场景：当目标设备主要是 Android 11+ 且希望利用更快的安装验证时可启用；不是所有装置必需。

## 3 兼容性总结（常用参考）
- Android < 7.0：仅识别 v1。（rk3568 3588预装软件需针对v2签名做特殊处理，详见文章《3588 预装 APK 失败 —— APK 使用了 v2 签名没有 v1 签名（Failed collecting certificates）》）
- Android 7.0 — 8.x：识别 v2（也能识别 v1）。
- Android 9（及以上）：识别 v2、v3、v1（视系统实现）。
- Android 11（及以上）：可识别 v4，并向下兼容 v2/v3/v1（具体取决于设备实现）。
