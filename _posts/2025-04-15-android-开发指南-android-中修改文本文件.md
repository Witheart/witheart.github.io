---
title: "Android 中修改文本文件"
date: 2025-04-15
last_modified_at: 2025-04-15
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-中修改文本文件/
toc: true
---

概要：本文介绍了在Android系统中如何修改文本文件，特别是在终端中无法使用vim或nano时的替代方法。  


## 1. 使用busybox vi编辑文件  

在Android终端中，如果vim和nano等命令不可用，可以使用busybox提供的vi编辑器：  

```bash
busybox vi xxx.txt
```  

---

## 2. 处理只读文件系统  

如果在使用vi编辑文件时遇到“read only”提示，说明文件系统是只读的，需要重新挂载为可写模式：  

### 2.1 退出adb  
首先退出当前的adb会话。  

### 2.2 获取root权限  
输入以下命令获取root权限：  

```bash
adb root
```  

### 2.3 重新挂载文件系统  
执行以下命令将文件系统重新挂载为可写模式：  

```bash
adb remount
```  

完成上述操作后，文件系统将被重新挂载为read-write模式，可以继续进行文件修改。
