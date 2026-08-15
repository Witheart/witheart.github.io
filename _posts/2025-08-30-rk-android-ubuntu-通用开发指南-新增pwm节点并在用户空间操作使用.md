---
title: "新增pwm节点并在用户空间操作使用"
date: 2025-08-30
last_modified_at: 2025-08-30
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/新增pwm节点并在用户空间操作使用/
toc: true
---

## 1 设备树修改示例
```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-R36S0.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-R36S0.dtsi
index c2774fff9..4c3a55513 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-R36S0.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-R36S0.dtsi
@@ -25,6 +25,16 @@ rk_headset: rk-headset {
 		pinctrl-0 = <&hp_det>;
 	};
 	#endif
+	
+	pwm1_common: pwm1-common {
+		pwms = <&pwm1 0 10000 0>;
+		status = "okay";
+	};
+
+	pwm2_common: pwm2-common {
+		pwms = <&pwm2 0 10000 0>;
+		status = "okay";
+	};
 
 	vcc2v5_sys: vcc2v5-ddr {
 		compatible = "regulator-fixed";
@@ -917,3 +927,13 @@ &uart9 {
 &pwm5 {
 	status = "disabled";
 };
+
+&pwm1 {
+	pinctrl-0 = <&pwm1m1_pins>;
+	status = "okay";
+};
+
+&pwm2 {
+	pinctrl-0 = <&pwm2m1_pins>;
+	status = "okay";
+};
\ No newline at end of file

```

- 可以看到，需要新增一个自定义节点pwm1_common: pwm1-common，这里的名称是自定义的，建议前面使用下划线连接，后面使用连字符连接。
- 最重要的是，需要在自定义的节点里面，引用pwm设备节点，也就是`pwms = <&pwm1 0 10000 0>`
  - 参数 1，表示 index (per-chip index of the PWM to request)，一般是 0，因为Rockchip PWM 每个 chip 只有一个。
  - 参数 2，表示 PWM 输出波形的时间周期，单位是 ns。
  - 参数 3，表示极性，为可选参数；PWM_POLARITY_INVERTED配置为负极性。
- pinctrl-0用于选择引脚复用

## 2 查看是否注册成功
```bash
cat  /sys/kernel/debug/pwm

platform/fe6e0020.pwm, 1 PWM device
 pwm-0   (backlight1          ): requested period: 25000 ns duty: 0 ns polarity: normal

platform/fe6e0000.pwm, 1 PWM device
 pwm-0   (backlight           ): requested enabled period: 25000 ns duty: 19607 ns polarity: normal

platform/fdd70020.pwm, 1 PWM device
 pwm-0   ((null)              ): period: 0 ns duty: 0 ns polarity: normal

platform/fdd70010.pwm, 1 PWM device
 pwm-0   (sysfs               ): requested enabled period: 10000 ns duty: 8000 ns polarity: normal

```

## 3 系统下操作使用
现代 Linux 内核都集成了 PWM 子系统，它通过 ​​Sysfs​​（虚拟文件系统）向用户空间提供统一的控制接口。
```bash
ls /sys/class/pwm/ -l
total 0
lrwxrwxrwx 1 root root 0 6月  20  2024 pwmchip0 -> ../../devices/platform/fdd70010.pwm/pwm/pwmchip0
lrwxrwxrwx 1 root root 0 6月  20  2024 pwmchip1 -> ../../devices/platform/fdd70020.pwm/pwm/pwmchip1
lrwxrwxrwx 1 root root 0 6月  20  2024 pwmchip2 -> ../../devices/platform/fe6e0000.pwm/pwm/pwmchip2
lrwxrwxrwx 1 root root 0 6月  20  2024 pwmchip3 -> ../../devices/platform/fe6e0020.pwm/pwm/pwmchip3
```
设备树每个使能的pwm，都会在此处生成一个pwmchipX目录（注意，此处的序号X不和设备树中的序号一一对应，需要通过类似于`fdd70010.pwm`的设备地址进行对应）。

例如此处，pwmchip0和pwmchip1分别对应设备树下的pwm1和pwm2，这两个pwm是系统下可以直接导出控制的，而另外两个pwmchip是用于背光，无法导出控制。

具体控制方式如下：
```bash
cd /sys/class/pwm/pwmchip0/       # 进入PWM控制器目录
echo 0 > export                   # 启用0号PWM通道
cd pwm0                           # 进入该通道配置目录
echo 10000 > period               # 设置周期为10000纳秒（100kHz）
echo 5000 > duty_cycle             # 设置高电平时间5000纳秒（占空比50%）
echo normal > polarity            # 设置极性为高电平有效
echo 1 > enable                   # 启动PWM输出
```
