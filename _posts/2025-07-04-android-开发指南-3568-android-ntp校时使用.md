---
title: "3568 Android ntp校时使用"
date: 2025-07-04
last_modified_at: 2025-07-04
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-ntp校时使用/
toc: true
---

## 1 系统下配置方法
注意：需要加入commit baeccb51ad86565bf338302f1bb54900732a29a6 才有此选项

- 桌面上滑，打开设置
- 点击系统
![alt text](/assets/images/android-开发指南/3568-android-ntp校时使用/PixPin_2025-07-03_17-20-09.png)

- 日期与时间
![alt text](/assets/images/android-开发指南/3568-android-ntp校时使用/PixPin_2025-07-03_17-21-02.png)

- NTP服务器配置
![alt text](/assets/images/android-开发指南/3568-android-ntp校时使用/PixPin_2025-07-03_17-21-13.png)

- 输入网址
![alt text](/assets/images/android-开发指南/3568-android-ntp校时使用/PixPin_2025-07-03_17-21-22.png)

- 点击确定后，系统会重启

## 2 adb相关命令
- 设置ntp服务器地址
```
settings put global ntp_server sample.com
```
把sample.com换成要设置的ntp服务器地址

- 获取设置的ntp服务器地址
```
settings get global ntp_server
```
没有设置时会显示null

- 控制设备是否​​自动从网络获取时间
```
settings put global auto_time 1
```
​​0​​：禁用自动同步时间（需要手动设置时间）。
​​1​​：启用自动同步时间（默认开启）。
开关一下，会自动同步ntp 服务器时间

代码中可以这么使用：
```
execRootCmd("settings put global auto_time 0"); 
```

## 3 如何验证ntp服务器是否生效
1. 首先在日期与时间设置中，关闭“使用网络提供的时间”
2. 然后设置一个错误的时间
![alt text](/assets/images/android-开发指南/3568-android-ntp校时使用/PixPin_2025-07-03_17-28-44.png)
3. 设置ntp服务器后，等待重启
4. 重启后，设备连接网络，确保能ping通8.8.8.8的情况下，重新打开“使用网络提供的时间”选项
5. 如果ntp服务器没问题，那么时间会从错误的时间自动校准为正确的时间
6. 如果ntp服务器有问题，那么时间将无法校准，使用adb logcat可以看到相关的错误
```logcat
07-03 01:13:55.365   419   715 D SntpClient: request time failed: java.net.SocketTimeoutException: Poll timed out
```

## 4 参考公共ntp服务器地址
ntp.aliyun.com
time1.aliyun.com
ntp.ntsc.ac.cn
time1.apple.com
time1.google.com
