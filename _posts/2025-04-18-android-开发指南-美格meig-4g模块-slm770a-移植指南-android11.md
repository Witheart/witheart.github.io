---
title: "美格MEIG 4G模块 SLM770A 移植指南——Android11"
date: 2025-04-18
last_modified_at: 2025-04-18
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/美格meig-4g模块-slm770a-移植指南-android11/
toc: true
---

概要：本文详细介绍了美格MEIG 4G模块SLM770A在RK3568 Android11平台上的移植步骤，包括内核配置、驱动适配、权限设置、动态加载ril库以及常见问题解决方法。  


## 1. 硬件与通信方式  

- **硬件接口**：4G模块使用Mini PCIE插槽，但实际通过USB进行通信。  
- **虚拟串口**：一个USB接口被虚拟化为4个串口，以 `/dev/ttyUSB*` 的形式显示。  

---

## 2. 移植步骤  

### 2.1 内核支持  
在内核中启用USB串口的相关支持。  

### 2.2 添加vid和pid信息  
在 `drivers/usb/serial/option.c` 文件中添加模块的 `vid` 和 `pid` 信息。  

### 2.3 设置设备节点权限  
在 `ueventd.rc` 文件中设置 `/dev/ttyUSB*` 节点的权限。  

### 2.4 更换ril库  
将当前使用的 `ril.so` 库替换为厂商提供的 `ril.so` 库。  

### 2.5 添加网口驱动  
添加各类网口驱动，例如 `ppp`、`GobiNet&NCM`、`NCM`、`RNDIS`、`ECM`。  

### 2.6 添加sepolicy权限  
为相关进程添加 `sepolicy` 权限。  

### 2.7 添加HIDL配置  
在设备的HIDL配置文件中添加相关配置。  

### 2.8 配置移动网络支持  
在 `frameworks/base/core/res/res/values/config.xml` 文件中添加移动网络支持，可能会被 `overlay` 覆盖。  

---

## 3. 适配问题及解决方法  

### 3.1 ttyUSB节点没有生成  
#### 可能原因：  
1. **硬件问题**：模块是否上电？USB是否连接正常？  
2. **驱动未加载**：检查 `dmesg | grep option` 是否有 `usbcore: registered new interface driver option`。  
3. **vid/pid不匹配**：模块实际的 `vid` 和 `pid` 与 `option.c` 中设定的不一致。  

#### 解决方法：  
- 查看模块的 `vid` 和 `pid`：  
  ```bash
  cd /sys/bus/usb/devices
  grep -l 2dee */idVendor
  cat */idProduct
  ```  
  美格模块的 `vid` 为 `2dee`，实际读取到的 `pid` 为 `4d59`，而非官方默认的 `4d57` 或 `4d58`。  

- 修改 `drivers/usb/serial/option.c` 文件：  
  ```c
  #define MEIG_PRODUCT_A_ECM			0x4D59
  ```  
  修改后重新编译内核，`/dev` 下会生成4个 `ttyUSB` 设备。  

---

### 3.2 更换厂商提供的ril库  

#### 修改逻辑：  
在 `hardware/ril/rild/rild.c` 的 `main` 函数中，根据 `checkWirelessModule()` 返回值动态加载不同的 `ril` 库。  

#### 添加代码：  
在 `checkWirelessModule()` 中添加：  
```c
if (strstr(fileBuf, "2dee") != NULL) {
    ret = 7;
    break;
}
```  

在 `main` 函数中添加：  
```c
else if (ret == 7) // 美格vid：2dee
{
    rilLibPath = "/vendor/lib64/libmeig-ril.so";
    break;			
}
```  

#### 同步编译：  
在 `vendor/rockchip/common/phone/phone.mk` 中添加：  
```makefile
PRODUCT_COPY_FILES += \
$(CUR_PATH)/phone/lib/libmeig-ril.so:vendor/lib64/libmeig-ril.so
```  
这样这个文件在系统编译的时候就会同步复制到系统中vendor/lib64/下
---

### 3.3 节点读取权限  

实际使用的 `ueventd` 配置文件为：  
```
device/rockchip/common/ueventd.rockchip.rc
```  

---

### 3.4 添加HIDL配置  

#### 配置文件：  
- `device/rockchip/common/4g_modem/manifest.xml`  

#### 引用方式： 
device/rockchip/common/BoardConfig.mk  
```makefile
BOARD_HAS_RK_4G_MODEM ?= true

ifeq ($(strip $(BOARD_HAS_RK_4G_MODEM)),true)
DEVICE_MANIFEST_FILE += device/rockchip/common/4g_modem/manifest.xml
endif
```  

---

### 3.5 添加移动网络支持  

#### 配置文件：  
- `frameworks/base/core/res/res/values/config.xml`  
- `device/rockchip/common/overlay/frameworks/base/core/res/res/values/config.xml`  
- `device/rockchip/rk356x/rk3568_HW/overlay/frameworks/base/core/res/res/values/config.xml`  

#### 生效文件：  
最具体的文件为 `device/rockchip/rk356x/rk3568_HW/overlay/frameworks/base/core/res/res/values/config.xml`。  
没有实际测试

---

## 4. 端口切换问题  

### 问题描述：  
配置完成后，模块无法上网，插入SIM卡显示未读取到SIM卡。日志中显示：  
```
E/RIL-DEV (  348): Cannot find Meig devices
```  

### 解决方法：  
- 确认 `pid` 是否正确：经厂商FAE确认，`4D59` 对应 MBIM 模式。  
- 使用 AT 指令切换模块端口模式为RNDIS：  
  ```bash
  echo -e "AT+SER=3,1\r\n" > /dev/ttyUSB2
  ```  
  切换完成后，信息会保存在模块中，无需再次执行。  

### 验证：  
切换完成后，模块可正常识别SIM卡并连接网络，获取到的IP地址为 `192.168.x.x`（局域网IP）。
