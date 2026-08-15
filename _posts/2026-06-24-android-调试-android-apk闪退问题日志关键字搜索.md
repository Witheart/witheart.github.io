---
title: "Android apk闪退问题日志关键字搜索"
date: 2026-06-24
last_modified_at: 2026-06-24
categories:
  - "Android 调试"
tags:
  - "Android 调试"
permalink: /android-调试/android-apk闪退问题日志关键字搜索/
toc: true
---

对于 Android APK 闪退问题，按优先级依次搜索以下关键字，基本能找到问题

## 1 必查关键字

| 关键字 | 含义 |
|--------|------|
| `FATAL EXCEPTION` | **Java 层崩溃**，后面紧跟的就是崩溃堆栈 |
| `beginning of crash` | logcat 中 crash 段落的起始标记 |
| `AndroidRuntime` | 崩溃信息由这个 tag 输出 |
| `tombstone` | **Native 层崩溃**（C/C++ 代码），会生成 tombstone 文件 |

## 2 补充确认

| 关键字 | 含义 |
|--------|------|
| `has died` | 进程死亡记录，确认哪个进程被杀 |
| `SIGSEGV` / `SIGABRT` / `SIGBUS` | Native crash 的具体信号类型 |
| `ANR` | 应用无响应（Application Not Responding） |
| `data_app_crash` | DropBoxManager 记录的 crash 事件 |
| `Force finishing` | ActivityManager 强制结束 Activity |

## 3 结合包名

直接搜应用的包名，可以快速过滤出所有相关日志。

