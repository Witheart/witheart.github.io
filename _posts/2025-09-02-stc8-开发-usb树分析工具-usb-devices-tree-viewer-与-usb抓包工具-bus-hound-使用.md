---
title: "USB树分析工具（USB Devices Tree Viewer）与 USB抓包工具（BUS Hound）使用"
date: 2025-09-02
last_modified_at: 2025-09-02
categories:
  - "STC8 开发"
tags:
  - "STC8 开发"
permalink: /stc8-开发/usb树分析工具-usb-devices-tree-viewer-与-usb抓包工具-bus-hound-使用/
toc: true
---

## USB树分析工具（USB Devices Tree Viewer）
该工具用于展示系统读取到的USB设备的详细信息，包括树状结构展示，原始描述符解析等等，对于理解USB设备的结构很有用。如果自行开发的USB设备出了问题，软件也能展示某些字段解析失败的结果，方便了USB的开发。这个工具基于微软的驱动开发工具包开发，官网[https://www.uwe-sieber.de/usbtreeview_e.html](https://www.uwe-sieber.de/usbtreeview_e.html)。
![alt text](/assets/images/stc8-开发/usb树分析工具-usb-devices-tree-viewer-与-usb抓包工具-bus-hound-使用/PixPin_2025-09-02_10-08-00.png)

## USB抓包工具（BUS Hound）
- Devices处勾选要监听的设备（上下级一起选择的时候会导致解析出重复的信息）
![alt text](/assets/images/stc8-开发/usb树分析工具-usb-devices-tree-viewer-与-usb抓包工具-bus-hound-使用/PixPin_2025-09-02_14-53-53.png)


- Setting设置捕获容量和最大的记录长度
![alt text](/assets/images/stc8-开发/usb树分析工具-usb-devices-tree-viewer-与-usb抓包工具-bus-hound-使用/PixPin_2025-09-02_14-55-02.png)

- Capture处会显示抓包解析到的数据，点击Stop后再点击Run，可以清空缓冲区
![alt text](/assets/images/stc8-开发/usb树分析工具-usb-devices-tree-viewer-与-usb抓包工具-bus-hound-使用/PixPin_2025-09-02_14-56-14.png)
