---
title: "使用 Fake Launcher 设置应用前台开机自启后，如何返回桌面"
date: 2024-12-31
last_modified_at: 2024-12-31
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/使用-fake-launcher-设置应用前台开机自启后-如何返回桌面/
toc: true
---

本文介绍如何在使用 Fake Launcher 设置应用开机前台自启后，通过代码修改实现返回系统默认桌面的功能。如果需要了解如何设置 Fake Launcher 前台开机自启，请参考《设置应用开机前台自启》。

## 修改历史
新增的内容将会在文章后面追加。
|时间|历史|
|-|-|
|20241225|创建了本文|
|20241231|新增了真正桌面启动延迟，启动时创建新任务栈，并延迟5s启动|

# 20241225
## 修改代码详解

以下是需要修改的文件及具体代码内容：

### 1. 修改 `ActivityRecord.java`

文件路径：`frameworks/base/services/core/java/com/android/server/wm/ActivityRecord.java`

<div STYLE="page-break-after: always;"></div>

#### **代码变更内容**

```diff
diff --git a/frameworks/base/services/core/java/com/android/server/wm/ActivityRecord.java b/frameworks/base/services/core/java/com/android/server/wm/ActivityRecord.java
index 812628d706..21d8bd4c9a 100755
--- a/frameworks/base/services/core/java/com/android/server/wm/ActivityRecord.java
+++ b/frameworks/base/services/core/java/com/android/server/wm/ActivityRecord.java
@@ -5428,7 +5428,31 @@ final class ActivityRecord extends WindowToken implements WindowManagerService.A
             } catch (RemoteException ex) {
                 Slog.e(TAG, "nodka Boot completed: SurfaceFlinger is dead!");
             }
-            Settings.System.putInt(mAtmService.mContext.getContentResolver(), "start_fake_launcher", 0);
+
+            // 如果是 Fake Launcher 启动完成，检查是否需要恢复默认桌面
+            if (shortComponentName != null && shortComponentName.contains(SystemProperties.get("persist.fake.launcher.name", ""))) {
+                Slog.i(TAG, "Fake launcher exited. Resetting to default home.");
+                
+                // 设置标志，表示 Fake Launcher 不再需要强制重启
+                Settings.System.putInt(mAtmService.mContext.getContentResolver(), "start_fake_launcher", 0);
+
+                // 启动默认桌面
+                Intent homeIntent = mAtmService.getHomeIntent();
+                mAtmService.startActivityAsUser(
+                    null, // IApplicationThread，当前线程为 null
+                    mAtmService.mContext.getPackageName(), // callingPackage，当前包名
+                    mAtmService.mContext.getAttributionTag(), // callingFeatureId，可为 null
+                    homeIntent, // 要启动的 Intent
+                    null, // resolvedType，可为 null
+                    null, // resultTo，可为 null
+                    null, // resultWho，可为 null
+                    0, // requestCode，通常为 0
+                    Intent.FLAG_ACTIVITY_NEW_TASK, // 启动标志
+                    null, // ProfilerInfo，可为 null
+                    null, // options，可为 null
+                    android.os.UserHandle.USER_CURRENT // 当前用户
+                );
+            }
         }
     }
```

<div STYLE="page-break-after: always;"></div>

#### **功能分析**

1. **判断是否为 Fake Launcher 启动完成**  
   ```java
   if (shortComponentName != null && shortComponentName.contains(SystemProperties.get("persist.fake.launcher.name", ""))) {
   ```
   - 检查当前运行的组件是否与 `persist.fake.launcher.name` 指定的 Fake Launcher 相匹配。
   - 如果匹配，说明 Fake Launcher 已启动完成。

2. **重置 `start_fake_launcher` 状态**  
   ```java
   Settings.System.putInt(mAtmService.mContext.getContentResolver(), "start_fake_launcher", 0);
   ```
   - 将 `start_fake_launcher` 的状态重置为 `0`，避免 Fake Launcher 被再次触发。

3. **启动系统默认桌面**  
   ```java
   Intent homeIntent = mAtmService.getHomeIntent();
   mAtmService.startActivityAsUser(...);
   ```
   - 构造启动默认桌面的 `Intent`，通过 `getHomeIntent()` 获取系统的 Launcher。
   - 使用 `startActivityAsUser` 启动桌面，切换用户界面到默认桌面。

