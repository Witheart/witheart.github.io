---
title: "应用关闭时接收广播(AlarmManager+显式 PendingIntent+静态 Receiver)"
date: 2025-12-31
last_modified_at: 2025-12-31
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/应用关闭时接收广播-alarmmanager-显式-pendingintent-静态-receiver/
toc: true
---

## 一、需求

写一个设置定时开关机的应用，需要实现：

- 应用已经被用户**手动划掉**
- 前台没有 Activity
- 但 **到达设定时间后，`BroadcastReceiver` 仍然能被触发**

代码如下：

```java
private void scheduleSleep() {
    int h = sp.getInt(KEY_SH, -1);
    int m = sp.getInt(KEY_SM, -1);
    if (h < 0 || m < 0) return;

    long t = nextTriggerMillis(h, m, System.currentTimeMillis());

    AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
    Intent i = new Intent(ctx, SleepReceiver.class);
    PendingIntent pi = PendingIntent.getBroadcast(
            ctx, 101, i, PendingIntent.FLAG_IMMUTABLE
    );

    am.cancel(pi);
    if (Build.VERSION.SDK_INT >= 23)
        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
    else
        am.setExact(AlarmManager.RTC_WAKEUP, t, pi);
}
```

**问题随之而来：**

- 这是不是系统广播？
- 为什么 App 被关闭还能收到？
- 和 `android:sharedUserId="android.uid.system"` 有关系吗？

---

## 二、先澄清一个核心误区：什么叫“应用被关闭”？

这是理解问题的关键。

### ❌ 常见误解

> 应用被关闭 = 应用不能再执行任何代码

### ✅ Android 中的真实情况

在 Android 系统里：

- “关闭应用”通常只是：

  - Activity 被销毁
  - 进程可能被回收

- **并不等于：**

  - App 被卸载
  - App 的组件不能被系统拉起

📌 **Android 是组件驱动模型，不是进程常驻模型**

---

## 三、这是不是系统广播？

**不是。**

上述代码发送的是一个**显式广播（Explicit Broadcast）**，即直接指定目标接收者的广播：

```java
Intent i = new Intent(ctx, SleepReceiver.class);
```

特点：

| 类型         | 说明                   |
| ------------ | ---------------------- |
| 广播类型     | 显式广播               |
| 接收对象     | 只指向 `SleepReceiver` |
| 是否对外     | 否                     |
| 是否系统广播 | 否                     |

系统广播通常是：

- `ACTION_BOOT_COMPLETED`
- `ACTION_TIME_TICK`
- `ACTION_SCREEN_ON`

---

## 四、真正的关键：AlarmManager + PendingIntent

### 1️⃣ AlarmManager 是系统级调度器

`AlarmManager` 并不是普通 API，它是：

- **system_server 中的系统服务**
- 用于在未来某个时间点触发行为
- 不依赖 App 是否在前台 / 是否存活

当你调用：

```java
am.setExactAndAllowWhileIdle(..., pi);
```

你实际上是在告诉系统：

> “到这个时间点，请你替我执行这个 PendingIntent。”

---

### 2️⃣ PendingIntent：系统持有的“执行令牌”

`PendingIntent` 的本质是：

> **一个由系统保存的、代表应用身份的执行授权**

```java
PendingIntent.getBroadcast(...)
```

关键特性：

- 即使 App 进程被杀
- 即使用户从最近任务划掉
- **PendingIntent 依然有效**
- 系统可以在需要时：

  - **创建 App 进程**
  - 直接调用目标组件

📌 **这正是“应用关闭仍能收到广播”的根本原因**

---

## 五、为什么 BroadcastReceiver 能拉起应用？

`BroadcastReceiver` 是 Android 的**特殊组件**：

- 不需要进程常驻
- 不需要 Activity 存在
- 系统允许：

  - 为了投递广播
  - **临时拉起应用进程**

流程如下：

```
Alarm 到期
   ↓
system_server 触发 PendingIntent
   ↓
AMS 创建 App 进程（如不存在）
   ↓
实例化 BroadcastReceiver
   ↓
回调 onReceive()
```

你并不是“偷偷在后台运行”，
而是**系统主动调用你的一次性组件**。

---

## 六、静态 Receiver 注册是前提条件

需要在 Manifest 中声明 `SleepReceiver`：

```xml
<receiver
    android:name=".SleepReceiver"
    android:exported="false" />
```

那么它具备以下特性：

- 无需 App 运行
- 无需动态注册
- 可被系统直接唤起

⚠️ 对比：

| 注册方式                     | App 被杀后能否收到 |
| ---------------------------- | ------------------ |
| 静态注册（Manifest）         | ✅ 可以            |
| 动态注册（registerReceiver） | ❌ 不行            |

---

## 七、`setExactAndAllowWhileIdle()` 的“强度”

```java
am.setExactAndAllowWhileIdle(...)
```

这意味着：

- 即使在：

  - Doze 模式
  - 深度休眠
  - 屏幕关闭

- 系统也会：

  - 唤醒设备
  - 执行 PendingIntent

📌 这是 **Android 提供的最强后台定时机制之一**。

---

## 八、和 `android:sharedUserId="android.uid.system"` 有关系吗？

### 结论：**基本没关系**

`sharedUserId="android.uid.system"` 的作用是：

- 与系统应用共享 Linux UID
- 获得 system 权限能力

但它**不会影响**：

| 行为                   | 是否相关 |
| ---------------------- | -------- |
| AlarmManager 是否触发  | ❌       |
| PendingIntent 是否生效 | ❌       |
| App 被杀后能否收广播   | ❌       |
| Receiver 是否被拉起    | ❌       |

📌 **普通第三方 App，只要代码一致，行为完全相同**
