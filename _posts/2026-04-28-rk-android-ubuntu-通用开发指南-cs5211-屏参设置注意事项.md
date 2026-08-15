---
title: "CS5211 屏参设置注意事项"
date: 2026-04-28
last_modified_at: 2026-04-28
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/cs5211-屏参设置注意事项/
toc: true
---

- 配置前，一定要先确认，要配置的芯片是CH7511还是CS5211，这两者的bin文件不是通用的

- CS5211可选内部晶振，相对应的，屏参bin文件需要配置内部晶振，配置方式如下：

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/cs5211-屏参设置注意事项/PixPin_2026-04-28_15-54-06.png)
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/cs5211-屏参设置注意事项/PixPin_2026-04-28_15-54-27.png)

- 配置生成的bin文件，需要使用SFLY烧录软件，配合烧录器，烧录到EEPROM里面，参考《EEPROM烧写——SFLY 硕飞烧录软件使用方式》