4. **桌面不会覆盖 Fake Launcher 的原因**
   1. 任务栈隔离：
      - Fake Launcher 和桌面运行在不同的任务栈中。
      - 启动桌面只是将桌面放入后台（如果当前是空任务栈），而不会抢占 Fake Launcher 的界面。
   2. 缺少显式切换的标志：
      - startActivityAsUser() 的 Intent.FLAG_ACTIVITY_NEW_TASK 标志不会强制切换到桌面。
      - 如果没有显式调用 moveTaskToFront()，Fake Launcher 的界面仍然会保持在前台。

---

### 2. 修改 `RootWindowContainer.java`

文件路径：`frameworks/base/services/core/java/com/android/server/wm/RootWindowContainer.java`

<div STYLE="page-break-after: always;"></div>

#### **代码变更内容**

```diff
diff --git a/frameworks/base/services/core/java/com/android/server/wm/RootWindowContainer.java b/frameworks/base/services/core/java/com/android/server/wm/RootWindowContainer.java
index 909b6ace2a..5188d80757 100644
--- a/frameworks/base/services/core/java/com/android/server/wm/RootWindowContainer.java
+++ b/frameworks/base/services/core/java/com/android/server/wm/RootWindowContainer.java
@@ -1529,6 +1529,10 @@ class RootWindowContainer extends WindowContainer<DisplayContent>
                 if (launchIntent != null) {
                     Settings.System.putInt(mService.mContext.getContentResolver(), "start_fake_launcher", 1);
                     homeIntent = launchIntent;
+                } else if (Settings.System.getInt(mService.mContext.getContentResolver(), "start_fake_launcher", 0) == 0) {
+                    // 如果 fake launcher 未设置，或者用户退出了 fake launcher，恢复默认桌面
+                    homeIntent = mService.getHomeIntent();
+                    Slog.i(TAG, "nodka restoring default home launcher");
                 }
             }
             aInfo = resolveHomeActivity(userId, homeIntent);
```

#### **功能分析**

1. **设置 Fake Launcher 启动状态**  
   ```java
   if (launchIntent != null) {
       Settings.System.putInt(mService.mContext.getContentResolver(), "start_fake_launcher", 1);
       homeIntent = launchIntent;
   }
   ```
   - 如果 Fake Launcher 的启动 `Intent` 存在，将其赋值给 `homeIntent`。
   - 同时将 `start_fake_launcher` 设置为 `1`，标记 Fake Launcher 正在运行。

2. **恢复默认桌面**  
   ```java
   else if (Settings.System.getInt(mService.mContext.getContentResolver(), "start_fake_launcher", 0) == 0) {
       homeIntent = mService.getHomeIntent();
   }
   ```
   - 当 `start_fake_launcher` 状态为 `0`（即 Fake Launcher 已退出）时，将 `homeIntent` 设置为默认桌面。
   - 调用 `getHomeIntent()` 获取系统默认桌面并恢复。

---

## 退出 Fake Launcher 的完整逻辑

1. **启动 Fake Launcher 并设置状态**  
   - 当系统确定 Fake Launcher 需要启动时，将其启动 `Intent` 替换为 `homeIntent` 并设置 `start_fake_launcher=1`。

2. **Fake Launcher 启动完成后触发退出流程**  
   - 在 `ActivityRecord.java` 中，当 Fake Launcher 启动完成时：
     - 重置 `start_fake_launcher` 状态为 `0`。
     - 调用 `startActivityAsUser()` 启动默认桌面。

3. **恢复默认桌面**  
   - 在 `RootWindowContainer.java` 中检测到 `start_fake_launcher=0` 时，将 `homeIntent` 设置为默认桌面并切换。

---

## 总结

通过以上代码修改，可以实现以下功能：

1. **Fake Launcher 开机自启**：Fake Launcher 在开机时被系统启动并保持前台运行。
2. **退出 Fake Launcher**：当用户退出 Fake Launcher 后，系统自动切换回默认桌面。
3. **状态管理**：通过 `start_fake_launcher` 标志位管理 Fake Launcher 的状态，确保逻辑清晰且不冲突。

