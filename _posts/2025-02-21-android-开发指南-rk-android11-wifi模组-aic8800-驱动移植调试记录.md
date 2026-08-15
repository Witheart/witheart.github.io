---
title: "RK Android11 WiFi模组 AIC8800 驱动移植调试记录"
date: 2025-02-21
last_modified_at: 2025-02-21
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/
toc: true
---

概要：本文记录了 RK3568 平台上移植并调试 WiFi6 模组 AIC8800 的过程，涵盖 WiFi 和蓝牙驱动的适配与问题排查。

## 1. 环境
- **WiFi 模组**：BL-M8800DS2-40（基于 AIC8800D40 芯片）  
- **CPU**：RK3568  
- **OS**：Android  

## 2. ko 文件未编译问题
- 驱动代码已放入 `kernel/drivers/net/wireless/aic8800/`
- `defconfig` 已配置：
  ```makefile
  CONFIG_AIC_WLAN_SUPPORT=y
  CONFIG_AIC8800_WLAN_SUPPORT=m
  ```
- 但编译后 `aic8800_bsp.ko`、`aic8800_fdrv.ko` 等未生成
（查看kernel/drivers/net/wireless/aic8800/aic8800_bsp或者kernel/drivers/net/wireless/aic8800/aic8800_fdrv等文件夹，并没有看到编译出来的ko文件）

### 解决方式
- `defconfig` 配置错误，patch 中的 `defconfig` 可能与项目实际 `defconfig` 不符
- 要确保修改的是实际使用的 `defconfig`

## 3. 驱动 Makefile 中配置不正确问题
如果要适配Rockchip平台，以下 4 个驱动目录的 `Makefile` 需要修改：
  ```
  kernel/drivers/net/wireless/aic8800/Makefile
  kernel/drivers/net/wireless/aic8800/aic8800_bsp/Makefile
  kernel/drivers/net/wireless/aic8800/aic8800_btlpm/Makefile
  kernel/drivers/net/wireless/aic8800/aic8800_fdrv/Makefile
  ```

### 解决方式
- 确保 `Makefile` 适配 Rockchip 平台：
  ```makefile
  CONFIG_PLATFORM_ROCKCHIP ?= y
  CONFIG_PLATFORM_ALLWINNER ?= n
  CONFIG_PLATFORM_AMLOGIC ?= n

  ifeq ($(CONFIG_PLATFORM_ROCKCHIP), y)
  ARCH = arm64
  KDIR ?= /home/hw/rk3568_android11_sdk/kernel
  CROSS_COMPILE ?= /home/hw/rk3568_android11_sdk/prebuilts/gcc/linux-x86/aarch64/gcc-linaro/bin/aarch64-linux-gnu-
  ccflags-y += -DANDROID_PLATFORM
  endif
  ```
- **确保 `KDIR` 和 `CROSS_COMPILE` 路径正确**
  - KDIR是内核的路径
  - CROSS_COMPILE是交叉编译器的路径

## 4. aicbsp: sdio_err 报错
- `dmesg` 报错：
```sh
[    5.103268] aicbsp_init
[    5.103303] RELEASE_DATE:2022_0312_1031\x0d
[    5.103752] aicbsp: aicbsp_set_subsys, subsys: AIC_WIFI, state to: 1
[    5.103768] aicbsp: aicbsp_set_subsys, power state change to 1 dure to AIC_WIFI
[    5.103777] aicbsp: aicbsp_platform_power_on
[    5.120128] aicbsp: aicbsp_sdio_probe:1
[    5.120237] aicbsp: aicbsp_sdio_probe:2
[    5.120251] aicbsp: aicbsp_sdio_probe after replace:1
[    5.120387] mmc_host mmc3: Bus speed (slot 0) = 50000000Hz (slot req 50000000Hz, actual 50000000HZ div = 0)
[    5.120403] aicbsp: Set SDIO Clock 50 MHz
[    5.120433] aicbsp: sdio_err:<aicwf_sdio_func_init,1232>: reg:11 write failed!
[    5.120444] aicbsp: sdio_err:<aicbsp_sdio_probe,184>: sdio func init fail
[    5.120494] aicbsp_sdio: probe of mmc3:390b:2 failed with error -34
```

