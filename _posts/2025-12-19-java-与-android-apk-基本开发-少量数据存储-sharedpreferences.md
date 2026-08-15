---
title: "少量数据存储——SharedPreferences"
date: 2025-12-19
last_modified_at: 2025-12-19
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/少量数据存储-sharedpreferences/
toc: true
---

## 一、核心使用

### 1. 获取实例
```java
SharedPreferences prefs = getSharedPreferences("my_prefs", Context.MODE_PRIVATE);
```

### 2. 写入数据
```java
SharedPreferences.Editor editor = prefs.edit();
editor.putString("name", "张三");
editor.putInt("age", 20);
editor.putBoolean("isLogin", true);
editor.apply();  // 异步保存
```

### 3. 读取数据
```java
String name = prefs.getString("name", "默认名");
int age = prefs.getInt("age", 0);
boolean isLogin = prefs.getBoolean("isLogin", false);
```

### 4. 删除数据
```java
SharedPreferences.Editor editor = prefs.edit();
editor.remove("name");  // 删除单个
// editor.clear();     // 清空所有
editor.apply();
```

## 二、实用示例

### 登录状态管理
```java
public class AuthManager {
    private SharedPreferences prefs;
    
    public AuthManager(Context context) {
        prefs = context.getSharedPreferences("user_info", Context.MODE_PRIVATE);
    }
    
    // 保存用户信息
    public void saveUserInfo(String token, String userId) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("token", token);
        editor.putString("userId", userId);
        editor.putBoolean("isLoggedIn", true);
        editor.apply();
    }
    
    // 检查登录状态
    public boolean isLoggedIn() {
        return prefs.getBoolean("isLoggedIn", false);
    }
    
    // 获取用户ID
    public String getUserId() {
        return prefs.getString("userId", "");
    }
    
    // 退出登录
    public void logout() {
        SharedPreferences.Editor editor = prefs.edit();
        editor.clear();
        editor.apply();
    }
}
```

## 三、注意事项
1. **Context 获取**：确保在 Activity 或 Service 中使用正确的 Context
```java
    public SleepWakeSchedulerManager(Context context) {
        this.ctx = context.getApplicationContext();
        this.sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
```
（通过context.getApplicationContext()获取应用的全局上下文（这样做是为了避免内存泄漏，因为ApplicationContext的生命周期与应用相同，而不是与某个Activity相同））
1. **异步保存**：优先使用 `apply()` 而不是 `commit()`
2. **数据安全**：不要存储敏感信息（密码、token 等）
3. **数据量**：只适合存储少量简单数据
