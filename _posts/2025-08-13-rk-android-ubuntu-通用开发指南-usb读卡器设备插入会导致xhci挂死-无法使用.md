---
title: "USB读卡器设备插入会导致XHCI挂死，无法使用"
date: 2025-08-13
last_modified_at: 2025-08-13
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/usb读卡器设备插入会导致xhci挂死-无法使用/
toc: true
---

概要：本文记录了在 rk3568 平台的 Android 11 系统中，插入特定 USB 读卡器后导致 XHCI 控制器挂死的问题。通过日志分析与 Rockchip 官方技术支持配合，最终通过 HID 驱动补丁规避了问题，确保系统稳定运行。  


## 1. 环境信息  

- **平台**：rk3568  
- **操作系统**：Android 11  
- **设备类型**：USB读卡器  

---

## 2. 问题描述  

在 USB 接口确认正常的情况下，插入 USB 读卡器设备时，系统出现 XHCI 控制器挂死的问题。

### 日志信息  

```log
[   94.297185] usb 5-1.3: new full-speed USB device number 4 using xhci-hcd
...
[  104.803919] xhci-hcd xhci-hcd.1.auto: xHCI host not responding to stop endpoint command.
[  104.814182] xhci-hcd xhci-hcd.1.auto: xHCI host controller not responding, assume dead
[  104.814344] xhci-hcd xhci-hcd.1.auto: HC died; cleaning up
```

此问题出现后，同一个资源上的 USB 均无法恢复，例如通过该资源连接的 USB Hub 上的鼠标键盘也失效。

---

## 3. 解决过程  

### 3.1 初步排查  

1. **rk3568 平台**：  
   - 红框资源有问题  
   - 绿框资源正常  
   ![rk3568资源图](/assets/images/rk-android-ubuntu-通用开发指南/usb读卡器设备插入会导致xhci挂死-无法使用/PixPin_2025-08-12_16-33-47.png)

2. **rk3588 平台**：  
   - 同样红框资源有问题  
   - 绿框资源正常  
   ![rk3588资源图](/assets/images/rk-android-ubuntu-通用开发指南/usb读卡器设备插入会导致xhci挂死-无法使用/PixPin_2025-08-12_16-37-38.png)

---

### 3.2 尝试修复  

- 在 rk3568 平台加入补丁，**问题未解决**  
  ```text
  0001-phy-rockchip-naneng-combphy-Fix-Rx-squelch-for-RK356.patch  
  USB_HC_Died_workaroud_patch.7z
  ```

- 使用 Rockchip 提供的 PHY Tuning 工具调整 BOOST Level，**仍无法解决问题**  
  - 工具地址：[Rockchip_USB_SQ_Tool_V1.8.1.7z](https://redmine.rock-chips.com/documents/113)

---

### 3.3 Rockchip 官方反馈  

经 Rockchip 分析，该 USB 读卡器（Vendor ID：0xFFFF，Product ID：0x0035）存在 HID 协议兼容性问题：

- 触发 XHCI 异常的根因：
  - HID 驱动检测到 USB Reader 支持 Keyboard Protocol 后，发送了 set LED 控制请求。
  - USB Reader 在 status state 应答中的 data toggle 错误（应答了 DATA0 PID 而非 DATA1 PID），违反 USB 协议，导致 XHCI 控制器异常挂死。

---

### 3.4 官方建议的补丁  

为避免向 USB Reader 发送 LED 控制请求，Rockchip 提供如下补丁：

```diff
diff --git a/kernel/drivers/hid/usbhid/hid-core.c b/kernel/drivers/hid/usbhid/hid-core.c
index 7d1060e4cb..44c4ccd5a1 100644
--- a/kernel/drivers/hid/usbhid/hid-core.c
+++ b/kernel/drivers/hid/usbhid/hid-core.c
@@ -1190,7 +1190,10 @@ static int usbhid_start(struct hid_device *hid)
 	if (interface->desc.bInterfaceSubClass == USB_INTERFACE_SUBCLASS_BOOT &&
 			interface->desc.bInterfaceProtocol ==
 				USB_INTERFACE_PROTOCOL_KEYBOARD) {
-		usbhid_set_leds(hid);
+		if (dev->product && !strncasecmp(dev->product, "USB Reader", 10))
+			dev_info(&hid->dev, "Ignore set Led for USB Reader\n");
+		else
+			usbhid_set_leds(hid);
 		device_set_wakeup_enable(&dev->dev, 1);
 	}
```

- 加入该补丁后，问题成功解决。

---

## 4. 适用设备信息  

```log
Vendor ID                : 0xFFFF (Taiwan OEM - OBSOLETE)  
Product ID               : 0x0035  
Manufacturer String      : "SDZNKJLDT"  
Product String           : "USB Reader"
```

---

## 5. 总结  

该问题由 USB Reader 的协议实现缺陷导致，补丁通过识别设备字符串方式规避了 set LED 请求，从而避免 XHCI 控制器挂死。建议对类似设备进行兼容性评估，并在内核中增加识别逻辑以确保系统稳定性。
