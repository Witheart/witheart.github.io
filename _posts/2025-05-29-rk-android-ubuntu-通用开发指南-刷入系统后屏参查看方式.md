---
title: "刷入系统后屏参查看方式"
date: 2025-05-29
last_modified_at: 2025-05-29
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/刷入系统后屏参查看方式/
toc: true
---

## 接入 debug口，开机上电查看日志
可以看到对应的日志
```bash
Using display timing dts
edp@fded0000:  detailed mode clock 58460 kHz, flags[a]
    H: 1024 1072 1104 1224
    V: 0768 0771 0775 0796
bus_format: 100a
VOP update mode to: 1024x768p60, type: eDP1 for VP1
VP1 set crtc_clock to 57692KHz
VOP VP1 enable Esmart1[544x144->544x144@240x312] fmt[1] addr[0xedf3a000]
troy test get vcc_5v : -2
troy test get vddio-mipi : -2
nodka_lvds_index = 6
lvds_gpio0 : 1
lvds_gpio1 : 0
lvds_gpio2 : 0
lvds_gpio3 : 1
Link Training success!
final link rate = 0x0a, lane count = 0x02
disp info 0, type:11, id:0
base_parameter.mode:1920x1080
color_format:0
hdmi_select_link_config use tmds mode
mode:1920x1080 bus_format:0x100a
hdmi@fde80000:  detailed mode clock 148500 kHz, flags[5]
    H: 1920 2008 2052 2200
    V: 1080 1084 1089 1125
bus_format: 100a
VOP update mode to: 1920x1080p60, type: HDMI0 for VP0
```

## 使用命令
```bash
cat /sys/kernel/debug/dri/0/state
```

输出如下：
```bash
crtc[71]: video_port0
        enable=1
        active=1
        self_refresh_active=0
        planes_changed=1
        mode_changed=0
        active_changed=0
        connectors_changed=0
        color_mgmt_changed=0
        plane_mask=30
        connector_mask=4
        encoder_mask=4
        mode: "1920x1080": 60 148500 1920 2008 2052 2200 1080 1084 1089 1125 0x48 0x5
crtc[93]: video_port1
        enable=1
        active=1
        self_refresh_active=0
        planes_changed=1
        mode_changed=0
        active_changed=0
        connectors_changed=0
        color_mgmt_changed=0
        plane_mask=40
        connector_mask=2
        encoder_mask=2
        mode: "1024x768": 65 70000 1024 1072 1104 1344 768 771 783 806 0x48 0xa
```