## 4 示例日志
```log
--- beginning of crash
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: FATAL EXCEPTION: main
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: Process: com.sangfor.atrust, PID: 3039
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: java.lang.RuntimeException: Unable to start activity ComponentInfo{com.sangfor.atrust/com.sangfor.atrust.sdp_tunnel.VpnPermissionActivity}: android.content.ActivityNotFoundException: Unable to find explicit activity class {com.android.vpndialogs/com.android.vpndialogs.ConfirmDialog}; have you declared this activity in your AndroidManifest.xml?
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3431)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3595)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_d.Sangfor_a.Sangfor_b(Proguard:1)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.masterslave.MasterSlaveModeManager$Sangfor_a.Sangfor_b(Proguard:3)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_b$Sangfor_b.invoke(Proguard:7)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ClientTransactionHandler_Proxy.handleLaunchActivity(Unknown Source:22)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_b$Sangfor_b.invoke(Proguard:10)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ClientTransactionHandler_Proxy.handleLaunchActivity(Unknown Source:22)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:85)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:135)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:95)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ActivityThread$H.handleMessage(ActivityThread.java:2066)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.os.Handler.dispatchMessage(Handler.java:106)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.os.Looper.loop(Looper.java:223)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ActivityThread.main(ActivityThread.java:7664)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:592)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:947)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: Caused by: android.content.ActivityNotFoundException: Unable to find explicit activity class {com.android.vpndialogs/com.android.vpndialogs.ConfirmDialog}; have you declared this activity in your AndroidManifest.xml?
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Instrumentation.checkStartActivityResult(Instrumentation.java:2065)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Instrumentation.execStartActivity(Instrumentation.java:1727)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_d.Sangfor_a.Sangfor_b(Proguard:1)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.business.Sangfor_f.Sangfor_d$Sangfor_a.Sangfor_b(Proguard:14)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_b$Sangfor_b.invoke(Proguard:7)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Instrumentation_Proxy.execStartActivity(Unknown Source:39)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Activity.startActivityForResult(Activity.java:5342)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Activity.startActivityForResult(Activity.java:5300)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.atrust.sdp_tunnel.VpnPermissionActivity.Sangfor_a(Proguard:16)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.atrust.sdp_tunnel.VpnPermissionActivity.onCreate(Proguard:4)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Activity.performCreate(Activity.java:8013)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Activity.performCreate(Activity.java:7997)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1309)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at com.sangfor.sdk.sandbox.Sangfor_a.Sangfor_b$Sangfor_b.invoke(Proguard:10)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.Instrumentation_Proxy.callActivityOnCreate(Unknown Source:20)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3404)
06-16 11:42:23.348 10128  3039  3039 E AndroidRuntime: 	... 19 more
06-16 11:42:21.273  root     0     0 D logd    : logdr: UID=10128 GID=10128 PID=3619 n tail=0 logMask=99 pid=0 start=0ns timeout=0ns
06-16 11:42:21.695  root     0     0 I init    : Untracked pid 3066 exited with status 0
06-16 11:42:22.772  root     0     0 I init    : Service 'rockchip.reclaimd' (pid 3574) exited with status 0 oneshot service took 13.409000 seconds in background
06-16 11:42:22.772  root     0     0 I init    : Sending signal 9 to service 'rockchip.reclaimd' (pid 3574) process group...
06-16 11:42:22.772  root     0     0 I libprocessgroup: Successfully killed process cgroup uid 0 pid 3574 in 0ms
06-16 11:42:23.468  1000   423   437 W ActivityTaskManager:   Force finishing activity com.sangfor.atrust/.MainActivity
06-16 11:42:23.476  1000   423   437 W ActivityTaskManager:   Force finishing activity com.sangfor.atrust/.sdp_tunnel.VpnPermissionActivity
06-16 11:42:23.480  1000   423  3622 I DropBoxManagerService: add tag=data_app_crash isTagEnabled=true flags=0x2
06-16 11:42:23.828  1000   423   720 D ConnectivityService: ConnectivityService NetworkRequestInfo binderDied(NetworkRequest [ TRACK_DEFAULT id=25, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED Uid: 10128 AdministratorUids: [] RequestorUid: 10128 RequestorPackageName: com.sangfor.atrust] ], android.os.BinderProxy@dc109c4)
06-16 11:42:23.828  1000   423   829 D ConnectivityService: ConnectivityService NetworkRequestInfo binderDied(NetworkRequest [ TRACK_DEFAULT id=26, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED Uid: 10128 AdministratorUids: [] RequestorUid: 10128 RequestorPackageName: com.sangfor.atrust] ], android.os.BinderProxy@df0ffe2)
06-16 11:42:23.829  1000   423  1975 D ConnectivityService: ConnectivityService NetworkRequestInfo binderDied(NetworkRequest [ LISTEN id=24, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&FOREGROUND Uid: 10128 AdministratorUids: [] RequestorUid: 10128 RequestorPackageName: com.sangfor.atrust] ], android.os.BinderProxy@dc310ad)
06-16 11:42:23.829  1000   423   512 D ConnectivityService: releasing NetworkRequest [ TRACK_DEFAULT id=25, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED Uid: 10128 AdministratorUids: [] RequestorUid: 10128 RequestorPackageName: com.sangfor.atrust] ] (release request)
06-16 11:42:23.830  1000   423   512 D ConnectivityService: releasing NetworkRequest [ TRACK_DEFAULT id=26, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED Uid: 10128 AdministratorUids: [] RequestorUid: 10128 RequestorPackageName: com.sangfor.atrust] ] (release request)
06-16 11:42:23.832  1000   423   724 I ActivityManager: Process com.sangfor.atrust (pid 3039) has died: fg  TOP 
06-16 11:42:23.833  1000   423   720 I WindowManager: WIN DEATH: Window{b8e09cc u0 com.sangfor.atrust/com.sangfor.atrust.MainActivity}
06-16 11:42:23.870  1000   423   444 W WindowManager: Failed looking up window session=Session{c22240e 423:1000} callers=com.android.server.wm.WindowManagerService.windowForClientLocked:5502 com.android.server.wm.WindowManagerService.removeWindow:1909 com.android.server.wm.Session.remove:193 
06-16 11:42:23.873  1000   423   443 W ActivityManager: setHasOverlayUi called on unknown pid: 3039
06-16 11:42:23.919  1000   423   444 I ActivityTaskManager: nodka onWindowsDrawn shortComponentName = com.android.launcher3/.uioverrides.QuickstepLauncher , start_fake_launcher = 0
06-16 11:42:23.920  1000   423   444 I WindowManager: nodka ******* TELLING SURFACE FLINGER WE ARE BOOTED!
06-16 11:42:23.926  1000   423   720 V WindowManager: getPackagePerformanceMode -- ComponentInfo{com.android.launcher3/com.android.launcher3.uioverrides.QuickstepLauncher} -- com.android.launcher3 -- mode=0
06-16 11:42:23.977  1000   423   443 W ActivityTaskManager: Activity top resumed state loss timeout for ActivityRecord{b6106a0 u0 com.sangfor.atrust/.sdp_tunnel.VpnPermissionActivity t-1 f}}
06-16 11:42:26.791  1000   423  1087 E TaskPersister: File error accessing recents directory (directory doesn't exist?).
06-16 11:42:30.830  root     0     0 W audit   : audit_lost=6458 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:42:30.830  root     0     0 E audit   : rate limit exceeded
06-16 11:42:33.051  1000   423   437 I ActivityTaskManager: START u0 {flg=0x10000000 cmp=com.nodka.HubMonitor/.MainActivity} from uid 0
06-16 11:42:40.968  root     0     0 W audit   : audit_lost=6638 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:42:40.968  root     0     0 E audit   : rate limit exceeded
06-16 11:42:42.973  root     0     0 W         : rk817_codec_ctl_gpio set spk clt 1
06-16 11:42:43.171  1000   423   437 I ActivityTaskManager: START u0 {flg=0x10000000 cmp=com.nodka.HubMonitor/.MainActivity} from uid 0
06-16 11:42:45.034  1000   423   720 I ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x10200000 cmp=com.android.rk/.RockExplorer bnds=[8,686][389,832]} from uid 10112
06-16 11:42:45.074  1000   423   443 D CompatibilityChangeReporter: Compat change id reported: 135634846; UID 1000; state: DISABLED
06-16 11:42:45.074  1000   423   443 D CompatibilityChangeReporter: Compat change id reported: 135754954; UID 1000; state: DISABLED
06-16 11:42:45.100  1000   423   450 I ActivityManager: Start proc 3665:com.android.rk/1000 for pre-top-activity {com.android.rk/com.android.rk.RockExplorer}
06-16 11:42:45.293  1000  3665  3665 W ContextImpl: Calling a method in the system process without a qualified user: android.app.ContextImpl.bindService:1748 android.content.ContextWrapper.bindService:756 com.android.rk.RockExplorer.onCreate:220 android.app.Activity.performCreate:8013 android.app.Activity.performCreate:7997 
06-16 11:42:45.294  1000   423   720 W ActivityManager: Unable to start service Intent { cmp=com.android.defcontainer/.DefaultContainerService } U=0: not found
06-16 11:42:45.298  1000  3665  3665 W ContextImpl: Calling a method in the system process without a qualified user: android.app.ContextImpl.startService:1669 android.content.ContextWrapper.startService:720 com.android.rk.RockExplorer.onStart:352 android.app.Instrumentation.callActivityOnStart:1435 android.app.Activity.performStart:8037 
06-16 11:42:45.302  1000  3665  3665 W ContextImpl: Calling a method in the system process without a qualified user: android.app.ContextImpl.bindService:1748 android.content.ContextWrapper.bindService:756 com.android.rk.RockExplorer.onStart:353 android.app.Instrumentation.callActivityOnStart:1435 android.app.Activity.performStart:8037 
06-16 11:42:45.347  1000   423   442 I DropBoxManagerService: add tag=system_app_strictmode isTagEnabled=true flags=0x2
06-16 11:42:45.361  1000   423   442 I chatty  : uid=1000(system) android.io identical 3 lines
06-16 11:42:45.367  1000   423   442 I DropBoxManagerService: add tag=system_app_strictmode isTagEnabled=true flags=0x2
06-16 11:42:45.528  1000   423   444 I ActivityTaskManager: nodka onWindowsDrawn shortComponentName = com.android.rk/.RockExplorer , start_fake_launcher = 0
06-16 11:42:45.534  1000   423   720 V WindowManager: getPackagePerformanceMode -- ComponentInfo{com.android.rk/com.android.rk.RockExplorer} -- com.android.rk -- mode=0
06-16 11:42:46.116  root     0     0 W         : rk817_codec_ctl_gpio set spk clt 0
06-16 11:42:48.103  1000   423  1087 E TaskPersister: File error accessing recents directory (directory doesn't exist?).
06-16 11:42:51.075  root     0     0 W audit   : audit_lost=6695 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:42:51.075  root     0     0 E audit   : rate limit exceeded
06-16 11:42:51.148  root     0     0 I usb 6-1 : new SuperSpeed Gen 1 USB device number 2 using xhci-hcd
06-16 11:42:51.166  root     0     0 I usb 6-1 : New USB device found, idVendor=0781, idProduct=5591, bcdDevice= 1.00
06-16 11:42:51.166  root     0     0 I usb 6-1 : New USB device strings: Mfr=1, Product=2, SerialNumber=3
06-16 11:42:51.166  root     0     0 I usb 6-1 : Product:  SanDisk 3.2Gen1
06-16 11:42:51.166  root     0     0 I usb 6-1 : Manufacturer:  USB
06-16 11:42:51.166  root     0     0 I usb 6-1 : SerialNumber: 01013368a63d89507d7229aa0b68504612ac724dc87af9de2a279aaad881445ff62b000000000000000000008d4eba360013600091558107b3290c53
06-16 11:42:51.169  root     0     0 I usb-storage 6-1: 1.0: USB Mass Storage device detected
06-16 11:42:51.172  root     0     0 I scsi host1: usb-storage 6-1:1.0
06-16 11:42:52.183  root     0     0 I scsi 1  : 0:0:0: Direct-Access      USB      SanDisk 3.2Gen1 1.00 PQ: 0 ANSI: 6
06-16 11:42:52.188  root     0     0 I sd 1    : 0:0:0: [sda] 120176640 512-byte logical blocks: (61.5 GB/57.3 GiB)
06-16 11:42:52.188  root     0     0 I sd 1    : 0:0:0: Attached scsi generic sg0 type 0
06-16 11:42:52.188  root     0     0 I sd 1    : 0:0:0: [sda] Write Protect is off
06-16 11:42:52.188  root     0     0 D sd 1    : 0:0:0: [sda] Mode Sense: 43 00 00 00
06-16 11:42:52.189  root     0     0 I sd 1    : 0:0:0: [sda] Write cache: disabled, read cache: enabled, doesn't support DPO or FUA
06-16 11:42:52.196  root     0     0 I sda     : sda1 sda2
06-16 11:42:52.200  root     0     0 I sd 1    : 0:0:0: [sda] Attached SCSI removable disk
06-16 11:42:52.308  root     0     0 W audit   : audit_lost=6989 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:42:52.308  root     0     0 E audit   : rate limit exceeded
06-16 11:42:53.318  1000   423   724 I ActivityTaskManager: START u0 {flg=0x10000000 cmp=com.nodka.HubMonitor/.MainActivity} from uid 0
06-16 11:42:53.320  1000   423   582 D UsbHostManager: USB device attached: vidpid 0781:5591 mfg/product/ver/serial  USB/ SanDisk 3.2Gen1/1.00/01013368a63d89507d7229aa0b68504612ac724dc87af9de2a279aaad881445ff62b000000000000000000008d4eba360013600091558107b3290c53 hasAudio/HID/Storage: false/false/true
06-16 11:42:53.324  1000   423   582 D UsbHostManager: Added device UsbDevice[mName=/dev/bus/usb/006/002,mVendorId=1921,mProductId=21905,mClass=0,mSubclass=0,mProtocol=0,mManufacturerName= USB,mProductName= SanDisk 3.2Gen1,mVersion=1.00,mSerialNumberReader=com.android.server.usb.UsbSerialReader@e34142d, mHasAudioPlayback=false, mHasAudioCapture=false, mHasMidi=false, mHasVideoCapture=false, mHasVideoPlayback=false, mConfigurations=[
06-16 11:42:53.324  1000   423   582 D UsbHostManager: UsbConfiguration[mId=1,mName=null,mAttributes=128,mMaxPower=112,mInterfaces=[
06-16 11:42:53.324  1000   423   582 D UsbHostManager: UsbInterface[mId=0,mAlternateSetting=0,mName=null,mClass=8,mSubclass=6,mProtocol=80,mEndpoints=[
06-16 11:42:53.324  1000   423   582 D UsbHostManager: UsbEndpoint[mAddress=129,mAttributes=2,mMaxPacketSize=1024,mInterval=0]
06-16 11:42:53.324  1000   423   582 D UsbHostManager: UsbEndpoint[mAddress=2,mAttributes=2,mMaxPacketSize=1024,mInterval=0]]]]
06-16 11:42:53.328  1000   423   582 W UsbProfileGroupSettingsManager: no meta-data for ResolveInfo{9d56ef3 com.estrongs.android.pop.pro/com.estrongs.android.pop.view.FileExplorerActivity m=0x108000}
06-16 11:42:54.346  root   155   165 D vold    : /system/bin/sgdisk
06-16 11:42:54.346  root   155   165 D vold    :     --android-dump
06-16 11:42:54.346  root   155   165 D vold    :     /dev/block/vold/disk:8,0
06-16 11:42:54.366  root   155   165 D vold    : DISK mbr
06-16 11:42:54.366  root   155   165 D vold    : PART 1 7
06-16 11:42:54.366  root   155   165 D vold    : PART 2 1b
06-16 11:42:54.370  1000   423   501 I StorageManagerService: Mounting volume VolumeInfo{public:8,1}:
06-16 11:42:54.370  1000   423   501 I StorageManagerService:     type=PUBLIC diskId=disk:8,0 partGuid= mountFlags=VISIBLE mountUserId=0 
06-16 11:42:54.370  1000   423   501 I StorageManagerService:     state=UNMOUNTED 
06-16 11:42:54.370  1000   423   501 I StorageManagerService:     fsType=null fsUuid=null fsLabel=null 
06-16 11:42:54.370  1000   423   501 I StorageManagerService:     path=null internalPath=null 
06-16 11:42:54.371  root   155   189 D vold    : /system/bin/blkid
06-16 11:42:54.371  root   155   189 D vold    :     -c
06-16 11:42:54.371  root   155   189 D vold    :     /dev/null
06-16 11:42:54.371  root   155   189 D vold    :     -s
06-16 11:42:54.371  root   155   189 D vold    :     TYPE
06-16 11:42:54.371  root   155   189 D vold    :     -s
06-16 11:42:54.371  root   155   189 D vold    :     UUID
06-16 11:42:54.371  root   155   189 D vold    :     -s
06-16 11:42:54.371  root   155   189 D vold    :     LABEL
06-16 11:42:54.371  root   155   189 D vold    :     /dev/block/vold/public:8,1
06-16 11:42:54.425  root   155   189 D vold    : probe_ntfs --> volume_id_set_label_unicode16 --> 大白菜U盘
06-16 11:42:54.426  root   155   189 D vold    : /dev/block/vold/public:8,1: UUID="FEAA71B3AA7168D3" LABEL="大白菜U盘" TYPE="ntfs" 
06-16 11:42:54.426  root   155   189 D vold    : /system/bin/ntfsfix
06-16 11:42:54.426  root   155   189 D vold    :     /dev/block/vold/public:8,1
06-16 11:42:54.482  root   155   189 I vold    : Filesystem check completed OK
06-16 11:42:54.482  root   155   189 D vold    : public:8,1 passed filesystem check
06-16 11:42:54.483  root   155   189 D vold    : /system/bin/ntfs-3g
06-16 11:42:54.483  root   155   189 D vold    :     -o
06-16 11:42:54.483  root   155   189 D vold    :     utf8,uid=0,gid=1023,fmask=0,dmask=0,shortname=mixed,nodev,nosuid,dirsync,big_writes,noatime,delay_mtime=120 
06-16 11:42:54.483  root   155   189 D vold    :     /dev/block/vold/public:8,1
06-16 11:42:54.483  root   155   189 D vold    :     /mnt/media_rw/FEAA71B3AA7168D3
06-16 11:42:54.557  root   155   189 I vold    : Mounting public fuse volume
06-16 11:42:54.561  root   155   189 I vold    : Bind mounting /mnt/media_rw/FEAA71B3AA7168D3 to /mnt/pass_through/0/FEAA71B3AA7168D3
06-16 11:42:54.562  1000   423   501 I StorageSessionController: On volume mount VolumeInfo{public:8,1}:
06-16 11:42:54.562  1000   423   501 I StorageSessionController:     type=PUBLIC diskId=disk:8,0 partGuid= mountFlags=VISIBLE mountUserId=0 
06-16 11:42:54.562  1000   423   501 I StorageSessionController:     state=CHECKING 
06-16 11:42:54.562  1000   423   501 I StorageSessionController:     fsType=ntfs fsUuid=FEAA71B3AA7168D3 fsLabel=大白菜U盘 
06-16 11:42:54.562  1000   423   501 I StorageSessionController:     path=/storage/FEAA71B3AA7168D3 internalPath=/mnt/media_rw/FEAA71B3AA7168D3 
06-16 11:42:54.562  1000   423   501 I StorageSessionController: Creating and starting session with id: public:8,1
06-16 11:42:55.605  root   155   189 I vold    : Configuring read_ahead of /mnt/user/0/FEAA71B3AA7168D3 fuse filesystem to 256kb
06-16 11:42:55.606  root   155   189 I vold    : Writing 256 to /sys/class/bdi/0:108/read_ahead_kb
06-16 11:42:55.606  root   155   189 I vold    : Configuring max_ratio of /mnt/user/0/FEAA71B3AA7168D3 fuse filesystem to 40
06-16 11:42:55.607  root   155   189 I vold    : Writing 40 to /sys/class/bdi/0:108/max_ratio
06-16 11:42:55.607  1000   423   501 I StorageManagerService: Mounted volume VolumeInfo{public:8,1}:
06-16 11:42:55.607  1000   423   501 I StorageManagerService:     type=PUBLIC diskId=disk:8,0 partGuid= mountFlags=VISIBLE mountUserId=0 
06-16 11:42:55.607  1000   423   501 I StorageManagerService:     state=MOUNTED 
06-16 11:42:55.607  1000   423   501 I StorageManagerService:     fsType=ntfs fsUuid=FEAA71B3AA7168D3 fsLabel=大白菜U盘 
06-16 11:42:55.607  1000   423   501 I StorageManagerService:     path=/storage/FEAA71B3AA7168D3 internalPath=/mnt/media_rw/FEAA71B3AA7168D3 
06-16 11:42:55.612  1000   423   501 I StorageSessionController: Notifying volume state changed for session with id: public:8,1
06-16 11:42:55.640  1000   423   501 I chatty  : uid=1000(system) StorageManagerS identical 1 line
06-16 11:42:55.684  1000   423   501 I StorageSessionController: Notifying volume state changed for session with id: public:8,1
06-16 11:42:55.734  1000   423   501 D StorageManagerService: Volume public:8,1 broadcasting mounted to UserHandle{0}
06-16 11:42:55.742  1000   423   501 D StorageManagerService: Volume public:8,1 broadcasting mounted to UserHandle{0}
06-16 11:42:55.763  1000   423   442 I DropBoxManagerService: add tag=system_app_strictmode isTagEnabled=true flags=0x2
06-16 11:42:55.802  1000   423   442 I chatty  : uid=1000(system) android.io identical 4 lines
06-16 11:42:55.807  1000   423   442 I DropBoxManagerService: add tag=system_app_strictmode isTagEnabled=true flags=0x2
06-16 11:42:55.864  1000   423   423 D NotificationService: 0|com.android.systemui|1397773634|public:8,1|10113: granting content://settings/system/notification_sound
06-16 11:42:55.865  1000   423   423 I chatty  : uid=1000(system) Binder:423_3 identical 1 line
06-16 11:42:55.866  1000   423   423 D NotificationService: 0|com.android.systemui|1397773634|public:8,1|10113: granting content://settings/system/notification_sound
06-16 11:42:55.879  1000   423   423 W NotificationHistory: Attempted to add notif for locked/gone/disabled user 0
06-16 11:42:57.324  1000  1232  1232 W ContextImpl: Calling a method in the system process without a qualified user: android.app.ContextImpl.startService:1669 android.content.ContextWrapper.startService:720 android.content.ContextWrapper.startService:720 android.rockchip.update.service.RKUpdateReceiver.onReceive:74 android.app.ActivityThread.handleReceiver:4026 
06-16 11:42:58.934  1000  1232  1232 W ContextImpl: Calling a method in the system process without a qualified user: android.app.ContextImpl.startService:1669 android.content.ContextWrapper.startService:720 android.content.ContextWrapper.startService:720 android.rockchip.update.service.RKUpdateReceiver.onReceive:74 android.app.ActivityThread.handleReceiver:4026 
06-16 11:43:01.246  root     0     0 W audit   : audit_lost=6994 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:43:01.246  root     0     0 E audit   : rate limit exceeded
06-16 11:43:03.450  root     0     0 W         : rk817_codec_ctl_gpio set spk clt 1
06-16 11:43:03.525  1000   423   725 I ActivityTaskManager: START u0 {flg=0x10000000 cmp=com.nodka.HubMonitor/.MainActivity} from uid 0
06-16 11:43:03.531  root     0     0 W WLC_E_IF: NO_IF set, event Ignored
06-16 11:43:03.531  root     0     0 W         : Exit. P2P interface stopped
06-16 11:43:03.532  root     0     0 E [dhd-wlan0] wl_cfg80211_disconnect: Reason 3
06-16 11:43:03.532  root     0     0 W         : dhd_dbg_stop_pkt_monitor, 1963
06-16 11:43:03.536  root     0     0 E [dhd-wlan0] wl_iw_event: disconnected with c8:a2:3b:06:a2:e4, event 11, reason 8
06-16 11:43:03.536  root     0     0 E [dhd-wlan0] wl_ext_iapsta_event: [S] Link down with c8:a2:3b:06:a2:e4, WLC_E_DISASSOC(11), reason 8
06-16 11:43:03.536  root     0     0 E [dhd-wlan0] wl_iw_event: Link Down with c8:a2:3b:06:a2:e4, reason=2
06-16 11:43:03.536  root     0     0 E [dhd-wlan0] wl_ext_iapsta_event: [S] Link down with c8:a2:3b:06:a2:e4, WLC_E_LINK(16), reason 2
06-16 11:43:03.536  root     0     0 I         : [dhd] CFG80211-ERROR) wl_is_linkdown : Link down Reason : WLC_E_LINK
06-16 11:43:03.536  root     0     0 E [dhd-wlan0] wl_notify_connect_status: link down if wlan0 may call cfg80211_disconnected. event : 16, reason=2 from c8:a2:3b:06:a2:e4
06-16 11:43:03.536  root     0     0 W         : dhd_dbg_stop_pkt_monitor, 1963
06-16 11:43:03.765  root     0     0 I         : [dhd] CFG80211-ERROR) wl_cfg80211_del_key : WLC_SET_KEY error (-8)
06-16 11:43:03.766  root     0     0 I         : [dhd] CFG80211-ERROR) wl_cfg80211_del_key : WLC_SET_KEY error (-8)
06-16 11:43:03.826  root     0     0 W dhd_stop: Enter 00000000f1f4cb42
06-16 11:43:03.829  root     0     0 I CFGP2P-ERROR) wl_cfgp2p_disable_discovery:  
06-16 11:43:03.829  root     0     0 W         : do nothing, not initialized
06-16 11:43:03.829  root     0     0 I         : [dhd] CFG80211-ERROR) wl_cfgp2p_down : Clean up the p2p discovery IF
06-16 11:43:03.829  root     0     0 W wl_cfgp2p_del_p2p_disc_if: wdev: 00000000dc77ee68, wdev->net:           (null)
06-16 11:43:03.878  root     0     0 W         : P2P interface unregistered
06-16 11:43:03.878  root     0     0 I CFGP2P-ERROR) wl_cfgp2p_deinit_priv:  
06-16 11:43:03.878  root     0     0 W         : In
06-16 11:43:03.879  root     0     0 W dhd_tcpack_suppress_set 352: already set to 0
06-16 11:43:03.879  root     0     0 E [dhd-wlan0] wl_android_wifi_off: in g_wifi_on=1, on_failure=1
06-16 11:43:03.880  root     0     0 W         : dhd_dbg_detach_pkt_monitor, 2204
06-16 11:43:03.880  root     0     0 W         : __dhd_dbg_free_tx_pkts, 1518
06-16 11:43:03.880  root     0     0 W         : __dhd_dbg_free_rx_pkts, 1536
06-16 11:43:03.880  root     0     0 W dhd_bus_devreset: == Power OFF ==
06-16 11:43:03.880  root     0     0 W dhd_txglom_enable: enable 0
06-16 11:43:03.880  root     0     0 W dhd_bus_devreset: WLAN OFF DONE
06-16 11:43:03.880  root     0     0 W         : wifi_platform_set_power = 0
06-16 11:43:03.880  root     0     0 W         : ======== PULL WL_REG_ON(-1) LOW! ========
06-16 11:43:03.880  root     0     0 I [WLAN_RFKILL]: rockchip_wifi_power: 0
06-16 11:43:03.880  root     0     0 I [WLAN_RFKILL]: rockchip_wifi_power: toggle = false
06-16 11:43:03.880  root     0     0 I [WLAN_RFKILL]: rockchip_wifi_power: toggle = false
06-16 11:43:03.880  root     0     0 I [WLAN_RFKILL]: wifi shut off power [GPIO-1-1]
06-16 11:43:03.880  root     0     0 E [dhd-wlan0] wl_android_wifi_off: out
06-16 11:43:03.908  root     0     0 W dhd_stop: Exit
06-16 11:43:03.919  root     0     0 I init    : Service 'wpa_supplicant' (pid 556) exited with status 0 oneshot service took 534.879028 seconds in background
06-16 11:43:03.919  root     0     0 I init    : Sending signal 9 to service 'wpa_supplicant' (pid 556) process group...
06-16 11:43:03.920  root     0     0 I libprocessgroup: Successfully killed process cgroup uid 0 pid 556 in 0ms
06-16 11:43:03.940  root     0     0 W dhd_wl_ioctl: returning as busstate=0
06-16 11:43:03.940  root     0     0 I chatty  : uid=0(root) logd identical 17 lines
06-16 11:43:03.940  root     0     0 W dhd_wl_ioctl: returning as busstate=0
06-16 11:43:04.030  root     0     0 W audit   : audit_lost=7306 audit_rate_limit=5 audit_backlog_limit=64
06-16 11:43:04.030  root     0     0 E audit   : rate limit exceeded
06-16 11:43:04.899  root     0     0 I init    : processing action (wlan.driver.status=ok) from (/vendor/etc/init/hw/init.connectivity.rc:48)
06-16 11:43:04.925  root     0     0 I init    : processing action (wlan.driver.status=ok) from (/vendor/etc/init/hw/init.connectivity.rc:48)
06-16 11:43:04.926  root     0     0 W dhd_open: Enter 00000000f1f4cb42
06-16 11:43:04.926  root     0     0 W dhd_open: no mutex held. set lock
06-16 11:43:04.926  root     0     0 W         : Dongle Host Driver, version 1.579.77.41.22 (r-20191105-2)(20191120-1)
06-16 11:43:04.926  root     0     0 E [dhd-wlan0] wl_android_wifi_on: in g_wifi_on=0
06-16 11:43:04.926  root     0     0 W         : wifi_platform_set_power = 1
06-16 11:43:04.926  root     0     0 W         : ======== PULL WL_REG_ON(-1) HIGH! ========
06-16 11:43:04.926  root     0     0 I [WLAN_RFKILL]: rockchip_wifi_power: 1
06-16 11:43:04.926  root     0     0 I [WLAN_RFKILL]: rockchip_wifi_power: toggle = false
06-16 11:43:04.926  root     0     0 I [WLAN_RFKILL]: wifi turn on power [GPIO-1-0]
06-16 11:43:05.238  root     0     0 W sdio_reset_comm():  
06-16 11:43:05.461  root     0     0 I         : mmc_host mmc3: Bus speed (slot 0) = 375000Hz (slot req 400000Hz, actual 375000HZ div = 0)
06-16 11:43:05.478  root     0     0 I         : mmc_host mmc3: Bus speed (slot 0) = 375000Hz (slot req 375000Hz, actual 375000HZ div = 0)
06-16 11:43:05.488  root     0     0 W mmc3    : queuing unknown CIS tuple 0x80 (2 bytes)
06-16 11:43:05.490  root     0     0 W mmc3    : queuing unknown CIS tuple 0x80 (3 bytes)
06-16 11:43:05.492  root     0     0 W mmc3    : queuing unknown CIS tuple 0x80 (3 bytes)
06-16 11:43:05.495  root     0     0 W mmc3    : queuing unknown CIS tuple 0x80 (7 bytes)
06-16 11:43:05.496  root     0     0 W mmc3    : queuing unknown CIS tuple 0x81 (1 bytes)
06-16 11:43:05.583  1000   423   442 D BluetoothManagerService: Bluetooth persisted state: 0
06-16 11:43:05.584  1000   423   442 D BluetoothManagerService: Airplane Mode change - current state:  OFF, isAirplaneModeOn()=true
06-16 11:43:05.589  root     0     0 I         : mmc_host mmc3: Bus speed (slot 0) = 50000000Hz (slot req 50000000Hz, actual 50000000HZ div = 0)
06-16 11:43:05.590  root     0     0 W sdioh_start: set sd_f2_blocksize 256
06-16 11:43:05.590  root     0     0 W dhd_bus_devreset: == WLAN ON ==
06-16 11:43:05.590  root     0     0 W         : F1 signature read @0x18000000=0x1541a9a6
06-16 11:43:05.593  root     0     0 W         : F1 signature OK, socitype:0x1 chip:0xa9a6 rev:0x1 pkg:0x4
06-16 11:43:05.594  root     0     0 W DHD     : dongle ram size is set to 524288(orig 524288) at 0x0
06-16 11:43:05.594  root     0     0 W dhd_bus_set_default_min_res_mask: Unhandled chip id
```
