---
title: "Android11 系统闹钟 AlarmManager"
date: 2025-11-24
last_modified_at: 2025-11-24
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/android11-系统闹钟-alarmmanager/
toc: true
---

概要：本文是关于 Android AlarmManager 的使用笔记，记录了精确与不精确闹钟的区别、权限配置、重复闹钟的处理方式，以及如何在系统重启后保持闹钟有效。适用于需要在应用外执行定时任务的场景。  


## 1. 参考链接  

https://developer.android.com/develop/background-work/services/alarms?hl=zh-cn

---

## 2. 闹钟功能概述  

- AlarmManager 用来在应用生命周期之外定时执行任务。
- 举例：每天定时启动服务下载天气。
- 特性总结如下：

  - 可根据设定时间/间隔触发 Intent。
  - 通常配合广播接收器使用，执行 Job/WorkRequest 等任务。
  - 在应用关闭甚至设备休眠时也能触发。
  - 避免使用持续服务或计时器，节省资源。

---

## 3. 闹钟类型  

分为两类：

- 不精确闹钟（节能/低频需求）
- 精确闹钟（对时效性要求高）

---

## 4. 不精确闹钟  

### 常见方法：

- set()  
- setInexactRepeating()  
- setAndAllowWhileIdle()  

> 注：这些方法不会早于设定时间触发。

### Android 12+ 的行为：

- 如果没有省电限制，系统会在设定时间后“1 小时内”触发。
- setWindow() 支持设定触发窗口，但也不会早于指定时间。
- windowLengthMillis 最低被限制为 600000（10 分钟），也就是说触发时间范围最小也是 10 分钟。

---

## 5. 精确闹钟  

适合执行对时间敏感的任务。以下是常用方法（按资源消耗从小到大排列）：

- setExact(): 基本精确，不保证在省电模式下执行
- setExactAndAllowWhileIdle(): 即使省电模式也会执行
- setAlarmClock(): 最关键的闹钟类型，用户可见性强，系统不会延迟

---

## 6. 权限配置  
https://developer.android.com/develop/background-work/services/alarms?hl=zh-cn#exact-permission-declare

### 6.1 Android 12+ 权限声明  

必须在 manifest 中添加：

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

### 6.2 Android 13+ 可以选择：

```xml
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
```

### 6.3 权限对比  

| 权限项               | 特点说明                         |
|----------------------|----------------------------------|
| USE_EXACT_ALARM      | 自动授予、不可撤销、场景受限     |
| SCHEDULE_EXACT_ALARM | 用户手动授予、适用更广泛场景     |

- 建议只在“确实需要精确计时”的场景使用上述权限。
- 应确认是否被用户撤销。

---

## 7. 重复闹钟注意事项  

- Android 4.4+ 所有重复闹钟都被强制为“不精确”。
- 设备关机后闹钟默认失效 → 需要监听 ACTION_BOOT_COMPLETED 重设闹钟。
- 为避免服务器压力，建议：

  - 加入触发时间“抖动”
  - 优先执行本地任务（不依赖网络）
  - 网络请求类任务尽量随机分布时间

---

## 8. 示例代码  

### 8.1 设置精确闹钟  

```java
Intent sleepIntent = new Intent(ctx, SleepReceiver.class);
PendingIntent sleepPi = PendingIntent.getBroadcast(ctx, 101, sleepIntent, PendingIntent.FLAG_IMMUTABLE);
am.cancel(sleepPi); // 先取消已有闹钟

long trigger = nextTriggerMillis(sh, sm, now); // 计算下一次触发时间
if (Build.VERSION.SDK_INT >= 23) {
    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, sleepPi);
} else {
    am.setExact(AlarmManager.RTC_WAKEUP, trigger, sleepPi);
}
```

---

### 8.2 触发后重设闹钟（适用于重复场景）  

```java
public void onReceive(Context c, Intent i) {
    // 执行动作
    ...

    // 重设闹钟
    if (repeat) {
        long next = nextTriggerMillis(h, m, System.currentTimeMillis());
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Intent sleepIntent = new Intent(c, SleepReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(c, 101, sleepIntent, PendingIntent.FLAG_IMMUTABLE);
        if (Build.VERSION.SDK_INT >= 23)
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, pi);
        else
            am.setExact(AlarmManager.RTC_WAKEUP, next, pi);
    }
}
```

---

### 8.3 系统重启后自动重设闹钟  

```java
@Override
public void onReceive(Context c, Intent i) {
    if (!Intent.ACTION_BOOT_COMPLETED.equals(i.getAction())) return;

    AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
    long t = nextTriggerMillis(sh, sm, System.currentTimeMillis());
    Intent sleepIntent = new Intent(c, SleepReceiver.class);
    PendingIntent spi = PendingIntent.getBroadcast(c, 101, sleepIntent, PendingIntent.FLAG_IMMUTABLE);
    if (Build.VERSION.SDK_INT >= 23)
        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, spi);
    else
        am.setExact(AlarmManager.RTC_WAKEUP, t, spi);
}
```
