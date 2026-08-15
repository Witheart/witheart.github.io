---
title: "Intent 和 PendingIntent"
date: 2025-12-19
last_modified_at: 2025-12-19
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/intent-和-pendingintent/
toc: true
---

# Intent

## 语法结构解析

```java
Intent wakeIntent = new Intent(c, WakeReceiver.class);
```

### 1. **变量声明部分**

```java
Intent wakeIntent
```

- `Intent`: 类型，表示这是一个 Intent 对象
- `wakeIntent`: 变量名，遵循小驼峰命名法

### 2. **对象创建部分**

```java
new Intent(c, WakeReceiver.class)
```

- `new`: 关键字，创建新对象
- `Intent()`: 构造函数调用
- 这是 Intent 的一个**构造函数重载**

## 构造函数参数详解

### 参数 1: `c`

- 类型：`Context`
- 作用：提供应用程序的上下文信息
- 常用值：
  - `this` (在 Activity 中)
  - `getApplicationContext()`
  - `getBaseContext()`

### 参数 2: `WakeReceiver.class`

- 类型：`Class<?>`
- 作用：指定要启动的目标组件类
- `WakeReceiver.class` 是 **类字面量**，获取类的 Class 对象

## 实际应用场景

### 1. **启动 Activity**

```java
// 从当前 Activity 启动另一个 Activity
Intent intent = new Intent(MainActivity.this, SecondActivity.class);
startActivity(intent);
```

### 2. **启动 Service**

```java
// 启动服务
Intent serviceIntent = new Intent(this, MyService.class);
startService(serviceIntent);
```

### 3. **发送广播**（如示例中的用法）

```java
// 发送广播到指定的 BroadcastReceiver
Intent broadcastIntent = new Intent(this, MyReceiver.class);
sendBroadcast(broadcastIntent);
```

# PendingIntent

## 语法结构解析

```java
PendingIntent pi = PendingIntent.getBroadcast(c, 102, wakeIntent, PendingIntent.FLAG_IMMUTABLE);
```

## 1. **什么是 PendingIntent？**

PendingIntent 是 **"延迟的 Intent"**，它：

- 允许**其他应用**或**系统**在未来某个时间执行 Intent
- 保持创建应用的权限和身份执行
- 常用于通知、闹钟、定时任务等场景

## 2. **方法调用解析**

### `PendingIntent.getBroadcast()`

这是一个静态工厂方法，用于创建发送广播的 PendingIntent。

类似的工厂方法还有：

```java
PendingIntent.getActivity()      // 用于启动 Activity
PendingIntent.getService()       // 用于启动 Service
PendingIntent.getForegroundService() // 用于启动前台服务
PendingIntent.getBroadcast()    // 用于发送广播
```

## 3. **参数详解**

### 参数 1: `c` - Context

- 应用上下文
- 提供应用程序的身份信息

### 参数 2: `102` - requestCode

- 请求码，用于**唯一标识**这个 PendingIntent
- 当有多个 PendingIntent 时，通过此值区分
- 同一应用内应保持唯一
- 常用场景：
  ```java
  // 多个按钮点击
  PendingIntent.getBroadcast(context, 1, intent1, flags);  // 按钮1
  PendingIntent.getBroadcast(context, 2, intent2, flags);  // 按钮2
  ```

### 参数 3: `wakeIntent` - Intent

- 要执行的 Intent
- 这里包装了要发送的广播

### 参数 4: `PendingIntent.FLAG_IMMUTABLE` - 标志位

- **Android 12（API 31）及以上必须指定**
- 常用标志位：

| 标志位                | 说明                              | Android 版本   |
| --------------------- | --------------------------------- | -------------- |
| `FLAG_IMMUTABLE`      | **不可变**，接收方不能修改 Intent | API 31+ 推荐   |
| `FLAG_MUTABLE`        | **可变**，接收方可以修改 Intent   | 需要填充时使用 |
| `FLAG_UPDATE_CURRENT` | 如果已存在，更新其 extra 数据     | 通用           |
| `FLAG_CANCEL_CURRENT` | 先取消已存在的，再创建新的        | 通用           |
| `FLAG_NO_CREATE`      | 不创建新的，只返回已存在的        | 通用           |
| `FLAG_ONE_SHOT`       | 只能使用一次，执行后自动取消      | 通用           |

## 4. **实际应用场景**

### 场景 1：通知点击

```java
// 创建通知点击时要执行的 Intent
Intent notificationIntent = new Intent(this, DetailActivity.class);
PendingIntent pendingIntent = PendingIntent.getActivity(
    this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
);

// 设置到通知
NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "channel")
    .setContentTitle("新消息")
    .setContentText("点击查看详情")
    .setContentIntent(pendingIntent);  // 设置点击事件
```

### 场景 2：定时任务（AlarmManager）

```java
// 创建定时执行的广播
Intent alarmIntent = new Intent(this, AlarmReceiver.class);
PendingIntent pendingIntent = PendingIntent.getBroadcast(
    this, 0, alarmIntent, PendingIntent.FLAG_IMMUTABLE
);

// 设置闹钟
AlarmManager alarmManager = (AlarmManager) getSystemService(ALARM_SERVICE);
long triggerTime = System.currentTimeMillis() + 10 * 60 * 1000; // 10分钟后
alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
```

## 5. **PendingIntent vs Intent**

| 方面           | Intent           | PendingIntent                  |
| -------------- | ---------------- | ------------------------------ |
| **执行者身份** | 当前应用         | 创建者应用                     |
| **权限来源**   | 当前应用的权限   | 创建者应用的权限               |
| **执行时机**   | 立即执行         | 延迟执行                       |
| **控制权**     | 完全控制         | 委托给系统/其他应用            |
| **使用场景**   | 应用内跳转       | 跨应用/延迟操作                |
| **安全性**     | 较高（自己控制） | 需要额外保护（FLAG_IMMUTABLE） |

## 总结

PendingIntent 是 Android 中实现**延迟执行**和**跨应用通信**的重要机制。通过包装一个 Intent，并把自己的权限临时"借给"系统或其他应用，允许系统或其他应用在未来以创建应用的权限执行操作，是实现通知、定时任务、小部件等功能的核心组件。
