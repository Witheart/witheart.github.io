---
title: "3568 Android 系统下修改开机自定义脚本"
date: 2025-04-15
last_modified_at: 2025-04-15
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-系统下修改开机自定义脚本/
toc: true
---

概要：本文介绍了在Android 3568系统中如何修改开机自定义脚本，包括使用adb获取权限和编辑相关配置文件的方法。  


## 1. 准备工作  

### 1.1 开启adb  
确保设备已连接并开启adb调试模式。  

### 1.2 获取root权限并重新挂载文件系统  
执行以下命令获取root权限并重新挂载文件系统为可写模式：  

```bash
adb root  
adb remount  
adb shell  
```  

---

## 2. 修改开机自定义脚本  

### 2.1 编辑init.rk356x.rc文件  
使用busybox vi编辑器打开目标配置文件：  

```bash
busybox vi /vendor/etc/init/hw/init.rk356x.rc  
```  

### 2.2 添加自定义内容  
在文件中找到以下行：  

```
on property:sys.boot_completed=1  
```  

在该行下方添加自定义内容。  

---

## 3. 创建服务执行脚本  

除了直接修改init.rk356x.rc文件外，还可以通过创建服务的方式执行自定义脚本：  

- 在相应的配置文件中定义一个新的服务。  
- 在服务中指定需要执行的脚本路径。  
