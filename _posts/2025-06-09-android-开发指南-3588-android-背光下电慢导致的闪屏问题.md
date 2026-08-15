---
title: "3588 Android 背光下电慢导致的闪屏问题"
date: 2025-06-09
last_modified_at: 2025-06-09
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3588-android-背光下电慢导致的闪屏问题/
toc: true
---

概要：本篇文章针对 RK3588 Android 系统在关机过程中出现的“闪屏”问题进行分析，确认是由背光下电延迟引起。文章提供了硬件和软件两种解决方案，并详细说明了软件层的修改过程，包括关键代码路径和具体实现方式。


## 1. 问题背景  

客诉 3588 Android 系统下点击关机选项后，在关机过程中出现“闪屏”问题，具体表现为屏幕由黑变白再由白变黑的闪烁一次。

推测是由屏幕下电时序引起。因为板上的 LVDS 接口是通过 7511 芯片，从 eDP 转出 LVDS 信号的，信号不是从 CPU 直接输出，可能存在延迟。

测得时序如下：  
CH1 黄色为 BK_EN  
CH2 绿色为 LVDS 信号 DA_N1  

![背光时序图](439c8e348b59d3a3d73fc2944c4e3d8a_origin(1).jpg)

可以看到背光 EN 在 LVDS 信号消失后还维持了一段时间才消失，应该就是没有屏幕信号而背光却还在导致的闪屏。

---

## 2. 解决思路  

### 2.1 硬件解决  

去除 R101 电阻（相当于不使用 CPU 直出的 eDP 背光信号），使用 R102 电阻（相当于使用 7511 转接芯片的背光信号）。

![硬件修改图](/assets/images/android-开发指南/3588-android-背光下电慢导致的闪屏问题/PixPin_2025-06-09_17-11-26.png)

### 2.2 软件解决  

关机时，立刻将背光 EN 强制拉到地，在 LVDS 信号消失前关闭背光，这样用户就看不到闪烁。

---

## 3. 软件解决过程  

### 3.1 几个重要文件  

- 设备树文件：  
  `kernel-5.10/arch/arm64/boot/dts/rockchip/NK_RK3588.dtsi`  

- 设备树解析文件：  
  `kernel-5.10/drivers/gpu/drm/panel/panel-simple.c`  

- 开关机文件：  
  `system/core/init/reboot.cpp`  

- 开关机服务脚本：  
  `system/core/rootdir/init.rc`  

- eDP Controller 驱动文件路径：
```
kernel:
drivers/gpu/drm/bridge/analogix/analogix_dp_core.c
drivers/gpu/drm/bridge/analogix/analogix_dp_core.h
drivers/gpu/drm/bridge/analogix/analogix_dp_reg.c
drivers/gpu/drm/bridge/analogix/analogix_dp_reg.h
drivers/gpu/drm/rockchip/analogix_dp-rockchip.c
include/drm/bridge/analogix_dp.h

u-boot:
drivers/video/drm/analogix_dp.c
drivers/video/drm/analogix_dp.h
drivers/video/drm/analogix_dp_reg.c
```

- eDP PHY 驱动文件路径：
```
kernel:
drivers/phy/rockchip/phy-rockchip-samsung-hdptx.c

u-boot:
drivers/phy/phy-rockchip-samsung-hdptx.c
```

- eDP Panel 驱动文件路径：
```
kernel:
drivers/gpu/drm/panel/panel-simple.c

u-boot:
drivers/video/drm/rockchip_panel.c
```

---

### 3.2 获取背光 IO  

设备树路径：  
`kernel-5.10/arch/arm64/boot/dts/rockchip/NK_RK3588.dtsi`  

```dtsi
//edp
panel: panel {
    compatible = "simple-panel";
    backlight = <&backlight>;
    power-supply = <&vcc3v3_lcd_n>;

    reset-gpios = <&gpio1 RK_PD2 GPIO_ACTIVE_LOW>; //CH7511_RESET_N_1V8
    edp-bl-en = <&gpio2 RK_PC1 GPIO_ACTIVE_HIGH>; //LCD_BKL_EN_GPIO3_D4_d_3V3

    bus-format = <MEDIA_BUS_FMT_RGB888_1X24>;
    bpc = <8>;
    prepare-delay-ms = <200>;
    enable-delay-ms = <20>;

    lvds-gpio0 = <&gpio2 RK_PC3 GPIO_ACTIVE_HIGH>;
    lvds-gpio1 = <&gpio2 RK_PC5 GPIO_ACTIVE_HIGH>;
    lvds-gpio2 = <&gpio4 RK_PC3 GPIO_ACTIVE_HIGH>;
    lvds-gpio3 = <&gpio4 RK_PC6 GPIO_ACTIVE_HIGH>;
    nodka-lvds = <9>;

    display-timings {
        native-mode = <&timing0>;
        timing0: timing0 {
            clock-frequency = <58460000>;
            hactive = <1024>;
            vactive = <768>;
            hfront-porch = <48>;
            hsync-len = <32>;
            hback-porch = <120>;
            vfront-porch = <3>;
            vsync-len = <4>;
            vback-porch = <21>;
            hsync-active = <0>;
            vsync-active = <0>;
            de-active = <0>;
            pixelclk-active = <1>;           
        };
    };

    port {
        panel_in_edp1: endpoint {
            remote-endpoint = <&edp1_out_panel>;
        };
    };   
};
```

可以看到：
```dtsi
edp-bl-en = <&gpio2 RK_PC1 GPIO_ACTIVE_HIGH>;
```

---

### 3.3 开关机文件中强制下电  

修改文件：`system/core/rootdir/init.rc`  

```diff
diff --git a/system/core/rootdir/init.rc b/system/core/rootdir/init.rc
index be7ad93a87..14ffdd93e1 100644
--- a/system/core/rootdir/init.rc
+++ b/system/core/rootdir/init.rc
@@ -1256,6 +1256,11 @@ on property:security.lower_kptr_restrict=0
 # on shutdown
 # In device's init.rc, this trigger can be used to do device-specific actions
 # before shutdown. e.g disable watchdog and mask error handling
+on shutdown
+    write /sys/class/gpio/export 81
+    write /sys/class/gpio/gpio81/direction "out"
+    chmod 777 /sys/class/gpio/gpio81/value
+    write /sys/class/gpio/gpio81/value 0
```

---
### 3.4 软件解决后时序
![软件解决效果图](1d50382e86144333a402c0ad247c8e08_origin(1).jpg)
