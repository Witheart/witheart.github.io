---
title: "如何在logcat中打印内容用于调试"
date: 2025-04-15
last_modified_at: 2025-04-15
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/如何在logcat中打印内容用于调试/
toc: true
---

概要：本文介绍了如何在Android系统中通过logcat打印调试信息，包括在init.rc脚本中和终端中使用的方法。  


## 1. 在init.rc脚本中打印调试信息  

在类似于init.rc的脚本中，可以使用以下命令打印调试信息：  

```bash
exec -- /system/bin/log -p d -t init.rc "wsh!!!!!!!!!!!!!!"
```  

- **参数说明**：  
  - `-p d`：指定调试级别为debug。  
  - `-t init.rc`：指定标签为init.rc。  

---

## 2. 在终端中打印调试信息  

在终端中，可以直接使用以下命令打印调试信息：  

```bash
/system/bin/log -p d -t init.rc "wsh!!!!!!!!!!!!!!"
```  
---

## 3. logcat中的输出示例  

在logcat中，上述命令的输出如下：  

```
04-15 13:57:21.608  1053  1053 D init.rc : wsh!!!!!!!!!!!!!!
```
