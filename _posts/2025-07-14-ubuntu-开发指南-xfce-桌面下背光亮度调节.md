---
title: "xfce 桌面下背光亮度调节"
date: 2025-07-14
last_modified_at: 2025-07-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-桌面下背光亮度调节/
toc: true
---

## 选项位置
- 亮度调整位置
设置-电源管理器-系统托盘图标
![alt text](/assets/images/ubuntu-开发指南/xfce-桌面下背光亮度调节/PixPin_2025-07-14_20-32-38.png)

然后就会在面板上显示一个图标，用于亮度调节

![alt text](/assets/images/ubuntu-开发指南/xfce-桌面下背光亮度调节/PixPin_2025-07-14_20-32-51.png)

## 测试方式
使用万用表接入要测试的背光位置，然后调整滑块，看看电压是否改变

## 不生效问题
有时候亮度调整按键会不生效，可能是/sys/class/backlight下有多个节点，而xfce默认选择第一个，可以在设备树中被用不到的backlight节点disable掉，如下：
```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi b/kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi
index 05c77c47e..06d5f0056 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi
@@ -63,6 +63,7 @@ master: simple-audio-card,codec {
 
 	backlight: backlight {
 		compatible = "pwm-backlight";
+		status = "disabled";
 		pwms = <&pwm4 0 25000 0>;
 		brightness-levels = <
 			  0  20  20  21  21  22  22  23

```
