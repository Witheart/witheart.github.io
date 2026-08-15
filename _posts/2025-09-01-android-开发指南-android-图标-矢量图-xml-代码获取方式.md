---
title: "Android 图标 矢量图 xml 代码获取方式"
date: 2025-09-01
last_modified_at: 2025-09-01
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-图标-矢量图-xml-代码获取方式/
toc: true
---

在看源码的过程中，发现有一些图标是这样引用的：
```xml
<com.android.settings.wifiADB
    android:key="wifi_adb"
    android:title="@string/wifi_adb_title"
    android:summary="@string/wifi_adb_summary"
    android:icon="@drawable/ic_homepage_wifiadb"
    android:order="11"/>
```

该图标文件指向了`packages/apps/Settings/res/drawable/ic_homepage_wifiadb.xml`

奇怪的是，这个文件是xml文件，而不是图片格式的文件，内容如下：
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="?attr/colorControlNormal">
  <path
      android:fillColor="@android:color/white"
      android:pathData="M12,6v3l4,-4 -4,-4v3c-4.42,0 -8,3.58 -8,8 0,1.57 0.46,3.03 1.24,4.26L6.7,14.8c-0.45,-0.83 -0.7,-1.79 -0.7,-2.8 0,-3.31 2.69,-6 6,-6zM18.76,7.74L17.3,9.2c0.44,0.84 0.7,1.79 0.7,2.8 0,3.31 -2.69,6 -6,6v-3l-4,4 4,4v-3c4.42,0 8,-3.58 8,-8 0,-1.57 -0.46,-3.03 -1.24,-4.26z"/>
</vector>

```

实际上，这是一种矢量图的描述方式，被称为VectorDrawable，android:pathData就定义了这个矢量图图标是怎么描绘的。

此类图标可以从这个网站获取[https://fonts.google.com/icons](https://fonts.google.com/icons)。
![alt text](/assets/images/android-开发指南/android-图标-矢量图-xml-代码获取方式/PixPin_2025-09-01_16-31-50.png)