这套机制有效地解决了 Fake Launcher 和默认桌面切换的需求，同时保持系统启动逻辑的完整性。

# 20241231
在某些客户的应用场景中，使用 Fake Launcher 实现开机前台自启的功能时，可能会遇到以下问题：

- **问题描述**：应用开机前台自启成功，但在真正的桌面启动后，任务栈切换会导致应用被切换回桌面，影响用户体验。

---

## **解决方案**

### **1. 延迟切换真正桌面**
- **方法**：在 Fake Launcher 启动后，延时 5 秒再启动真正的桌面 Launcher。
- **目的**：确保 Fake Launcher 启动的应用在切换到真正桌面时不会受到干扰。

### **2. 修改桌面启动意图**
- **操作**：在真正桌面 Launcher 的启动意图中，添加以下标志位：
  ```java
  Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK
  ```
- **作用**：
  - **`FLAG_ACTIVITY_NEW_TASK`**：启动桌面时创建一个新的任务栈。
  - **`FLAG_ACTIVITY_CLEAR_TASK`**：清除桌面任务栈中已有的活动，避免干扰其他任务栈（如 Fake Launcher 启动的应用）。

---

## **代码实现**

### **修改文件**
`frameworks/base/services/core/java/com/android/server/wm/ActivityTaskManagerService.java`

### **核心代码片段**

```java
...
} catch (RemoteException ex) {
    Slog.e(TAG, "nodka Boot completed: SurfaceFlinger is dead!");
}
// 设置标志，表示 Fake Launcher 不再需要强制重启
Settings.System.putInt(mAtmService.mContext.getContentResolver(), "start_fake_launcher", 0);

// 如果是 Fake Launcher 启动完成，检查是否需要恢复默认桌面
if (shortComponentName != null && shortComponentName.contains(SystemProperties.get("persist.fake.launcher.name", ""))) {
    Slog.i(TAG, "Fake launcher exited. Resetting to default home.");

    // 延迟切换到真正桌面
    new Handler(Looper.getMainLooper()).postDelayed(() -> {
        // 获取真正桌面的 Intent
        Intent homeIntent = mAtmService.getHomeIntent();
        homeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        // 启动真正桌面
        mAtmService.startActivityAsUser(
            null, // IApplicationThread，当前线程为 null
            mAtmService.mContext.getPackageName(), // callingPackage，当前包名
            mAtmService.mContext.getAttributionTag(), // callingFeatureId，可为 null
            homeIntent, // 要启动的 Intent
            null, // resolvedType，可为 null
            null, // resultTo，可为 null
            null, // resultWho，可为 null
            0, // requestCode，通常为 0
            Intent.FLAG_ACTIVITY_NEW_TASK, // 启动标志
            null, // ProfilerInfo，可为 null
            null, // options，可为 null
            android.os.UserHandle.USER_CURRENT // 当前用户
        );
    }, 5000); // 延迟 5 秒启动真正桌面
}
...
```

---

## **代码解释**

1. **Fake Launcher 标志位重置**
   ```java
   Settings.System.putInt(mAtmService.mContext.getContentResolver(), "start_fake_launcher", 0);
   ```
   - 在 Fake Launcher 启动完成后，重置标志位，避免重复触发。

2. **延迟切换到真正桌面**
   ```java
   new Handler(Looper.getMainLooper()).postDelayed(() -> { ... }, 5000);
   ```
   - 使用 `Handler` 延迟 5 秒后启动真正的桌面 Launcher，确保 Fake Launcher 启动的应用有足够时间完成初始化。

3. **启动真正桌面的 Intent 配置**
   ```java
   homeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
   ```
   - **`FLAG_ACTIVITY_NEW_TASK`**：启动桌面时创建一个新任务栈。
   - **`FLAG_ACTIVITY_CLEAR_TASK`**：清除桌面任务栈中已有的活动，防止影响 Fake Launcher 启动的应用。
---

### **总结**

通过上述修改，解决了应用开机前台自启后被真正桌面切换的问题，具体优化点如下：

1. **延时启动桌面**：通过延迟启动真正桌面，避免应用初始化阶段被打断。
2. **任务栈隔离**：通过 `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK` 确保桌面任务栈独立，避免干扰当前任务栈。
