---
title: "AndroidManifest 中声明广播接收器 receive"
date: 2025-12-19
last_modified_at: 2025-12-19
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/androidmanifest-中声明广播接收器-receive/
toc: true
---

## 广播接收器（BroadcastReceiver）介绍

**BroadcastReceiver** 是 Android 四大组件之一，用于在应用之间或系统与应用之间接收广播消息。它可以响应系统事件（如开机完成、网络变化、电量低等）或应用自定义事件。

---

## 示例详解

- 在 AndroidManifest.xml 的<application></application>中声明。

### 1. 自定义广播接收器

```xml
<receiver
    android:name="com.android.api.sleepwake.SleepReceiver"
    android:exported="false" />
<receiver
    android:name="com.android.api.sleepwake.WakeReceiver"
    android:exported="false" />
```

**特点：**

- **`exported="false"`**：表示此接收器**只能接收来自本应用**的广播
- 没有 `<intent-filter>`：通常通过**代码动态注册**，或接收**显式 Intent**（指定了完整类名）
- 更安全，外部应用无法触发

**使用场景：**

- 应用内部组件间通信
- 通过代码注册，在特定生命周期内接收广播

### 2. 带过滤器的广播接收器

```xml
<receiver
    android:name="com.android.api.sleepwake.SleepWakeBootReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

**特点：**

- **`exported="true"`**：允许接收**系统或其他应用**的广播
- 有 `<intent-filter>`：监听特定的广播动作
- 监听系统开机完成事件

---

## Intent-filter 详解

### 作用

`<intent-filter>` 声明了接收器感兴趣的广播类型。

### 常见系统广播 Action

```xml
<!-- 开机完成 -->
<action android:name="android.intent.action.BOOT_COMPLETED" />

<!-- 电量低 -->
<action android:name="android.intent.action.BATTERY_LOW" />

<!-- 充电状态变化 -->
<action android:name="android.intent.action.ACTION_POWER_CONNECTED" />

<!-- 网络状态变化 -->
<action android:name="android.net.conn.CONNECTIVITY_CHANGE" />

<!-- 时区变化 -->
<action android:name="android.intent.action.TIMEZONE_CHANGED" />

<!-- 屏幕开启/关闭 -->
<action android:name="android.intent.action.SCREEN_ON" />
<action android:name="android.intent.action.SCREEN_OFF" />
```
