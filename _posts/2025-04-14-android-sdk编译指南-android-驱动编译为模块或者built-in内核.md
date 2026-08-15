---
title: "Android 驱动编译为模块或者built-in内核"
date: 2025-04-14
last_modified_at: 2025-04-14
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/android-驱动编译为模块或者built-in内核/
toc: true
---

## 1. 模块化编译（生成独立KO文件）

### 1.1 驱动目录创建
在内核源码树中创建专用目录：
```bash
mkdir -p kernel/drivers/net/can/usb/${YOUR_DRIVER_DIR}/
```
*注：建议选择合理的目录结构，通常位于对应子系统目录下*

### 1.2 模块化编译配置
创建模块专用Makefile（路径示例）：
```makefile
KERNEL_SRC = ${ANDROID_KERNEL_SOURCE_PATH}
EXTRA_CFLAGS += -I$(KERNEL_SRC)/drivers/net/can/usb/${YOUR_DRIVER_DIR}
obj-m += ${DRIVER_NAME}.o

all:
    $(MAKE) -C $(KERNEL_SRC) M=$(PWD) modules

clean:
    $(MAKE) -C $(KERNEL_SRC) M=$(PWD) clean
```

### 1.3 交叉编译环境配置
```bash
export ARCH=${TARGET_ARCH}  # 如arm64
export CROSS_COMPILE=${TOOLCHAIN_PATH}/bin/${TARGET_PREFIX}- 
export PATH=$PATH:${TOOLCHAIN_PATH}/bin
```

### 1.4 执行模块编译
在驱动目录下运行：
```bash
make -j$(nproc)
```
生成产物：`${DRIVER_NAME}.ko`

---

## 2. 内核集成编译（直接编译进内核）

### 2.1 内核配置修改
添加Kconfig配置项：
```kconfig
# 文件位置参考：kernel/drivers/net/can/usb/Kconfig
config CAN_USB_${DRIVER_ID}
    tristate "${DRIVER_DESCRIPTION}"
    depends on USB
    help
        Driver support for ${DEVICE_DESCRIPTION}
```

### 2.2 构建系统集成
修改父目录Makefile：
```makefile
# 文件位置示例：kernel/drivers/net/can/usb/Makefile
obj-$(CONFIG_CAN_USB_${DRIVER_ID}) += ${YOUR_DRIVER_DIR}/
```

修改模块专用Makefile（路径示例）：
```makefile
obj-$(CONFIG_CAN_USB_${DRIVER_ID}) += ${DRIVER_NAME}.o
```

### 2.3 内核编译配置
通过menuconfig启用驱动：
```bash
make menuconfig
```
配置路径示例：
```
Device Drivers 
  → Network device support 
    → CAN 
      → USB CAN adapters 
        → <*> ${DRIVER_NAME}
```

### 2.4 整个系统编译
