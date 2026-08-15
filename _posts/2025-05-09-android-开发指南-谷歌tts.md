---
title: "谷歌TTS"
date: 2025-05-09
last_modified_at: 2025-05-09
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/谷歌tts/
toc: true
---

谷歌TTS指的应该是安卓设置下，无障碍，文字转语音TTS

需要安装对应的apk

内置英文语音包，如果想要其他语音包需要手动下载

下载时需设备联网，且有GMS功能，才能通过谷歌服务进行下载

如果无GMS、无网络，可在其他设备上进行下载，下载后的语音包会放置在
/data/user_de/0/com.google.android.tts/files/superpacks

将这个语音包拷贝出来，放到对应的目录下也可以使用
adb push "F:\0014_Android_develop\QY3568\250508-googleTTS\rk3568\superpacks" "/data/user_de/0/com.google.android.tts/files/"
![alt text](/assets/images/android-开发指南/谷歌tts/image.png)

[谷歌TTS引擎+中文语音包：安卓12的最佳语音解决方案](https://blog.csdn.net/gitblog_09702/article/details/141978648)
gitcode: [谷歌TTS引擎+中文语音包最新版20240205-02支持安卓12](https://gitcode.com/open-source-toolkit/7f1c1)
[Google TTS添加中文语音包](https://blog.csdn.net/u013492354/article/details/132860460)
[国产安卓使用谷歌tts（含鸿蒙）](http://www.qtcn.org/bbs/read-htm-tid-91859-page-e.html)
[忆信 - 个人博客 内置Google TTS](http://www.chyitech.com/androidq/tts.html)

apk下载（Google Play）[Speech Recognition & Synthesis](https://play.google.com/store/apps/details?id=com.google.android.tts&hl=ja)
[Android 无障碍功能帮助 文字转语音输出](https://support.google.com/accessibility/android/answer/6006983?hl=zh-Hans)
[Google Play Apk 提取，下载安卓安装包（三种方法）](https://www.bilibili.com/opus/893439290204225561)
