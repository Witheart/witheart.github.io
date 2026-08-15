---
title: "apk未初始化静态上下文context导致Toast.makeText触发npe，应用闪退"
date: 2025-08-02
last_modified_at: 2025-08-02
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/apk未初始化静态上下文context导致toast-maketext触发npe-应用闪退/
toc: true
---

## 问题背景
在Rockchip平台开发过程中，发现一个奇怪现象：
- ✅ **手动安装**：通过ADB或U盘安装APK运行完全正常
- ❌ **预装方式**：编译进系统镜像后首次运行立即崩溃

崩溃日志明确指向NullPointerException：
```java
Caused by: java.lang.NullPointerException: 
Attempt to invoke virtual method 'java.lang.String android.content.Context.getPackageName()' 
on a null object reference
at android.widget.Toast.<init>(Toast.java:167)
at com.hc.android_test.ReadSnMac.ReadMac1(ReadSnMac.java:38)
```

## 根本原因分析
### 问题代码片段
```java
public class ReadSnMac {
    private static Context mContext; // 声明但未初始化的静态变量
    
    static String ReadMac1() {
        try {
            // ...业务逻辑...
        } catch (Exception e) {
            // 使用未初始化的静态Context
            Toast.makeText(mContext, "MAC地址无法读取", Toast.LENGTH_SHORT).show();
        }
    }
}
```

### 关键问题：静态Context未初始化
1. **变量声明缺陷**：
   - `private static Context mContext`仅声明而未赋初值（默认null）
   - 静态变量生命周期与应用进程相同，需显式初始化

2. **初始化机制缺失**：
   - 虽然存在构造方法`public ReadSnMac(Context context)` 
   - 但从未在代码中被调用执行

## 最佳解决方案：传递应用上下文

#### 1. 修改ReadSnMac类
```diff
diff --git a/app/src/main/java/com/hc/android_test/ReadSnMac.java b/app/src/main/java/com/hc/android_test/ReadSnMac.java
index d59004a..b40a923 100644
--- a/app/src/main/java/com/hc/android_test/ReadSnMac.java
+++ b/app/src/main/java/com/hc/android_test/ReadSnMac.java
@@ -20,7 +20,7 @@ public class ReadSnMac {
         return sn;
     }
 
-    static String ReadMac1() {
+    static String ReadMac1(Context context) {
         String mac1 = null;
         try {
             String read_mac1 = execRootCmd("i2ctransfer -y -f 5 w2@0x57 0x00 0x00 r6");
@@ -35,11 +35,11 @@ public class ReadSnMac {
             mac1 = kk2;
 
         }catch (Exception e){
-            Toast.makeText(mContext,"MAC地址无法读取和写入",Toast.LENGTH_SHORT).show();
+            Toast.makeText(context,"MAC地址无法读取和写入",Toast.LENGTH_SHORT).show();
         }
         return mac1;
     }
-    static String ReadMac2() {
+    static String ReadMac2(Context context) {
         String mac2 = null;
         try {
             String read_mac2 = execRootCmd("i2ctransfer -y -f 5 w2@0x57 0x00 0x10 r6");
@@ -52,7 +52,7 @@ public class ReadSnMac {
             Log.d(TAG,kk3);
             mac2 = kk3;
         }catch (Exception e){
-            Toast.makeText(mContext,"MAC地址无法读取和写入",Toast.LENGTH_SHORT).show();
+            Toast.makeText(context,"MAC地址无法读取和写入",Toast.LENGTH_SHORT).show();
         }
         return mac2;
     }
diff --git a/app/src/main/java/com/hc/android_test/TestActivity.java b/app/src/main/java/com/hc/android_test/TestActivity.java
index 5449f4b..328e4e8 100644
--- a/app/src/main/java/com/hc/android_test/TestActivity.java
+++ b/app/src/main/java/com/hc/android_test/TestActivity.java
@@ -472,10 +472,10 @@ public class TestActivity extends AppCompatActivity {
         sn = ReadSnMac.ReadSn();
         met_sn.setText(sn);
 
-        mac = ReadSnMac.ReadMac1();
+        mac = ReadSnMac.ReadMac1(this);
         met_mac.setText(mac);
 
-        mac2 = ReadSnMac.ReadMac2();
+        mac2 = ReadSnMac.ReadMac2(this);
         met_mac2.setText(mac2);
     }
     private void func_com(int num,String dev){

```
