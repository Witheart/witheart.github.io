---
title: "开发指南：实现 APK 自动安装与打开"
date: 2025-07-03
last_modified_at: 2025-07-03
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/开发指南-实现-apk-自动安装与打开/
toc: true
---

## **目的**
本指南旨在指导开发者修改 Android 11 SDK 源码，实现以下功能：

1. **点击 APK 后自动安装**：通过修改 `PackageInstallerActivity` 类，在安装弹窗显示后默认自动点击“安装”按钮。
2. **安装完成后自动打开**：通过修改 `InstallSuccess` 类，在安装完成的弹窗显示后自动触发“打开”按钮的点击逻辑。

## 新增：已知问题
### 在添加了gms功能的Android SDK中不生效（250703）
- 原因：gms替换了原生AOSP安装器，代码修改是针对原生的安装器
  - 原生AOSP安装器：com.android.packageinstaller
  - gms安装器：com.google.android.packageinstaller
具体可在logcat中看到：
```logcat
cmp=com.google.android.packageinstaller/com.android.packageinstaller.InstallStart
cmp=com.google.android.packageinstaller/com.android.packageinstaller.PackageInstallerActivity
```
目前没有gms安装器的解决方案
---

## **环境说明**
- **Android 版本**：Android 11
- **需修改的源码位置**：
  - 点击 apk 后，自动安装：  
    `frameworks/base/packages/PackageInstaller/src/com/android/packageinstaller/PackageInstallerActivity.java`
  - 安装完成后自动打开：  
    `frameworks/base/packages/PackageInstaller/src/com/android/packageinstaller/InstallSuccess.java`

---

## **功能一：自动点击“安装”按钮**

### **实现方式**
修改 `PackageInstallerActivity` 类中的 `bindUi()` 方法，模拟用户点击安装弹窗中的“安装”按钮。

---

### **代码实现**

在 `bindUi()` 方法中，通过以下步骤实现自动点击“安装”按钮的功能：

```java
private void bindUi() {
    mAlert.setIcon(mAppSnippet.icon);
    mAlert.setTitle(mAppSnippet.label);
    mAlert.setView(R.layout.install_content_view);
    mAlert.setButton(DialogInterface.BUTTON_POSITIVE, getString(R.string.install),
            (ignored, ignored2) -> {
                if (mOk.isEnabled()) {
                    if (mSessionId != -1) {
                        mInstaller.setPermissionsResult(mSessionId, true);
                        finish();
                    } else {
                        startInstall();
                    }
                }
            }, null);
    mAlert.setButton(DialogInterface.BUTTON_NEGATIVE, getString(R.string.cancel),
            (ignored, ignored2) -> {
                // Cancel and finish
                setResult(RESULT_CANCELED);
                if (mSessionId != -1) {
                    mInstaller.setPermissionsResult(mSessionId, false);
                }
                finish();
            }, null);
    setupAlert();

    mOk = mAlert.getButton(DialogInterface.BUTTON_POSITIVE);
    // mOk.setEnabled(false);
    mOk.setEnabled(true);

    // 模拟点击“安装”按钮
    mOk.performClick();

    if (!mOk.isInTouchMode()) {
        mAlert.getButton(DialogInterface.BUTTON_NEGATIVE).requestFocus();
    }
}
```

---

### **关键逻辑说明**
1. **获取并启用“安装”按钮**：  
   通过 `mAlert.getButton(DialogInterface.BUTTON_POSITIVE)` 获取“安装”按钮，并确保其状态为启用`mOk.setEnabled(true)`。

2. **模拟点击“安装”按钮**：  
   使用 `mOk.performClick()` 方法模拟用户点击“安装”按钮，从而触发安装逻辑。

---


## **功能二：安装完成后自动打开应用**

### **实现方式**
修改 `InstallSuccess` 类中的 `bindUi()` 方法，模拟触发“打开”按钮的点击逻辑。

---

### **代码实现**

以下为修改后的 `bindUi()` 方法，实现自动触发“打开”按钮的逻辑：

```java
private void bindUi() {
    if (mAppSnippet == null) {
        return;
    }

    mAlert.setIcon(mAppSnippet.icon);
    mAlert.setTitle(mAppSnippet.label);
    mAlert.setView(R.layout.install_content_view);
    mAlert.setButton(DialogInterface.BUTTON_POSITIVE, getString(R.string.launch), null,
            null);
    mAlert.setButton(DialogInterface.BUTTON_NEGATIVE, getString(R.string.done),
            (ignored, ignored2) -> {
                if (mAppPackageName != null) {
                    Log.i(LOG_TAG, "Finished installing " + mAppPackageName);
                }
                finish();
            }, null);
    
    setupAlert();
    requireViewById(R.id.install_success).setVisibility(View.VISIBLE);

    // 启用或禁用“打开”按钮
    boolean enabled = false;
    if (mLaunchIntent != null) {
        List<ResolveInfo> list = getPackageManager().queryIntentActivities(mLaunchIntent, 0);
        if (list != null && list.size() > 0) {
            enabled = true;
        }
    }

    Button launchButton = mAlert.getButton(DialogInterface.BUTTON_POSITIVE);
    if (enabled) {
        launchButton.setOnClickListener(view -> {
            try {
                startActivity(mLaunchIntent);
            } catch (ActivityNotFoundException | SecurityException e) {
                Log.e(LOG_TAG, "Could not start activity", e);
            }
            finish();
        });

        // 自动触发“打开”操作
        launchButton.post(() -> launchButton.performClick());
    } else {
        launchButton.setEnabled(false);
    }
}
```

---

### **关键逻辑说明**
1. **获取启动意图**：  
   使用 `getPackageManager().getLaunchIntentForPackage(mAppPackageName)` 获取目标应用的启动意图。

2. **判断启动意图有效性**：  
   如果 `mLaunchIntent` 为 `null` 或未找到匹配的 Activity，则禁用“打开”按钮。

3. **模拟点击“打开”按钮**：  
   使用 `launchButton.post(() -> launchButton.performClick())` 确保在 UI 渲染完成后模拟点击。

---
