---
title: "Fintek USB 转双 CAN 模块驱动编译——供 Android 下独立编译 ko 文件参考"
date: 2025-04-10
last_modified_at: 2025-04-10
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/fintek-usb-转双-can-模块驱动编译-供-android-下独立编译-ko-文件参考/
toc: true
---

概要：本文详细介绍了在 Android 系统下为 Fintek F81604 USB 转双 CAN 模块编译驱动 ko 文件的步骤，包括驱动目录的创建、Makefile 的修改、内核构建系统的调整以及编译和加载驱动的具体操作。


## 1. 模块介绍

### 1.1 产品链接

- [Fintek F81604 USB-to-CAN 适配器](https://www.fintek.com.tw/index.php/zh-tw/products/prod-bg/bg-can/f81604)

### 1.2 官方文档说明

- 官方文档中，驱动编译是在 Linux 下进行的，但原理相似，只需修改内核路径和交叉编译器路径。

---

## 2. 驱动编译步骤

### 2.1 创建驱动目录

- 在内核源码树中创建以下目录：
  ```bash
  mkdir -p kernel/drivers/net/can/usb/fintek/
  ```

### 2.2 修改驱动 Makefile

- 修改驱动 `Makefile` ：

  ```makefile
  KERNEL_SRC = /home/hw/hdd/rk3568_test/rk3568/rk3568_rk_android11.0_sdk/kernel
  EXTRA_CFLAGS += -I$(KERNEL_SRC)/drivers/net/can/usb/fintek
  obj-m += f81604.o

  all:
      $(MAKE) -C $(KERNEL_SRC) M=$(PWD) modules

  clean:
      $(MAKE) -C $(KERNEL_SRC) M=$(PWD) clean
  ```

### 2.3 放置驱动文件

- 将以下文件复制到新建目录：
  - `f81604.c`
  - `sja1000.h`
  - `Makefile`

### 2.4 修改内核构建系统

- 编辑 `kernel/drivers/net/can/usb/Kconfig` 文件，添加以下内容：

  ```kconfig
  config CAN_FINTEK_F81604
      tristate "Fintek F81604 USB-to-CAN adapter"
      depends on USB
      help
          Driver for Fintek F81604 USB to CAN-Bus adapters
  ```

- 编辑 `kernel/drivers/net/can/usb/Makefile` 文件，添加以下内容：
  ```makefile
  obj-$(CONFIG_CAN_FINTEK_F81604) += fintek/
  ```

---

## 3. 配置编译环境

### 3.1 设置环境变量

- 运行以下命令设置交叉编译环境变量：
  ```bash
  export ARCH=arm64
  export CROSS_COMPILE=/home/hw/hdd/rk3568_test/rk3568/rk3568_rk_android11.0_sdk/prebuilts/gcc/linux-x86/aarch64/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu/bin/aarch64-linux-gnu-
  export PATH=$PATH:/home/hw/hdd/rk3568_test/rk3568/rk3568_rk_android11.0_sdk/prebuilts/gcc/linux-x86/aarch64/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu/bin/
  ```

---

## 4. 编译执行

### 4.1 配置内核（可选）

- 如果需要手动启用驱动，运行以下命令：
  ```bash
  make menuconfig
  ```
  - 路径：`Device Drivers -> Network device support -> CAN -> USB CAN adapters`
  - 选择 `<M> Fintek F81604`

### 4.2 执行编译

- 在驱动目录下运行以下命令：
  ```bash
  make
  ```

### 4.3 获取编译产物

- 生成的 `f81604.ko` 文件位于当前目录。

---

## 5. 设备端操作

### 5.1 推送 KO 文件到设备

- 使用以下命令将编译好的 ko 文件推送到设备：
  ```bash
  adb root
  adb remount
  adb push f81604.ko /vendor/lib/modules/
  ```

### 5.2 加载驱动

- 在设备上运行以下命令加载驱动：
  ```bash
  adb shell
  insmod /vendor/lib/modules/f81604.ko
  dmesg | grep f81604  # 查看加载日志
  ```

### 5.3 成功加载示例

- 加载成功的日志示例：
  ```bash
  [  720.940280] usb 5-1.3: new full-speed USB device number 4 using xhci-hcd
  [  721.147773] usb 5-1.3: New USB device found, idVendor=2c42, idProduct=1709, bcdDevice= 0.01
  [  721.147796] usb 5-1.3: New USB device strings: Mfr=1, Product=2, SerialNumber=3
  [  721.147803] usb 5-1.3: Product: USB TO CANBUS BRIDGE
  [  721.147810] usb 5-1.3: Manufacturer: FINTEK
  [  721.147815] usb 5-1.3: SerialNumber: 88635600168801
  [  721.228881] f81604_probe: Fintek F81604 driver version: v1.21
  [  721.284399] f81604 5-1.3:1.0: Channel #0 registered as can2
  [  721.343408] f81604 5-1.3:1.0: Channel #1 registered as can3
  ```

### 5.4 验证设备节点

- 运行以下命令验证设备节点是否正确创建：
  ```bash
  ls /sys/class/net/can*
  ```
  或者：
  ```bash
  ifconfig -a
  ```
  - 如果成功，可以看到新增的 CAN 节点。
