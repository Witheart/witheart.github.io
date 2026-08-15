---
title: "3568 Android 相机应用崩溃 —— 扫码相机"
date: 2026-04-08
last_modified_at: 2026-04-08
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-相机应用崩溃-扫码相机/
toc: true
---

## 问题描述
客诉USB相机，接入3568后，打开系统下相机应用，应用闪退崩溃。

## 原因分析
通过日志，可以看到
```log
D CAM_Camera2OneCamMgr: Getting First BACK Camera
W CAM_Camera2OneCamMgr: No back-facing camera found.
D CAM_Camera2OneCamMgr: Getting First FRONT Camera
D CAM_Camera2OneCamMgr: Getting First FRONT Camera
W CAM_Camera2OneCamMgr: No front-facing camera found,try to find external facing camera.
W CAM_Camera2OneCamMgr: No external camera found.

04-08 17:00:59.934  4539  4539 D AndroidRuntime: Shutting down VM
04-08 17:00:59.935  4539  4539 E AndroidRuntime: FATAL EXCEPTION: main
04-08 17:00:59.935  4539  4539 E AndroidRuntime: Process: com.android.camera2, PID: 4539
04-08 17:00:59.935  4539  4539 E AndroidRuntime: java.lang.RuntimeException: Unable to start activity ComponentInfo{com.android.camera2/com.android.camera.CameraActivity}: java.lang.ArrayIndexOutOfBoundsException: length=0; index=0
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3431)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3595)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:85)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:135)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:95)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:2066)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.os.Handler.dispatchMessage(Handler.java:106)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.os.Looper.loop(Looper.java:223)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.ActivityThread.main(ActivityThread.java:7664)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at java.lang.reflect.Method.invoke(Native Method)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:592)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:947)
04-08 17:00:59.935  4539  4539 E AndroidRuntime: Caused by: java.lang.ArrayIndexOutOfBoundsException: length=0; index=0
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.camera.CaptureModule.getFacingFromCameraId(CaptureModule.java:1678)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.camera.CaptureModule.init(CaptureModule.java:430)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.camera.CameraActivity.onCreateTasks(CameraActivity.java:1808)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at com.android.camera.util.QuickActivity.onCreate(QuickActivity.java:114)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.Activity.performCreate(Activity.java:8013)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.Activity.performCreate(Activity.java:7997)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1309)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3404)
04-08 17:00:59.935  4539  4539 E AndroidRuntime:        ... 11 more
04-08 17:00:59.938   429  4577 I DropBoxManagerService: add tag=system_app_crash isTagEnabled=true flags=0x2
04-08 17:00:59.939   429   554 W ActivityTaskManager:   Force finishing activity com.android.camera2/com.android.camera.CameraLauncher
```

从日志可以推断，相机应用启动后，由于在设备上没有找到任何可用的摄像头（包括前置、后置和外接），导致用于管理摄像头信息的内部数组为空。当代码试图访问这个空数组的第一个元素（index=0）以获取摄像头方向等信息时，触发了 ArrayIndexOutOfBoundsException，最终导致应用崩溃。

通过捕捉插入USB摄像头的日志，可以看到该USB摄像头被识别成一个HID设备，而不是UVC设备：
```log
04-08 17:01:59.242     0     0 I usb 5-1 : new full-speed USB device number 2 using xhci-hcd
04-08 17:01:59.384     0     0 I usb 5-1 : New USB device found, idVendor=26f1, idProduct=8801, bcdDevice= 1.00
04-08 17:01:59.384     0     0 I usb 5-1 : New USB device strings: Mfr=1, Product=2, SerialNumber=3
04-08 17:01:59.384     0     0 I usb 5-1 : Product: HIDKeyBoard
04-08 17:01:59.384     0     0 I usb 5-1 : Manufacturer: TMC
04-08 17:01:59.384     0     0 I usb 5-1 : SerialNumber: 1234567890abcd
04-08 17:01:59.404     0     0 I input   : TMC HIDKeyBoard as /devices/platform/usbhost/fd000000.dwc3/xhci-hcd.1.auto/usb5/5-1/5-1:1.0/0003:26F1:8801.0002/input/input5
04-08 17:01:59.460   429   429 D RockchipProcessCompactor: StartJob: RockchipProcessCompactor, id: 814
04-08 17:01:59.462   429  4644 I RockchipProcessCompactor: Do native process reclaim...check logcat TAG: RockchipReclaimD
04-08 17:01:59.467     0     0 I hid-generic 0003: 26F1:8801.0002: input,hidraw1: USB HID v1.10 Keyboard [TMC HIDKeyBoard] on usb-xhci-hcd.1.auto-1/input0
04-08 17:01:59.472     0     0 I init    : starting service 'rockchip.reclaimd'...
04-08 17:01:59.474   429   503 D EventHub: No input device configuration file found for device 'TMC HIDKeyBoard'.
04-08 17:01:59.476     0     0 I init    : Control message: Processed ctl.start for 'rockchip.reclaimd' from pid: 429 (system_server)
04-08 17:01:59.478   429   503 I EventHub: usingClockIoctl=true
04-08 17:01:59.478   429   503 I EventHub: New device: id=4, fd=259, path='/dev/input/event3', name='TMC HIDKeyBoard', classes=0x83, configuration='', keyLayout='/system/usr/keylayout/Generic.kl', keyCharacterMap='/system/usr/keychars/Generic.kcm', builtinKeyboard=false,
04-08 17:01:59.478   429   503 I InputReader: Device added: id=5, eventHubId=4, name='TMC HIDKeyBoard', descriptor='d5a9a941570ea7fabc7992ad900011239457b6da',sources=0x80000101
```

相机只能打开UVC设备，HID设备应该按照HID的方式去开发，故系统本身是没有问题的。
