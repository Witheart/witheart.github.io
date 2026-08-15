---
title: "如何验证 apk 签名状态"
date: 2025-08-13
last_modified_at: 2025-08-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/如何验证-apk-签名状态/
toc: true
---

Android 官方推荐使用`apksigner`来验证 APK 签名。该工具位于 Android SDK 的`build-tools`目录中。

## **步骤：**

1. **找到`apksigner`工具**  
   通常在 Android SDK 的`build-tools`目录下，例如：

   ```bash
   $ANDROID_SDK_ROOT/build-tools/<version>/apksigner

   比如
   "F:\Android\Sdk\build-tools\30.0.3\apksigner.bat"
   ```

   或者直接使用`apksigner`（如果已添加到`PATH`）。

2. **验证签名**  
   运行以下命令：
   ```bash
   apksigner verify --verbose termux.apk
   ```
   - **如果签名正确**，输出类似：
     ```
     Verifies
     Verified using v1 scheme (JAR signing): true
     Verified using v2 scheme (APK Signature Scheme v2): true
     Verified using v3 scheme (APK Signature Scheme v3): true
     Number of signers: 1
     ```
   - **如果签名无效**，会显示错误，例如：
     ```
     ERROR: JAR signature META-INF/MANIFEST.MF indicates the APK is not signed
     ```
