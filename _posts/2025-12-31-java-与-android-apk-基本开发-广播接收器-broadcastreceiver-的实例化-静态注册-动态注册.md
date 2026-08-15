---
title: "广播接收器(BroadcastReceiver)的实例化（静态注册 & 动态注册）"
date: 2025-12-31
last_modified_at: 2025-12-31
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/广播接收器-broadcastreceiver-的实例化-静态注册-动态注册/
toc: true
---

概要：本文介绍了在 Android 应用开发中如何实例化广播接收器（BroadcastReceiver），包括静态注册和动态注册方式的实现方法与使用场景，并配以示例说明其应用方式。


## 1. 广播接收器（BroadcastReceiver）简介  

BroadcastReceiver 是 Android 中用于接收广播消息的组件。广播可以是系统发出的（如电量变化、网络变化），也可以是应用自定义的广播。

---

## 2. BroadcastReceiver 的注册方式  

BroadcastReceiver 的注册方式分为两种：

- 静态注册（在 AndroidManifest.xml 中注册）
- 动态注册（在 Java 代码中使用 Context#registerReceiver 注册）

---

## 3. 静态注册  

### 3.1 特点  

- 在 AndroidManifest.xml 中声明
- 应用未启动时也能接收到广播（前提是系统广播且兼容性允许）
- 无需手动取消注册
- 适用于系统广播

### 3.2 示例代码  

#### 3.2.1 AndroidManifest.xml 中注册  

```xml
<receiver android:name=".MyBroadcastReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

#### 3.2.2 自定义 BroadcastReceiver 类  

```java
public class MyBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // 处理接收到的广播
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d("MyReceiver", "设备已启动");
        }
    }
}
```

---

## 4. 动态注册  

### 4.1 特点  

- 在 Java 代码中通过 registerReceiver 方法注册
- 只能在应用运行时接收广播
- 通常在 Activity 或 Service 中注册
- 需要在合适的生命周期中取消注册（如 onPause 或 onDestroy）

### 4.2 示例代码  

```java
public class MainActivity extends AppCompatActivity {

    private MyBroadcastReceiver receiver;

    @Override
    protected void onStart() {
        super.onStart();

        receiver = new MyBroadcastReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction("android.net.conn.CONNECTIVITY_CHANGE");

        registerReceiver(receiver, filter);
    }

    @Override
    protected void onStop() {
        super.onStop();
        unregisterReceiver(receiver);
    }

    public class MyBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.d("MyReceiver", "网络状态发生变化");
        }
    }
}
```

---

## 5. 注意事项  

- Android 8.0（API 级别 26）之后，静态注册接收器受到限制，不能接收大多数隐式广播。
- 动态注册更适用于应用内的通信或需要在特定时间段监听的广播事件。
- 不要忘记在不需要时注销动态注册的接收器，防止内存泄漏。

---

## 6. 总结  

BroadcastReceiver 是 Android 中用于处理广播事件的重要机制。通过静态注册可以接收系统广播，适合长期监听系统事件；通过动态注册可以灵活控制接收时机，适合应用内部通信或临时监听需求。开发者应根据实际需求选择合适的注册方式，并注意兼容性与性能问题。

---
