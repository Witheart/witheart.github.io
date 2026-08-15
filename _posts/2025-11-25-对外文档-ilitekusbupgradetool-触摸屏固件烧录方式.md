---
title: "ilitekUSBUpgradeTool 触摸屏固件烧录方式"
date: 2025-11-25
last_modified_at: 2025-11-25
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/ilitekusbupgradetool-触摸屏固件烧录方式/
toc: true
---

- 触摸屏断开外部连接，使用USB线，将`触摸屏的USB接口`与`windows主机`连接起来
- 打开软件 `ilitekUSBUpgradeTool_v2.3.5.7.exe`
![alt text](/assets/images/对外文档/ilitekusbupgradetool-触摸屏固件烧录方式/PixPin_2025-11-25_16-47-33.png)

- 点击`Search`开始识别触摸屏设备
- 点击`Load Hex`，选择要下载的触摸屏固件，此处选择`121062D.hex`
- 点击`Upgrade`
![alt text](/assets/images/对外文档/ilitekusbupgradetool-触摸屏固件烧录方式/PixPin_2025-11-25_16-42-28.png)

- 会弹出下载提示框，点击`确定`进行下载
![alt text](/assets/images/对外文档/ilitekusbupgradetool-触摸屏固件烧录方式/PixPin_2025-11-25_16-43-39.png)

- 等待下载完成，会弹出下载完成的提示，此时将usb接回主板，重新开机测试触摸功能是否正常即可
![alt text](/assets/images/对外文档/ilitekusbupgradetool-触摸屏固件烧录方式/PixPin_2025-11-25_16-45-26.png)
