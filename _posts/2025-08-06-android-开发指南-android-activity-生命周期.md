---
title: "Android activity 生命周期"
date: 2025-08-06
last_modified_at: 2025-08-06
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-activity-生命周期/
toc: true
---

## 参考链接
[https://developer.android.com/guide/components/activities/activity-lifecycle?hl=zh-cn](https://developer.android.com/guide/components/activities/activity-lifecycle?hl=zh-cn)

创建、开始、恢复、暂停、停止、销毁
![生命周期流程图](/assets/images/android-开发指南/android-activity-生命周期/image.png)

## **1. `onCreate()`**
- **调用时机**：首次创建 Activity 时（仅一次）。
- **作用**：初始化界面（`setContentView()`）、绑定数据、恢复保存的状态（`savedInstanceState`）。
- **注意**：必须实现此方法，执行基础启动逻辑。

## **2. `onStart()`**
- **调用时机**：Activity 对用户可见（但未在前台）。
- **作用**：准备前台展示（如初始化动画）。
- **注意**：与 `onStop()` 对应，用于处理界面资源的启用/释放。

## **3. `onResume()`**
- **调用时机**：Activity 进入前台，用户可交互（如从其他应用返回）。
- **作用**：恢复核心功能（如摄像头预览、传感器监听）。
- **注意**：此处应初始化 `onPause()` 中释放的资源。

## **4. `onPause()`**
- **调用时机**：Activity 失去焦点（如弹窗覆盖、切换应用）。
- **作用**：暂停耗时操作（如动画）、释放系统资源（GPS、传感器）。
- **注意**：**避免保存数据**（执行时间短），应轻量化处理。

## **5. `onStop()`**
- **调用时机**：Activity 完全不可见（如新 Activity 覆盖全屏）。
- **作用**：释放界面资源（如关闭数据库连接）、保存数据到本地。
- **注意**：系统可能因内存不足销毁进程，需配合 `onSaveInstanceState()` 保存临时状态。

## **6. `onDestroy()`**
- **调用时机**：Activity 被销毁前（用户主动退出或配置变更）。
- **作用**：清理残留资源（如后台线程）、解绑组件。
