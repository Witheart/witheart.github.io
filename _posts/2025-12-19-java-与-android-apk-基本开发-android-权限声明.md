---
title: "Android 权限声明"
date: 2025-12-19
last_modified_at: 2025-12-19
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/android-权限声明/
toc: true
---

Android权限声明是Android安全模型的核心组成部分，用于保护用户隐私和设备安全。


## **一、权限的作用**
权限控制应用访问受限数据（如联系人、位置）或执行受限操作（如拍照、访问网络）的能力。用户在安装或运行时决定是否授予权限。

---

## **二、权限的分类**

### **1. 安装时权限**
- **普通权限**：不会直接风险用户隐私，系统自动授予。
  - 示例：网络访问、震动、蓝牙。
  - 声明后无需运行时请求。

- **签名权限**：仅相同签名的应用可获取。
  - 用于同一开发者应用间安全共享数据。

### **2. 运行时权限（危险权限）**
- 涉及用户隐私或设备控制，需在运行时动态请求。
- 主要分组（授权一组中的一个，同组其他权限自动授予）：
  - **位置**：`ACCESS_FINE_LOCATION`、`ACCESS_COARSE_LOCATION`
  - **存储**：`READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE`（Android 13+细化）
  - **相机**：`CAMERA`
  - **通讯录**：`READ_CONTACTS`、`WRITE_CONTACTS`

---

## **三、权限声明与使用流程**

### **1. 在 `AndroidManifest.xml` 中声明**
```xml
<manifest>
    <!-- 普通权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- 危险权限 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <!-- Android 10+ 后台定位需额外声明 -->
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
</manifest>
```

### **2. 运行时请求权限（示例：相机权限）**
```kotlin
// 1. 检查是否已授权
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) 
    != PackageManager.PERMISSION_GRANTED) {
    
    // 2. 解释为何需要权限（可选）
    if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
        showExplanationDialog()
    }
    
    // 3. 请求权限
    requestPermissions(arrayOf(Manifest.permission.CAMERA), REQUEST_CODE_CAMERA)
} else {
    // 已授权，执行操作
    openCamera()
}

// 4. 处理授权结果回调
override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode == REQUEST_CODE_CAMERA && grantResults.isNotEmpty() 
        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        openCamera()
    } else {
        // 权限被拒绝
        showPermissionDeniedMessage()
    }
}
```

---

## **四、Android版本适配要点**

### **1. Android 6.0（API 23）+**
- 引入运行时权限，危险权限需动态请求。

### **2. Android 8.0（API 26）+**
- 修改电话权限分组，`READ_PHONE_STATE` 需单独请求。

### **3. Android 10（API 29）+**
- 分区存储，`READ_EXTERNAL_STORAGE` 作用域变化。
- 后台定位需额外声明 `ACCESS_BACKGROUND_LOCATION`。

### **4. Android 11（API 30）+**
- 一次性权限（应用下次启动需重新请求）。
- 自动重置未使用应用权限。
- 包可见性限制，需声明 `<queries>` 标签。

### **5. Android 13（API 33）+**
- 细化媒体权限：
  - `READ_MEDIA_IMAGES`
  - `READ_MEDIA_VIDEO`
  - `READ_MEDIA_AUDIO`
- 附近Wi-Fi设备权限：
  - `NEARBY_WIFI_DEVICES` 替代粗略位置获取Wi-Fi信息。

### **6. Android 14（API 34）+**
- 部分权限仅对系统应用开放。
- 更严格的后台数据访问限制。

建议定期查阅 https://developer.android.com/guide/topics/permissions/overview 获取最新指南。
