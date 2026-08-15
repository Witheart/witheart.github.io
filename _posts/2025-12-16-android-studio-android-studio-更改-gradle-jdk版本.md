---
title: "Android Studio 更改 gradle JDK版本"
date: 2025-12-16
last_modified_at: 2025-12-16
categories:
  - "Android Studio"
tags:
  - "Android Studio"
permalink: /android-studio/android-studio-更改-gradle-jdk版本/
toc: true
---

- sync时，出现如下报错
```
Your build is currently configured to use incompatible Java 21.0.3 and Gradle 7.4. Cannot sync the project.

We recommend upgrading to Gradle version 8.9.

The minimum compatible Gradle version is 8.5.

The maximum compatible Gradle JVM version is 17.
```

可修改gradle版本或者修改java版本，此处选择降级java版本，方式如下：

- File -> Settings...
![alt text](/assets/images/android-studio/android-studio-更改-gradle-jdk版本/PixPin_2025-12-16_17-12-05.png)

- 搜索gradle -> gradle -> 更改JDK版本
![alt text](/assets/images/android-studio/android-studio-更改-gradle-jdk版本/PixPin_2025-12-16_17-11-29.png)
