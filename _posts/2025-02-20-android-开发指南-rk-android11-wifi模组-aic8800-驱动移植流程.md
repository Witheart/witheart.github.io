---
title: "RK Android11 WiFi模组 AIC8800 驱动移植流程"
date: 2025-02-20
last_modified_at: 2025-02-20
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-android11-wifi模组-aic8800-驱动移植流程/
toc: true
---

概要：本文介绍了基于 AIC8800D40 芯片的 WiFi6 模组 BL-M8800DS2-40 在 RK3568 平台上的驱动移植流程。主要涉及环境搭建、驱动代码分析、设备树修改、驱动编译配置、蓝牙库集成、wpa_supplicant 配置及 WiFi HAL 适配等内容，并提供详细的移植步骤和注意事项。 

## 1. 环境
- **WiFi 模组**：BL-M8800DS2-40（基于 AIC8800D40 芯片）  
- **CPU**：RK3568  
- **OS**：Android  

## 2. WiFi芯片与WiFi模组的区别
- **WiFi 芯片**：核心部件，集成射频前端、基带处理器、数字信号处理等功能。  
- **WiFi 模组**：基于 WiFi 芯片的完整无线通信组件，包含天线、外围电路、接口等。  

AIC8800 属于 WiFi 芯片，而本次移植的 WiFi 模组是 BL-M8800DS2-40（基于 AIC8800D40）。  
[WiFi6 模组_必联（LB-LINK）官方网站](https://www.b-link.net.cn/products_38_module_WiFi6.html)  

![WiFi 模组](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植流程/image.png)  

## 3. AIC8800 驱动代码包详解
### 3.1 驱动代码包结构
厂家送样后，需要获取最新的驱动代码包，并确保版本与模组匹配。驱动代码版本错误可能引发诸多问题。 
![alt text](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植流程/image-1.png)

### 3.2 Patch 注意事项
在 **SDIO\patch\for_Rockchip\3566\Android11** 目录下，提供了 Rockchip 平台的移植补丁（更像是移植成功的参考案例，不同wifi芯片还要具体配置），移植过程中需对比 **mod** 和 **orig** 文件夹的区别，可利用 **git** 进行差异分析。


>在移植过程中需要注意一个问题：**patch 仅仅指示了需要修改哪些文件以及具体的修改方法**，但其中的驱动可能并不适用于你手头的模组。原因在于，**官方提供的驱动包适用于多款模组，而 patch 仅是其中某款模组的案例**，并且**官方更新驱动时，并不会同步更新 patch 中的驱动**。
>
>因此，在移植时可以参考 patch 进行修改，对于驱动适配系统的相关配置，一般无需更改。而对于**新增的驱动文件**，应在 `driver_fw` 文件夹中查找正确的驱动文件进行添加，而不是直接使用 patch 中的文件。

### 3.3 Patch 使用方法

在使用 **patch** 进行移植时，主要是**对比 `mod` 文件夹和 `orig` 文件夹的区别**，然后在你的源码中进行相应的配置修改。直接手动对比可能比较繁琐，因此可以借助 **Git** 进行对比分析。

---
#### **3.3.1. 初始化 Git 仓库**
首先，在 `orig` 文件夹中初始化一个 Git 仓库.
接着，找到 `mod` 相比 `orig` **新增的文件**，通常包含以下三部分：

1. **模组固件**：  
   - 主要是厂家编译好的二进制 `.bin` 文件以及 `.txt` 配置文件。  
2. **模组驱动**：  
   - 用于与内核交互，主要是 `.c` 源码文件，编译后生成 `.ko` 驱动文件。  
3. **模组库**：  
   - 例如 `libbt` 之类的库，编译后生成 `.so` 共享库文件。  

---

#### **3.3.2. 删除 `mod` 中的新增文件**
由于我们只关心 **源码的修改内容**，而这些新增的二进制文件、驱动和库文件**无需对比修改，仅需直接复制**，所以应当先删除 `mod` 中的新增文件

**原因：**  
- 这些新增文件会导致 Git 对比时产生大量无关内容，影响分析。  
- **厂商在更新驱动时，不会同步更新 `patch` 中的驱动**，直接使用 `patch` 提供的驱动可能会导致 **bug**。  
**（别问为什么知道的，踩坑经验）**  

---

#### **3.3.3. 进行 Git 对比**
删除新增文件后，将 `mod` 文件夹的内容 **覆盖** `orig`，然后使用 Git 进行对比：

---

### **⚠ VSCode 的 Git 对比 Bug**
> **坑点提醒：**  
> **VSCode 的 Git 对比窗口** 在路径长度超过 **219 个字符** 时，**不会显示差异**，容易导致遗漏修改。
>  
> **参考 Issue：**  
> [Git diff does not show files with long paths in Source Control View (Windows) #240770](https://github.com/microsoft/vscode/issues/240770)  


## 4 设备树（DTS）修改

此处主要是参考RK官方文档去修改
> 01、Linux\Linux\Wifibt\Rockchip_Developer_Guide_Linux_WIFI_BT_CN.pdf
> 02、Android\android\wifi\Rockchip_Introduction_WIFI_Configuration_CN&EN.pdf
> 02、Android\common\MMC\Rockchip_Developer_Guide_SDMMC_SDIO_eMMC_CN.pdf

### 4.1 蓝牙部分 
```dts
&wireless_bluetooth {
	compatible = "bluetooth-platdata";
	clocks = <&rk809 1>;
	clock-names = "ext_clock";
	uart_rts_gpios = <&gpio2 RK_PB1 GPIO_ACTIVE_LOW>;
	pinctrl-names = "default", "rts_gpio";
	pinctrl-0 = <&uart8m0_rtsn>;
	pinctrl-1 = <&uart8_gpios>;
	BT,reset_gpio    = <&gpio3 RK_PD5 GPIO_ACTIVE_LOW>;
	status = "okay";
};

wireless-bluetooth {
    uart8_gpios: uart8-gpios {
        rockchip,pins = <2 RK_PB1 RK_FUNC_GPIO &pcfg_pull_none>;
    };
};
```
- 这里比较重要的是BT,reset_gpio，这个模块的34脚，PWR_BT，根据描述来看，高电平时蓝牙部分关闭，低电平时蓝牙部分开启
- 但是此部分的配置不一定是最终生效的版本，最终还要看驱动里是怎么处理的，有的驱动会对电平作反相处理，所以这部分可以GPIO_ACTIVE_LOW和GPIO_ACTIVE_HIGH都试试看
- UART 配置： 确保蓝牙与 CPU 通过 UART8 进行通信。

### 4.2 WiFi 部分 
```dts
sdio_pwrseq: sdio-pwrseq {
    compatible = "mmc-pwrseq-simple";
    clocks = <&rk809 1>;
    clock-names = "ext_clock";
    pinctrl-names = "default";
    pinctrl-0 = <&wifi_enable_h>;

    /*
        * On the module itself this is one of these (depending
        * on the actual card populated):
        * - SDIO_RESET_L_WL_REG_ON
        * - PDN (power down when low)
        */
    post-power-on-delay-ms = <200>;
    reset-gpios = <&gpio3 RK_PD4 GPIO_ACTIVE_LOW>;
};
```
重点配置 **WiFi reset-gpios**，确保正确的电源控制。  
```dts
wireless_wlan: wireless-wlan {
    compatible = "wlan-platdata";
    rockchip,grf = <&grf>;
    wifi_chip_type = "AIC8800";
    status = "okay";
};
```
此处的WiFi芯片名称的配置，应该和frameworks\opt\net\wifi\libwifi_hal\rk_wifi_ctrl.cpp
这个文件中的
static wifi_device supported_wifi_devices[]中配置的名称一致（至少前三个字符要为AIC）

```dts
&sdmmc2 {
        max-frequency = <150000000>;
        supports-sdio;
        bus-width = <4>;
        disable-wp;
        cap-sd-highspeed;
        cap-sdio-irq;
        keep-power-in-suspend;
        mmc-pwrseq = <&sdio_pwrseq>;
        non-removable;
        pinctrl-names = "default";
        pinctrl-0 = <&sdmmc2m0_bus4 &sdmmc2m0_cmd &sdmmc2m0_clk>;
        sd-uhs-sdr104;
        status = "okay";
};
```
- sd-uhs-sdr104表示支持sdio3.0

## 5. 驱动部分
- 添加驱动文件，也就是`SDIO\driver_fw\driver\aic8800`下所有文件添加到
`kernel\drivers\net\wireless\aic8800`

- 然后在同级目录下的mk文件中添加编译选项，通过CONFIG_AIC_WLAN_SUPPORT宏定义控制是否编译aic8800/目录下的内容
```makefile
kernel\drivers\net\wireless\Makefile
obj-$(CONFIG_AIC_WLAN_SUPPORT) += aic8800/
```

- 并且在同级目录下的kconfig中，引用aic8800/目录下的Kconfig文件，用于增加menuconfig中的aic8800驱动编译选项
```Kconfig
source "drivers/net/wireless/aic8800/Kconfig"
```

- 配置内核编译配置文件kernel\arch\arm64\configs\rockchip_defconfig，请修改你实际上应用的内核编译配置文件
```config
CONFIG_AIC_WLAN_SUPPORT=y
CONFIG_AIC_FW_PATH="/vendor/etc/firmware"
CONFIG_AIC8800_WLAN_SUPPORT=m
```
- 
    - CONFIG_AIC_WLAN_SUPPORT用于控制编译这个驱动
    - CONFIG_AIC_FW_PATH用于配置模组固件存放的位置，固件最后会被复制到配置的这个位置
    - CONFIG_AIC8800_WLAN_SUPPORT说明驱动将不会被编译进内核，而是以模块的形式动态插入（如果是以模块的形式动态插入，内核将根据sdio读到的vid和pid匹配不同的模块进行加载）

- 在`vendor\rockchip\common\wifi\wifi.mk`文件中，添加编译出来的ko文件的路径，因为是动态加载ko文件的，所以ko文件编译出来后，将被复制到`/vendor/lib/modules`路径下进行动态加载
```makefile
AIC_WIFI_KO_FILES := $(shell find $(TOPDIR)kernel/drivers/net/wireless/aic8800 -name "*.ko" -type f)
BOARD_VENDOR_KERNEL_MODULES += \
$(foreach file, $(AIC_WIFI_KO_FILES), $(file))
```
此处的配置用于找到编译出的ko文件

- 配置Android 启动时用于加载内核模块（.ko） 的配置文件
device\rockchip\common\init.insmod.cfg
加入
```cfg
insmod /vendor/lib/modules/aic8800_bsp.ko
```

- 最终会编译出三个ko文件，分别是
aic8800_bsp.ko  aic8800_btlpm.ko  aic8800_fdrv.ko
-
    - aic8800_bsp用于模组的初始化等基础功能
    - aic8800_fdrv用于WiFi
    - aic8800_btlpm用于蓝牙
- 移植到RK Android平台时，实际上只加载aic8800_bsp.ko，aic8800_fdrv.ko

## 6. 蓝牙库 libbt 
![蓝牙库](/assets/images/android-开发指南/rk-android11-wifi模组-aic8800-驱动移植流程/image-2.png) 
libbt用于完成对蓝牙模块硬件初始化与控制。

### 6.1 添加蓝牙库文件 
将 **driver_fw\aic\libbt\8800** 目录下所有文件添加到 **hardware\aic\aicbt\libbt** 目录。 

### 6.2 配置编译 libbt
- 在libbt同级目录下添加Android.mk，如果BOARD_HAVE_BLUETOOTH_AIC被配置了，那么子目录下所有makefile都生效
```makefile
ifeq ($(BOARD_HAVE_BLUETOOTH_AIC),true)
LOCAL_PATH := $(call my-dir)
include $(call all-subdir-makefiles)
endif
```
而BOARD_HAVE_BLUETOOTH_AIC在device\rockchip\common\wifi_bt_common.mk这个mk文件中定义
```makefile
BOARD_HAVE_BLUETOOTH_AIC := true
```
<br/>

- 同样的，在libbt同级目录下添加aicbt.mk文件
```makefile
CUR_PATH := hardware/aic/aicbt

BOARD_HAVE_BLUETOOTH := true

PRODUCT_PACKAGES += \
	libbt-vendor-aic
```
PRODUCT_PACKAGES += libbt-vendor-aic 定义了 libbt-vendor-aic 这个包，用于指定需要编译并包含到最终镜像

>注意，此处有一个坑点，需要保证libbt中Android.mk中的LOCAL_MODULE与PRODUCT_PACKAGES一致，原厂的patch由于没有更新，这两者不一致

```makefile
hardware\aic\aicbt\libbt\Android.mk

LOCAL_MODULE := libbt-vendor-aic
LOCAL_MODULE_TAGS := optional
LOCAL_MODULE_CLASS := SHARED_LIBRARIES
LOCAL_MODULE_OWNER := aic
LOCAL_PROPRIETARY_MODULE := true
```
LOCAL_MODULE 是用于定义模块名称，也就是最终会编译出libbt-vendor-aic.so这个模块。

## 7. wpa_supplicant 配置  
### 7.1 wpa_supplicant 概念
wpa_supplicant 是一个用于管理 WiFi 连接的用户空间守护进程，主要负责：

- 处理 WPA/WPA2 认证
- 管理 WiFi 连接（扫描、连接、断开）
- 支持 WiFi Direct（P2P）
- 通过 socket 接口与 Android WiFi 框架交互

### 7.2 wpa_supplicant 具体配置
**配置aic模块的wpa配置，设置aic模块的启动参数**
`device\rockchip\common\wpa_config.txt`
添加
```txt
[aic]
/vendor/bin/hw/wpa_supplicant
-O/data/vendor/wifi/wpa/sockets
-puse_p2p_group_interface=1
-g@android:wpa_wlan0
```
- 
    - `[aic]`：表示该配置适用于 AIC WiFi 模块。
    - `/vendor/bin/hw/wpa_supplicant`：指定 wpa_supplicant 的可执行文件路径。
    - `-O/data/vendor/wifi/wpa/sockets`：指定 wpa_supplicant 使用的 socket 目录，通常用于与其他组件（如 hostapd 或 Android WiFi 框架）通信。
    - `-puse_p2p_group_interface=1`：启用 P2P 组接口支持，允许 WiFi Direct 功能。
    - `-g@android:wpa_wlan0`：定义全局控制接口，@android:wpa_wlan0 允许 Android 通过 wpa_supplicant 进行 WiFi 控制

**设置加载wpa_config.txt中的配置**
`external\wpa_supplicant_8\wpa_supplicant\main.c`
```c
#define AIC_MODULE_NAME "[aic]"

else if (0 == strncmp(wifi_type, "AIC", 3)) {
        wpa_printf(MSG_INFO,"Start aic_wpa_supplicant\n");
        ret = read_wpa_param_config(AIC_MODULE_NAME,argv[1]);
}
```
WiFi芯片类型前缀为AIC时，加载对应的aic的wpa_supplicant参数。

## 8. WiFi HAL 配置 
这部分主要是通过配置vid:pid，选择加载不同的库。

### 8.1 动态加载原理
sdio握手成功后，就会读到vid:pid，将读到的数值与已经配置vid:pid比较，动态加载不同的库

### 8.2 具体配置
#### **vid:pid配置**
`frameworks\opt\net\wifi\libwifi_hal\rk_wifi_ctrl.cpp`
supported_wifi_devices 结构体数组中添加WiFi名称以及对应的vid:pid
```cpp
{"AIC8800",	"5449:0145"},
```

- 这里又有一个坑点，patch中提供的这个vid:pid不适用于我这个模组，需要具体配置。
- 获取真正的vid:pid有两种方式，一种是如果WiFi模组正常上电且sdio握手成功，那么是可以通过读/sys/bus/sdio/devices下的设备目录下的uevent文件得到的
```sh
rk3568_HW:/ # cat /sys/bus/sdio/devices/
mmc3:390b:1/   mmc3:390b:2/
rk3568_HW:/ # cat /sys/bus/sdio/devices/mmc3\:390b\:1/uevent
DRIVER=aicwf_sdio
SDIO_CLASS=07
SDIO_ID=C8A1:0082
MODALIAS=sdio:c07vC8A1d0082
rk3568_HW:/ # cat /sys/bus/sdio/devices/mmc3\:390b\:2/uevent
DRIVER=aicbsp_sdio
SDIO_CLASS=07
SDIO_ID=C8A1:0182
MODALIAS=sdio:c07vC8A1d0182
```
这个WiFi模组扫卡成功后可以读到两个mmc设备，分别是mmc3:390b:1/   mmc3:390b:2/，
读取到的mmc3:390b:1设备的vid:pid为C8A1:0082，那么增加这个vid:pid到rk_wifi_ctrl.cpp中即可。
- 二是直接向厂家询问，或在驱动包中寻找


接下来是检测流程，调用check_wifi_chip_type_string(wifi_type)函数，尝试获取wifi芯片类型，保存到wifi_type
frameworks\opt\net\wifi\libwifi_hal\rk_wifi_ctrl.cpp
```cpp
int check_wifi_chip_type_string(char *type)
{
	if (identify_sucess == -1) {
		if (get_wifi_device_id(SDIO_DIR, PREFIX_SDIO) == 0)
			PLOG(DEBUG) << "SDIO WIFI identify sucess";
		else if (get_wifi_device_id(USB_DIR, PREFIX_USB) == 0)
			PLOG(DEBUG) << "USB WIFI identify sucess";
		else if (get_wifi_device_id(PCIE_DIR, PREFIX_PCIE) == 0)
			PLOG(DEBUG) << "PCIE WIFI identify sucess";
		else {
			PLOG(DEBUG) << "maybe there is no usb wifi or sdio or pcie wifi,set default wifi module Brocom APXXX";
			strcpy(recoginze_wifi_chip, "APXXX");
			identify_sucess = 1 ;
		}
	}

	strcpy(type, recoginze_wifi_chip);
	PLOG(ERROR) << "check_wifi_chip_type_string : " << type;
	return 0;
}
```
还未进行识别时，identify_sucess为-1，此时开始使用get_wifi_device_id()获取设备id，依次尝试sdio、usb、pcie设备

get_wifi_device_id()函数中，通过读uevent获取vid:pid，然后用一个for循环，比较已经在supported_wifi_devices中添加的设备vid:pid与读到的vid:pid，有相符的，就将对应的wifi芯片名称复制到recoginze_wifi_chip中，get_wifi_device_id()执行完成之后，会将recoginze_wifi_chip复制到type中，也就是wifi_type。


#### **接下来配置动态加载不同的库**
- 在`frameworks\opt\net\wifi\libwifi_hal\wifi_hal_common.cpp`中，有一个`wifi_load_driver()`函数，调用了`check_wifi_chip_type_string(wifi_type)`函数，尝试获取wifi芯片类型`wifi_type`
- 需要添加wifi ko驱动的路径，以及驱动与wifi类型的对应
`wifi_hal_common.cpp`
```cpp
#define AIC8800_DRIVER_MODULE_PATH         WIFI_MODULE_PATH"aic8800_fdrv.ko"
#define AIC8800_DRIVER_MODULE_NAME       "aic8800_fdrv"
wifi_ko_file_name module_list[] ={
    {"AIC8800",         AIC8800_DRIVER_MODULE_NAME,   AIC8800_DRIVER_MODULE_PATH, UNKKOWN_DRIVER_MODULE_ARG},
}
```
- 定义蓝牙使用的库
在`hardware\interfaces\bluetooth\1.0\default\vendor_interface.cc`中
```c
static const char* VENDOR_AIC_LIBRARY_NAME = "libbt-vendor-aic.so";
```
然后根据wifi芯片类型，得到要加载的库的名称
```c
if ((0 == strncmp(wifi_type, "AIC", 3))) {
    ALOGE("%s try to open %s \n", __func__, VENDOR_AIC_LIBRARY_NAME);
    strcpy(vendor_lib_name, VENDOR_AIC_LIBRARY_NAME);
} 
```
根据这个名称进行加载
```c
lib_handle_ = dlopen(vendor_lib_name, RTLD_NOW);
```

- 根据 Wi-Fi 芯片类型来确定应该使用哪个Wi-Fi 直连（P2P）接口名称
`hardware\interfaces\wifi\1.4\default\wifi_chip.cpp`
```cpp
std::string getP2pIfaceName() {
    std::array<char, PROPERTY_VALUE_MAX> buffer;
	    if (wifi_type[0] == 0) {
	    check_wifi_chip_type_string(wifi_type);
    }
    if (0 == strncmp(wifi_type, "AP", 2) || 0 == strncmp(wifi_type, "AIC", 3)) {
		property_set("vendor.wifi.direct.interface", "p2p-dev-wlan0");
		property_get("wifi.direct.interface", buffer.data(), "p2p-dev-wlan0");
    } else {
		property_set("vendor.wifi.direct.interface", "p2p0");
		property_get("wifi.direct.interface", buffer.data(), "p2p0");
	}
    return buffer.data();
}
```
注：此处的AP应该是AP系列WiFi芯片的意思

## 9. 固件添加
- 主要是厂家编译好的二进制 .bin 文件以及 .txt 配置文件。
- 将厂家给的驱动包中`driver_fw\fw`下具体的固件放置在`vendor\rockchip\common\wifi\firmware`下。

- `BL-M8800DS2-40` 使用 `driver_fw\fw\aic8800D80` 目录下的固件。


---
至此，驱动配置成功，但是在调试过程中还遇到一些问题，详情见另一篇文章。
