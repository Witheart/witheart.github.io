---
title: "3568 Android 禁用板载 RK809 MIC 麦克风"
date: 2025-12-25
last_modified_at: 2025-12-25
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-禁用板载-rk809-mic-麦克风/
toc: true
---

## 需求
客户接入usb摄像头，携带有麦克风。3568表现如下：
- 没有接入USB摄像头时，板载RK809麦克风正常使用
- 接入USB摄像头时，系统自动关闭了RK809的麦克风，切换成USB摄像头上的麦克风

但是客户的要求是：完全禁用板载的RK809麦克风。

## 思路
根据《Android 音频框架》文章，可以在AudioPolicy层或者驱动层实现禁用。

## 解决方式
### AudioPolicy层
该文件对应系统下 `vendor/etc/audio_policy_configuration.xml`
```diff
diff --git a/device/rockchip/common/audio_policy_configuration.xml b/device/rockchip/common/audio_policy_configuration.xml
index 5c1e90400b..21bd2b379e 100644
--- a/device/rockchip/common/audio_policy_configuration.xml
+++ b/device/rockchip/common/audio_policy_configuration.xml
@@ -21,7 +21,7 @@
         <module name="primary" halVersion="2.0">
             <attachedDevices>
                 <item>Speaker</item>
-                <item>Built-In Mic</item>
+                <!-- <item>Built-In Mic</item> -->
                 <item>HDMIIn</item>
             </attachedDevices>
             <defaultOutputDevice>Speaker</defaultOutputDevice>
```
实测这样会导致USB录音也失败，暂时不解，使用驱动层方式。

### 驱动层
```diff
diff --git a/kernel/sound/soc/codecs/rk817_codec.c b/kernel/sound/soc/codecs/rk817_codec.c
index 71ea1f42e1..294f5787f2 100644
--- a/kernel/sound/soc/codecs/rk817_codec.c
+++ b/kernel/sound/soc/codecs/rk817_codec.c
@@ -478,7 +478,7 @@ static const char * const rk817_playback_path_mode[] = {
 	"RING_SPK", "RING_HP", "RING_HP_NO_MIC", "RING_SPK_HP"}; /* 7-10 */
 
 static const char * const rk817_capture_path_mode[] = {
-	"MIC OFF", "Main Mic", "Hands Free Mic", "BT Sco Mic"};
+	"MIC OFF"}; //by Witheart: "MIC OFF", "Main Mic", "Hands Free Mic", "BT Sco Mic"
 
 static const char * const rk817_call_path_mode[] = {
 	"OFF", "RCV", "SPK", "HP", "HP_NO_MIC", "BT"}; /* 0-5 */

```
