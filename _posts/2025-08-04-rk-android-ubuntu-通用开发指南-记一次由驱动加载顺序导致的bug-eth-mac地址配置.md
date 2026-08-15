---
title: "记一次由驱动加载顺序导致的bug——eth mac地址配置"
date: 2025-08-04
last_modified_at: 2025-08-04
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/记一次由驱动加载顺序导致的bug-eth-mac地址配置/
toc: true
---

## 问题描述
网卡的mac需要在eeprom中读取，但是开机后发现mac并没有正确读取。查看日志如下：
```bash
console:/ # dmesg | grep -i "witheart"
[    2.072022] mpp_service mpp-srv: 32d8116903 author: Witheart 2025-06-04 git init
[    2.134954] [witheart] rk_gmac_probe begin..
[    2.135529] witheart: rk_get_eth_addr !!! \x0a
[    2.135531] witheart: at24_mac_read at24_private==null error
[    2.974292] [witheart] AT24_probe begin..
[   15.604223] [Witheart] test eth led ctrl start(kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c)====== phy_rtl8211f_led_fixup
[   15.604649] [Witheart] test eth led ctrl end====== phy_rtl8211f_led_fixup

```

可以看到网卡获取mac的时机比at24这颗eeprom的时机还早，当然无法从eeprom中正确读取了。

## 方法一：设备树调整
尝试在设备树中声明依赖，没有生效：
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/记一次由驱动加载顺序导致的bug-eth-mac地址配置/PixPin_2025-08-04_19-16-31.png)

## 方法二：调整驱动加载顺序
修改 `at24` 驱动的初始化级别为更高的 **`subsys_initcall`**：
```c
// 在 at24 驱动源码中 (drivers/misc/eeprom/at24.c)
-subsys_initcall(at24_init); // 替换默认的 module_init 或调整已有宏
+core_initcall(at24_init);   // 提升至核心初始化级别
```
结果也没有生效。

## 方法三：内核编译链接顺序控制
将net的链接顺序放到i2c之后
```diff
diff --git a/kernel-5.10/drivers/Makefile b/kernel-5.10/drivers/Makefile
index 21cb5565c1..02a2e8f4f3 100755
--- a/kernel-5.10/drivers/Makefile
+++ b/kernel-5.10/drivers/Makefile
@@ -86,7 +86,7 @@ obj-$(CONFIG_SPI)		+= spi/
 obj-$(CONFIG_SPMI)		+= spmi/
 obj-$(CONFIG_HSI)		+= hsi/
 obj-$(CONFIG_SLIMBUS)		+= slimbus/
-obj-y				+= net/
+# obj-y				+= net/
 obj-$(CONFIG_ATM)		+= atm/
 obj-$(CONFIG_FUSION)		+= message/
 obj-y				+= firewire/
@@ -112,6 +112,7 @@ obj-$(CONFIG_GAMEPORT)		+= input/gameport/
 obj-$(CONFIG_INPUT)		+= input/
 obj-$(CONFIG_RTC_LIB)		+= rtc/
 obj-y				+= i2c/ i3c/ media/
+obj-y				+= net/
 obj-$(CONFIG_PPS)		+= pps/
 obj-y				+= ptp/
 obj-$(CONFIG_W1)		+= w1/

```

此方式调整后生效，加载日志如下：
```bash

console:/ # dmesg | grep -i "witheart"
[    2.072004] mpp_service mpp-srv: 32d8116903 author: Witheart 2025-06-04 git init
[    2.834245] [witheart] AT24_probe begin..
[    2.850215] [witheart] rk_gmac_probe begin..
[    2.851185] witheart: rk_get_eth_addr !!! \x0a
[    2.852198] witheart rk_get_eth_addr: at24_mac_read Success!!
[    2.852214] witheart rk_get_eth_addr: at24_eeprom mac is valid
[    9.173729] [Witheart] test eth led ctrl start(kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c)====== phy_rtl8211f_led_fixup
[    9.174175] [Witheart] test eth led ctrl end====== phy_rtl8211f_led_fixup

```