### 4.1 排查过程
**4.1.1 硬件检查**
- 初步怀疑 SDIO 报错与硬件问题相关，因此检查了走线和焊接，未发现异常。
- 进一步测量模块关键 PIN 的电平，数据如下：
  
  | Pin | 作用 | 预期电平 |
  |------|------|----------|
  | PIN12 | PWR_KEY（WiFi 开启） | 高电平（同步 VIO） |
  | PIN9  | VDD33（主电源） | 3.3V |
  | PIN22 | VIO（主控 IO 电平） | 与主控相同 |
  | PIN14-19 | SDIO 相关 | 1.8V（SDIO 3.0 标准） |

- **测量注意事项：**
  - WiFi 打不开是关闭状态时，PIN12 复位 PIN 会被拉低，不能误判为供电问题。
  - PIN9（3.3V 供电）应始终存在。
  - **SDIO 电平需在开机初始化时测量**，因为初始化失败可能导致 SDIO 关闭，进而无法测量正确的电平。

- **结论：**
  - 重要 PIN 电平正常，排除硬件连接问题。

**4.1.2 SDIO 相关问题**
- 发现 `/sys/bus/sdio/devices/` 目录下扫描到两个 **mmc3** 设备：
  ```sh
  mmc3:390b:1
  mmc3:390b:2
  ```
  - 设备树 `aliases` 定义：
    ```dts
    aliases {
        mmc3 = &sdmmc2;
    }
    ```
  - WiFi 确实接到了 `SDMMC2`，设备映射关系正确。

- **查看 `uevent` 信息**
  ```sh
  cat /sys/bus/sdio/devices/mmc3:390b:1/uevent
  SDIO_CLASS=07
  SDIO_ID=C8A1:0082
  MODALIAS=sdio:c07vC8A1d0082
  
  cat /sys/bus/sdio/devices/mmc3:390b:2/uevent
  SDIO_CLASS=07
  SDIO_ID=C8A1:0182
  MODALIAS=sdio:c07vC8A1d0182
  ```
  - 发现 `SDIO_ID=C8A1:0082` 与官方 `patch` 配置的 `VID:PID` **不一致**，一度怀疑读取错误。
  - **查阅资料后发现，其他用户使用 AIC8800 时也读到了相同的 `VID:PID`，说明 SDIO 通信本身是正常的**。

### 4.2 解决方式
**4.2.1 发现 `patch` 可能不适配当前模组**
- 参考了 CSDN 文章：[RK3568 Android11 WiFi6-AIC8800 调试](https://blog.csdn.net/xiezi5235/article/details/135497738)。
- **问题点：**
  - `patch` **仅指示了修改方法**，但其中的驱动**可能并不适用于当前 WiFi 模组**。
  - 官方提供的驱动包适配多款模组，而 `patch` 仅适用于其中某款，并且**官方更新驱动时不会同步更新 `patch`**。
  - 需要从 `driver_fw` 目录中查找正确的驱动，而非直接使用 `patch` 中的驱动。

- **解决方案：**
  - **向厂家获取最新驱动**（避免使用 `patch` 中的驱动）。
  - **固件需匹配模组型号**：
    - 例如，**BL-M8800DS2-40** 模组应使用 `driver_fw/fw/aic8800D80` 目录下的固件。

---

**4.2.2 编译最新驱动**
- 使用新驱动后，编译报错，修改 `kernel/drivers/net/wireless/aic8800/aic8800_fdrv/rwnx_wakelock.c`：
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-3.png)

