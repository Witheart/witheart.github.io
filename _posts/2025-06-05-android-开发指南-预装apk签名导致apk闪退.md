---
title: "预装apk签名导致apk闪退"
date: 2025-06-05
last_modified_at: 2025-06-05
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/预装apk签名导致apk闪退/
toc: true
---

## 背景
系统SDK预装 Gboard，烧录后打开 Gboard 闪退。

## 日志
```sh
05-09 18:16:38.100   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:38.100   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:38.104   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:38.104   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:38.414   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
05-09 18:16:38.721   339  1225 D gps_ql  : Error connecting rild-nmea (Connection refused)
05-09 18:16:38.721   339  1225 D gps_ql  : fail to open GPS channel <rild-nmea>!
05-09 18:16:39.048   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.048   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.055   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.055   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: start_output_stream:983 out = 0xf3703210,device = 0x2,outputs[OUTPUT_HDMI_MULTI] = 0x0
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: card0 id:rockchiprk809co
05-09 18:16:39.059   514   542 I system_server: oneway function results will be dropped but finished with status OK and parcel size 4
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: card1 id:rockchiphdmi
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: No exist proc/asound/card2/id, break and finish parsing
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: dump out device info
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: dev_info SPEAKER  card=0, device:0
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: dev_info HDMI  card=1, device:0
05-09 18:16:39.059   323  4238 D AudioHardwareTiny: out->Device     : 0x2
05-09 18:16:39.060   323  4238 D AudioHardwareTiny: out->SampleRate : 44100
05-09 18:16:39.060   323  4238 D AudioHardwareTiny: out->Channels   : 2
05-09 18:16:39.060   323  4238 D AudioHardwareTiny: out->Format     : 0
05-09 18:16:39.060   514  2795 I ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x10200000 cmp=com.google.android.input
method.latin/com.google.android.libraries.inputmethod.launcher.LauncherActivity bnds=[548,213][818,324]} from uid 10131
05-09 18:16:39.060   323  4238 D AudioHardwareTiny: out->PreiodSize : 512
05-09 18:16:39.060   323  4238 D alsa_route: route_info->sound_card 0, route_info->devices 0
05-09 18:16:39.060   323  4238 D alsa_route: route_set_controls() set route 0
05-09 18:16:39.061   514  1100 I system_server: oneway function results will be dropped but finished with status OK and parcel size 4
05-09 18:16:39.082   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.082   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.091     0     0 W         : rk817_codec_ctl_gpio set spk clt 1
05-09 18:16:39.082   323  4238 D AudioHardwareTiny: start_output_stream:1098, out = 0xf3703210
05-09 18:16:39.084   514   556 D CompatibilityChangeReporter: Compat change id reported: 143937733; UID 10077; state: ENABLED
05-09 18:16:39.088   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.088   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.098   340   340 I chatty  : uid=1000(system) composer@2.1-se identical 1 line
05-09 18:16:39.104   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.104   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.117   299   299 D Zygote  : Forked child process 9518
05-09 18:16:39.120   514   556 I ActivityManager: Start proc 9518:com.google.android.inputmethod.latin/u0a77 for pre-top-activity {com.google.android.inputmethod.latin/com.googl
e.android.libraries.inputmethod.launcher.LauncherActivity}
05-09 18:16:39.128   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.128   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.129   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.129   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.248  9518  9518 I Zygote  : seccomp disabled by setenforce 0
05-09 18:16:39.280   407   467 I adbd    : jdwp connection from 9518
05-09 18:16:39.312   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.312   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.327   340   340 I chatty  : uid=1000(system) composer@2.1-se identical 2 lines
05-09 18:16:39.329   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:39.329   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:39.350   359   448 W APM::AudioPolicyEngine: getDevicesForStrategy() unknown strategy: -1
05-09 18:16:39.351   514  2285 I system_server: oneway function results will be dropped but finished with status OK and parcel size 4
05-09 18:16:39.415   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
05-09 18:16:39.462  9518  9518 D NetworkSecurityConfig: No Network Security Config specified, using platform default
05-09 18:16:39.463  9518  9518 D NetworkSecurityConfig: No Network Security Config specified, using platform default
05-09 18:16:39.585  9518  9518 I CrossProfileSharedPrefe: work profile changes to unavailable
05-09 18:16:39.586  9518  9518 I MetricsManager: Start caching metrics.
05-09 18:16:39.626  9518  9518 I CrashProtector: CrashProtector.isValidSkipFlagTimestamp():240 Valid to trigger flag-safe-mode: 42594 seconds left (43200 seconds in total).
05-09 18:16:39.626  9518  9518 I CrashProtector: CrashProtector.initInternal():186 Starts in flag-safe-mode.
05-09 18:16:39.688  9518  9518 I NativeLibHelper: NativeLibHelper.loadLibrary():162 Loaded native library:integrated_shared_object (result=true)
05-09 18:16:39.690  9518  9518 I NativeLibHelper: NativeLibHelper.loadLibrary():162 Loaded native library:integrated_shared_object (result=true)
05-09 18:16:39.721   339  1225 D gps_ql  : Error connecting rild-nmea (Connection refused)
05-09 18:16:39.721   339  1225 D gps_ql  : fail to open GPS channel <rild-nmea>!
05-09 18:16:39.746  9518  9518 I DeviceModeNotification: DeviceModeNotification.getCurrentDeviceMode():75 device mode is unknown before initializing the notification.
05-09 18:16:39.747  9518  9518 I chatty  : uid=10077(com.google.android.inputmethod.latin) identical 1 line
05-09 18:16:39.747  9518  9518 I DeviceModeNotification: DeviceModeNotification.getCurrentDeviceMode():75 device mode is unknown before initializing the notification.
05-09 18:16:39.757  9518  9518 I OemConfigs: OemConfigs.<init>():149 OEM configs apply status: 1
05-09 18:16:39.761  1205  1205 I NearbySharing: SharingTileService destroyed [CONTEXT service_id=194 ]
05-09 18:16:39.778  9518  9518 I ModuleManager: ModuleManager.<init>():160 ModuleManager is created on process com.google.android.inputmethod.latin
05-09 18:16:39.789  9518  9518 W ModuleManager: ModuleManager.initModules():298 fyv is forbidden by min_api_level (31) or max_api_level (2147483647): 30
05-09 18:16:39.790  9518  9518 W ModuleManager: ModuleManager.initModules():298 fyl is forbidden by min_api_level (31) or max_api_level (2147483647): 30
05-09 18:16:39.866  9518  9518 I ModuleManager: ModuleManager.initModules():288 GenAiDelegate is forbidden to run on current process
05-09 18:16:39.872  9518  9518 W ModuleManager: ModuleManager.initModules():298 lcw is forbidden by min_api_level (31) or max_api_level (2147483647): 30
05-09 18:16:39.873  9518  9518 W ModuleManager: ModuleManager.initModules():298 lek is forbidden by min_api_level (31) or max_api_level (2147483647): 30
05-09 18:16:39.880  9518  9518 I ModuleManager: ModuleManager.initModules():312 lnc is forbidden by device ram size 1957 MB
05-09 18:16:39.902  9518  9518 I DeviceModeNotification: DeviceModeNotification.getCurrentDeviceMode():75 device mode is unknown before initializing the notification.
05-09 18:16:39.904  9518  9518 I chatty  : uid=10077(com.google.android.inputmethod.latin) identical 1 line
05-09 18:16:39.905  9518  9518 I DeviceModeNotification: DeviceModeNotification.getCurrentDeviceMode():75 device mode is unknown before initializing the notification.
05-09 18:16:39.908  9518  9518 W ModuleManager: ModuleManager.initModules():298 nfz is forbidden by min_api_level (33) or max_api_level (2147483647): 30
05-09 18:16:39.931  9518  9518 W ModuleManager: ModuleManager.initModules():298 sxk is forbidden by min_api_level (31) or max_api_level (2147483647): 30
05-09 18:16:39.934  9518  9518 I ModuleManager: ModuleManager.initModules():288 tau is forbidden to run on current process
05-09 18:16:39.950  9518  9518 W ModuleManager: ModuleManager.initModules():298 utk is forbidden by min_api_level (34) or max_api_level (2147483647): 30
05-09 18:16:39.963  9518  9518 W ModuleManager: ModuleManager.initModules():298 xkq is forbidden by min_api_level (33) or max_api_level (2147483647): 30
05-09 18:16:39.965  9518  9518 W ModuleManager: ModuleManager.initModules():298 xno is forbidden by min_api_level (34) or max_api_level (2147483647): 30
05-09 18:16:39.968  9518  9518 W ModuleManager: ModuleManager.initModules():298 xro is forbidden by min_api_level (28) or max_api_level (28): 30
05-09 18:16:39.975  9518  9518 I ModuleManager: ModuleManager.initModules():288 ydl is forbidden to run on current process
05-09 18:16:39.997  9518  9518 I DeviceModeNotification: DeviceModeNotification.getCurrentDeviceMode():75 device mode is unknown before initializing the notification.
05-09 18:16:40.020  9518  9518 I TetheringManager: registerTetheringEventCallback:com.google.android.inputmethod.latin
05-09 18:16:40.024  9518  9518 I DeviceStatusMonitor: DeviceStatusMonitor.updateCountryInfo():139 updateCountryInfo(), notifyAnyway = true
05-09 18:16:40.025  9518  9549 I SuperpacksManagerImpl: SuperpacksManagerImpl.initializeInternal():471 initializeInternal()
05-09 18:16:40.033  9518  9518 I DeviceStatusMonitor: DeviceStatusMonitor.notifyIfNetworkChanged():180 notifyIfNetworkChanged: newState = NON_METERED, airplaneModeOn = false, no
tifyAnyway = true
05-09 18:16:40.038  9518  9518 I DeviceLockTags: DeviceLockTags.notifyDeviceLockStatusChanged():108 notifyDeviceLockStatusChanged(): deviceLocked=false, blockPersonalData=false
05-09 18:16:40.054  9518  9518 I PhenotypeModule: PhenotypeModule.onCreate():185 onCreate()
05-09 18:16:40.056  9518  9518 I PhenotypeModule: PhenotypeModule.maybeFetchAndUpdate():275 Skip fetch and update since in flag-clean mode.
05-09 18:16:40.056  9518  9518 I PhenotypeModule: PhenotypeModule$2.onSuccess():196 Fetch at onCreate(): false
05-09 18:16:40.059  9518  9518 I LatinApp: LatinApp.initialize():197 initialize()
05-09 18:16:40.067  9518  9549 I SuperpacksManagerImpl: SuperpacksManagerImpl.initializeInternal():528 Switched background task scheduler: false
05-09 18:16:40.069  9518  9518 D AndroidRuntime: Shutting down VM
05-09 18:16:40.070  9518  9518 E AndroidRuntime: FATAL EXCEPTION: main
05-09 18:16:40.070  9518  9518 E AndroidRuntime: Process: com.google.android.inputmethod.latin, PID: 9518
05-09 18:16:40.070  9518  9518 E AndroidRuntime: java.lang.RuntimeException: Unable to create application com.google.android.apps.inputmethod.latin.LatinApp: java.lang.IllegalSt
ateException: APK is signed by unrecognized certificates: 2D370C21F5DFD553D2A796314B70925FB38ADEEF90864C920BBBBB12887D3522
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.ActivityThread.handleBindApplication(ActivityThread.java:6724)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.ActivityThread.access$1300(ActivityThread.java:237)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1913)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.os.Handler.dispatchMessage(Handler.java:106)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.os.Looper.loop(Looper.java:223)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.ActivityThread.main(ActivityThread.java:7664)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at java.lang.reflect.Method.invoke(Native Method)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:592)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:947)
05-09 18:16:40.070  9518  9518 E AndroidRuntime: Caused by: java.lang.IllegalStateException: APK is signed by unrecognized certificates: 2D370C21F5DFD553D2A796314B70925FB38ADEEF
90864C920BBBBB12887D3522
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at com.google.android.apps.inputmethod.latin.LatinApp.f(PG:116)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at rsp.onCreate(PG:2533)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at fqm.onCreate(PG:46)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.Instrumentation.callApplicationOnCreate(Instrumentation.java:1192)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        at android.app.ActivityThread.handleBindApplication(ActivityThread.java:6719)
05-09 18:16:40.070  9518  9518 E AndroidRuntime:        ... 8 more
05-09 18:16:40.072  9518  9518 I CrashDataStore: CrashDataStore.saveCrashInMemory():234 Discard saved crash: # vsm@e7b3be8c
05-09 18:16:40.074  9518  9549 I WorkManagerHelper: WorkManagerHelper.getWorkManager():84 WorkManager is requested before user unlocked.
05-09 18:16:40.085   514  9553 I DropBoxManagerService: add tag=system_app_crash isTagEnabled=true flags=0x2
05-09 18:16:40.085   514  2285 W ActivityTaskManager:   Force finishing activity com.google.android.inputmethod.latin/com.google.android.libraries.inputmethod.launcher.LauncherA
ctivity
05-09 18:16:40.096   514   555 W BroadcastQueue: Background execution not allowed: receiving Intent { act=android.intent.action.DROPBOX_ENTRY_ADDED flg=0x10 (has extras) } to co
m.google.android.gms/.stats.service.DropBoxEntryAddedReceiver
05-09 18:16:40.096   514   555 W BroadcastQueue: Background execution not allowed: receiving Intent { act=android.intent.action.DROPBOX_ENTRY_ADDED flg=0x10 (has extras) } to co
m.google.android.gms/.chimera.GmsIntentOperationService$PersistentTrustedReceiver
05-09 18:16:40.104  9518  9518 I Process : Sending signal. PID: 9518 SIG: 9
05-09 18:16:40.126   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.126   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.141   514  1100 I ActivityManager: Process com.google.android.inputmethod.latin (pid 9518) has died: prcp TOP
05-09 18:16:40.128   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.128   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.143   947  9554 E WakeLock: IntentOp:.common.broadcast.BackgroundBroadcastReceiverSupport$PersistentReceiverIntentOperation should be held!
05-09 18:16:40.157   299   299 I Zygote  : Process 9518 exited due to signal 9 (Killed)
05-09 18:16:40.160   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.160   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.180   514  2795 V WindowManager: getPackagePerformanceMode -- ComponentInfo{com.android.launcher3/com.android.launcher3.uioverrides.QuickstepLauncher} -- com.andr
oid.launcher3 -- mode=0
05-09 18:16:40.177   340   340 I chatty  : uid=1000(system) composer@2.1-se identical 2 lines
05-09 18:16:40.178   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.178   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.185  2299  2299 I Finsky  : [2] wyh.onTrimMemory(1): Memory trim requested to level 80
05-09 18:16:40.187   514   561 I libprocessgroup: Successfully killed process cgroup uid 10077 pid 9518 in 45ms
05-09 18:16:40.198   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.198   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.215   340   340 I chatty  : uid=1000(system) composer@2.1-se identical 2 lines
05-09 18:16:40.223   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:40.223   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:40.417   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
05-09 18:16:40.587   514   549 W ActivityTaskManager: Activity top resumed state loss timeout for ActivityRecord{fd4c861 u0 com.google.android.inputmethod.latin/com.google.andro
id.libraries.inputmethod.launcher.LauncherActivity t-1 f}}
05-09 18:16:40.722   339  1225 D gps_ql  : Error connecting rild-nmea (Connection refused)
05-09 18:16:40.722   339  1225 D gps_ql  : fail to open GPS channel <rild-nmea>!
05-09 18:16:41.419   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
05-09 18:16:41.723   339  1225 D gps_ql  : Error connecting rild-nmea (Connection refused)
05-09 18:16:41.723   339  1225 D gps_ql  : fail to open GPS channel <rild-nmea>!
05-09 18:16:42.227   323   323 D AudioHardwareTiny: do_out_standby,out = 0xf3703210,device = 0x2
05-09 18:16:42.235     0     0 W         : rk817_codec_ctl_gpio set spk clt 0
05-09 18:16:42.235   323   323 D alsa_route: route_set_controls() set route 24
05-09 18:16:42.245   323   323 D AudioHardwareTiny: close device
05-09 18:16:42.248   514  2805 I system_server: oneway function results will be dropped but finished with status OK and parcel size 4
05-09 18:16:42.421   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
05-09 18:16:42.657   514  1630 E TaskPersister: File error accessing recents directory (directory doesn't exist?).
05-09 18:16:42.686  9563  9563 I ps      : type=1400 audit(0.0:16698): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:init:s0 tclass=file permissive=1
05-09 18:16:42.701     0     0 W audit   : audit_lost=16043 audit_rate_limit=5 audit_backlog_limit=64
05-09 18:16:42.701     0     0 E audit   : rate limit exceeded
05-09 18:16:42.723   339  1225 D gps_ql  : Error connecting rild-nmea (Connection refused)
05-09 18:16:42.723   339  1225 D gps_ql  : fail to open GPS channel <rild-nmea>!
05-09 18:16:42.742   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:42.742   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:42.788   514  2805 I ActivityTaskManager: START u0 {flg=0x10000000 cmp=com.nodka.HubMonitor/.MainActivity} from uid 0
05-09 18:16:42.748   340   340 I gralloc4: [File] : hardware/rockchip/libgralloc/bifrost/src/core/mali_gralloc_formats.cpp; [Line] : 1852; [Func] : rk_gralloc_select_format;
05-09 18:16:42.748   340   340 I gralloc4: AFBC IS disabled for fb_target_layer.
05-09 18:16:43.423   161   161 I hwservicemanager: Since android.hardware.radio@1.1::IRadio/slot1 is not registered, trying to start it as a lazy HAL.
```

## 问题分析
- 关键错误
```sh
05-09 18:16:40.070  9518  9518 E AndroidRuntime: Caused by: java.lang.IllegalStateException: APK is signed by unrecognized certificates
```

- 预装时的配置
```makefile
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := Gboard
LOCAL_MODULE_CLASS := APPS
LOCAL_MODULE_TAGS := optional
LOCAL_CERTIFICATE := platform
LOCAL_SRC_FILES := Gboard_15.3.03.745389837-beta-armeabi-v7a_apkcombo.com.apk
LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)
LOCAL_PRIVILEGED_MODULE := true

include $(BUILD_PREBUILT)
```

## 解决方式
- 改为默认签名
```makefile
LOCAL_CERTIFICATE := PRESIGNED
```