- **编译成功后，发现 WiFi 无法自动加载驱动**：
  - 需要**手动加载驱动**进行测试：
    ```sh
    cd /vendor/lib/modules
    insmod aic8800_bsp.ko
    insmod aic8800_fdrv.ko
    lsmod
    ```
  - **如果能手动加载，说明 WiFi 可正常使用**。

---

**4.2.3 WiFi 驱动无法自动加载**
- **可能原因：`VID:PID` 不匹配**
- 需检查 `rk_wifi_ctrl.cpp`：
  ```cpp
  static wifi_device supported_wifi_devices[] = {
      {"AIC8800", "5449:0145"},
  };
  ```
- **解决方案**：
  - 确认 `SDIO_ID` 是否正确：
    ```sh
    cd /sys/bus/sdio/devices
    ls
    cat mmc3:390b:1/uevent
    ```
  - 若 `SDIO_ID` 读出 `C8A1:0082`，则修改 `rk_wifi_ctrl.cpp`，匹配正确的 `VID:PID`。
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-4.png)

至此，WiFi可以正常使用。


## 5. 蓝牙调试
### 5.1 编译错误：`libbt-vendor already defined`
```sh
MODULE.TARGET.SHARED_LIBRARIES.libbt-vendor already defined by hardware/aic xxx
```
这是由于aic的libbt库与其他厂家的库编译出的文件名重复导致的，比如aic与broadcom的libbt都会编译出libbt-vendor.so。

#### 解决过程
- 由于上文的经验，询问厂家后得知，libbt库也不应使用patch中的库，而应该使用driver_fw中的库，所以进行替换，但是要保持patch中定义的目录结构，具体替换红框中的内容：
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-5.png)
直接替换后进行编译，就会报`libbt-vendor already defined`错误。
<br/>

- 刚开始直接将broadcom的libbt编译出的文件名称进行修改，可以成功编译，具体修改如下：
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-6.png)
<br/>

- 但是烧录后，点击蓝牙图标一直显示正在打开，logcat查看日志，发现 `dlopen failed: library "libbt-vendor-aic.so" not found`
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/8616b061-d8be-4d80-83fe-12ba91356bf9.png)
也就是没找到编译出的蓝牙库。
<br/>

- 原因是，driver_fw中的蓝牙库并没有对rochchip平台的适配，编译出来的库名称和配置时的库名称不一致，所以找不到对应的库
配置下面这个文件时
`hardware\interfaces\bluetooth\1.0\default\vendor_interface.cc`
定义了
```c
static const char* VENDOR_AIC_LIBRARY_NAME = "libbt-vendor-aic.so";
```
<br/>

- 所以需要修改编译出的库和这个库名称一致
`hardware/aic/aicbt/libbt/Android.mk`
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-7.png)

### 5.2 蓝牙无法打开问题
- 经过前面 WiFi 适配的修改后，不再出现 `dlopen failed: library "libbt-vendor-aic.so" not found` 的错误。
- **但点击蓝牙图标时，始终显示“正在打开”，无法正常使用**。
<br/>

- **问题与 WiFi 适配类似**：
  - `driver_fw` 目录中的蓝牙库**未针对 Rockchip 平台进行完整适配**。
  - 需要调整 **串口波特率、串口名称、固件路径** 等关键配置。

#### 解决方式
**修改 `bt_vendor_aicbt.h`**
修改为实际串口波特率。
`hardware/aic/aicbt/libbt/include/bt_vendor_aicbt.h`

- **修改串口波特率**：
  ```c
  #define UART_TARGET_BAUD_RATE           1500000
  ```

**修改 `vnd_generic.txt`**
根据实际硬件连接调整。
`hardware/aic/aicbt/libbt/include/vnd_generic.txt`

```txt
BLUETOOTH_UART_DEVICE_PORT = "/dev/ttyS6"
FW_PATCHFILE_LOCATION = "/vendor/etc/firmware/"
```

![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植调试记录/image-9.png)

再次进行编译，蓝牙可以正常使用。
