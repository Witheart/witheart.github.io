---
title: "RK3588 从eeprom中读取mac地址——8211F+AT24"
date: 2025-08-05
last_modified_at: 2025-08-05
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk3588-从eeprom中读取mac地址-8211f-at24/
toc: true
---

## 1 MAC存储方案介绍
目前MAC有三种存储方案。
- 写在固件中 —— 相同固件会产生相同的MAC，批量时会造成MAC冲突
- 使用随机地址 —— rk官方的机制为：检测不到正确的MAC时，驱动会生成随机的MAC地址
- 固化到EEPROM —— 更换固件后，只要从EEPROM读取MAC的代码逻辑相同，MAC就不会变，对应了一个板子有一个绑定的MAC，很适合批量

## 2 源码定位
### 2.1 eth侧获取mac的源码
ifconfig可以看到，eth使用了`rk_gmac-dwmac`这个驱动
```bash
eth0      Link encap:Ethernet  HWaddr 02:12:28:05:10:26  Driver rk_gmac-dwmac
          inet addr:192.168.137.115  Bcast:192.168.137.255  Mask:255.255.255.0
          inet6 addr: fe80::9342:19:b610:429d/64 Scope: Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:55 errors:0 dropped:0 overruns:0 frame:0
          TX packets:65 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:9230 TX bytes:6836
          Interrupt:92

```

在源码驱动中进行查找，可以定位到kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c，其中有rk_gmac_probe函数
```bash
➜  rk3588_android12 git:(master) ✗ grep -irn "kernel-5.10/drivers/net/ethernet" -e "rk_gmac-dwmac"
kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c:2948:                .name           = "rk_gmac-dwmac",
Binary file kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.o matches
```

但是rk_gmac_probe中并没有获取mac的相关操作

文件中，搜索addr函数，发现了rk_get_eth_addr，看起来这个就是获取mac地址的函数，且使用get_eth_addr调用
```bash
plat_dat->get_eth_addr = rk_get_eth_addr;
```

而get_eth_addr又在`kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c`被stmmac_check_ether_addr调用

### 2.2 at24 EEPROM驱动源码
`kernel-5.10/drivers/misc/eeprom/at24.c`

## 3 具体修改
### 3.1 EEPROM
- 设备树，使能i2c总线上的at24，注意地址要和硬件配置的一致，电源可以不用配
```diff
diff --git a/kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi b/kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi
index 547b6afdb1..106280a428 100755
--- a/kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi
+++ b/kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi
@@ -584,6 +584,7 @@ &gmac1_clkinout
         /* rx_delay = <0x3f>; */
 
         phy-handle = <&rgmii_phy>;
+		dependent-devices = <&eeprom>;
         status = "okay";
 };
 #endif
@@ -937,6 +938,12 @@ dp_altmode_mux: endpoint {
 		};
 	};
 
+	//for eth mac address
+	eeprom: eeprom@57 {
+		compatible = "atmel,24c256";
+        reg = <0x57>;
+	};
+
 };
 
 &i2c7 {
```

- 编译选项中，选择编译at24的驱动
```diff
diff --git a/kernel-5.10/arch/arm64/configs/RB_RK3588_defconfig b/kernel-5.10/arch/arm64/configs/RB_RK3588_defconfig
index 681c80883a..db7d8b1fc4 100755
--- a/kernel-5.10/arch/arm64/configs/RB_RK3588_defconfig
+++ b/kernel-5.10/arch/arm64/configs/RB_RK3588_defconfig
@@ -1026,4 +1026,7 @@ CONFIG_CAN_DEV=y
 CONFIG_CANFD_ROCKCHIP=y # 控制can驱动编译，不能使用CONFIG_CAN_ROCKCHIP，因为是compatible = "rockchip,can-2.0"
 	# 下面选项已配置
 	# CONFIG_NET=y
-	# CONFIG_ARCH_ROCKCHIP=y
\ No newline at end of file
+	# CONFIG_ARCH_ROCKCHIP=y
+
+# eeprom配置，供eth保存/读取mac地址
+CONFIG_EEPROM_AT24=y

```

- at24驱动源码中，增加mac读取的函数
```diff
diff --git a/kernel-5.10/drivers/misc/eeprom/at24.c b/kernel-5.10/drivers/misc/eeprom/at24.c
index 305ffad131..7c927a8cf3 100755
--- a/kernel-5.10/drivers/misc/eeprom/at24.c
+++ b/kernel-5.10/drivers/misc/eeprom/at24.c
@@ -73,6 +73,8 @@ struct at24_client {
 	struct regmap *regmap;
 };
 
+struct at24_data *at24_private=NULL;
+
 struct at24_data {
 	/*
 	 * Lock protects against activities from other Linux tasks,
@@ -464,6 +466,71 @@ static int at24_read(void *priv, unsigned int off, void *val, size_t count)
 	return 0;
 }
 
+static ssize_t at24_read_private(struct at24_data *at24,
+       char *buf, loff_t off, size_t count)
+{
+   ssize_t retval = 0;
+ 
+   if (unlikely(!count))
+       return count;
+ 
+   if (off + count > at24->byte_len)
+       return -EINVAL;
+   
+   /*
+    * Read data from chip, protecting against concurrent updates
+    * from this host, but not from other I2C masters.
+    */
+   mutex_lock(&at24->lock);
+ 
+   while (count) {
+       ssize_t    status;
+ 
+       //status = at24_eeprom_read_i2c(at24, buf, off, count);
+       //status = at24_regmap_read(at24, buf, off, count);
+       status = at24_regmap_read(at24, buf, off, count);
+       if (status <= 0) {
+           if (retval == 0)
+               retval = status;
+           break;
+       }
+       buf += status;
+       off += status;
+       count -= status;
+       retval += status;
+   }
+ 
+   mutex_unlock(&at24->lock);
+ 
+   return retval;
+}
+
+ssize_t at24_mac_read(unsigned char* addr)
+{
+   char buf[20];
+   char buf_tmp[12];
+   ssize_t ret;    
+   if (at24_private == NULL)
+   {
+       printk("[witheart] %s: at24_mac_read at24_private==null error  ==%s", __func__, __FILE__);
+       return 0;
+   }
+   memset(buf, 0x00, 20);
+   memset(buf_tmp, 0x00, 12);
+   ret = at24_read_private(at24_private, buf, 0, 6);
+   if (ret > 0)
+   {     
+       addr[0] = buf[0];
+       addr[1] = buf[1];
+       addr[2] = buf[2];
+       addr[3] = buf[3];
+       addr[4] = buf[4];
+       addr[5] = buf[5];    
+   }
+   return ret;
+}
+EXPORT_SYMBOL(at24_mac_read);
+
 static int at24_write(void *priv, unsigned int off, void *val, size_t count)
 {
 	struct at24_data *at24;
@@ -600,6 +667,8 @@ static int at24_probe(struct i2c_client *client)
 	u8 test_byte;
 	int err;
 
+	printk("[witheart] %s: AT24_probe begin...  ==%s\n", __func__, __FILE__);
+
 	i2c_fn_i2c = i2c_check_functionality(client->adapter, I2C_FUNC_I2C);
 	i2c_fn_block = i2c_check_functionality(client->adapter,
 					       I2C_FUNC_SMBUS_WRITE_I2C_BLOCK);
@@ -684,6 +753,7 @@ static int at24_probe(struct i2c_client *client)
 	if (!at24)
 		return -ENOMEM;
 
+	at24_private = at24;
 	mutex_init(&at24->lock);
 	at24->byte_len = byte_len;
 	at24->page_size = page_size;

```

### 3.2 gmac eth侧
- 将原来的mac读写函数的逻辑更换为从eeprom中读写
```diff
diff --git a/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c b/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c
index cf9c46ea42..a656dc3b82 100755
--- a/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c
+++ b/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/dwmac-rk.c
@@ -2711,13 +2711,15 @@ int dwmac_rk_get_phy_interface(struct stmmac_priv *priv)
 }
 EXPORT_SYMBOL(dwmac_rk_get_phy_interface);
 
+static unsigned char macaddr[6];
+extern ssize_t at24_mac_read(unsigned char* addr);
 static void rk_get_eth_addr(void *priv, unsigned char *addr)
 {
-	struct rk_priv_data *bsp_priv = priv;
-	struct device *dev = &bsp_priv->pdev->dev;
-	unsigned char ethaddr[ETH_ALEN * MAX_ETH] = {0};
-	int ret, id = bsp_priv->bus_id;
+	// struct rk_priv_data *bsp_priv = priv;
+	// struct device *dev = &bsp_priv->pdev->dev;
+	int ret;
 
+	#if 0
 	if (is_valid_ether_addr(addr))
 		goto out;
 
@@ -2747,9 +2749,35 @@ static void rk_get_eth_addr(void *priv, unsigned char *addr)
 	} else {
 		memcpy(addr, &ethaddr[id * ETH_ALEN], ETH_ALEN);
 	}
-
-out:
-	dev_err(dev, "%s: mac address: %pM\n", __func__, addr);
+	#endif
+
+	//mac address from eeprom
+	#if 1
+    printk("[witheart] %s: begin rk_get_eth_addr  ==%s\n ", __func__, __FILE__);
+	ret = at24_mac_read(macaddr);
+	if (ret > 0)
+	{
+		printk("[witheart] %s: at24_mac_read Success  ==%s\n", __func__, __FILE__);
+		memcpy(addr, macaddr, 6);
+              
+		if ((addr[0] == 0x50) && (addr[1] == 0x0a))
+		{
+			printk("[witheart] %s: at24_eeprom mac is valid  ==%s\n", __func__, __FILE__);
+        }
+		else
+		{
+			printk("[witheart] %s: at24_eeprom mac is invalid  ==%s\n", __func__, __FILE__);
+			addr[0] = 0x02;
+			addr[1] = 0x12;
+			addr[2] = 0x28;
+			addr[3] = 0x05;
+			addr[4] = 0x10;
+			addr[5] = 0x26;                 
+		}               
+    }       
+    #endif
+// out:
+// 	dev_err(dev, "%s: mac address: %pM\n", __func__, addr);
 }
 
 static int rk_gmac_probe(struct platform_device *pdev)
@@ -2759,6 +2787,8 @@ static int rk_gmac_probe(struct platform_device *pdev)
 	const struct rk_gmac_ops *data;
 	int ret;
 
+	printk("[witheart]%s: rk_gmac_probe begin...  ==%s\n", __func__, __FILE__);
+
 	data = of_device_get_match_data(&pdev->dev);
 	if (!data) {
 		dev_err(&pdev->dev, "no of match data provided\n");

```

- 强制每次开机驱动初始化时，都从eeprom中读取
```diff
diff --git a/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c b/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c
index d10bc673c4..083eb43724 100755
--- a/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c
+++ b/kernel-5.10/drivers/net/ethernet/stmicro/stmmac/stmmac_main.c
@@ -2353,7 +2353,8 @@ static int stmmac_get_hw_features(struct stmmac_priv *priv)
  */
 static void stmmac_check_ether_addr(struct stmmac_priv *priv)
 {
-	if (!is_valid_ether_addr(priv->dev->dev_addr)) {
+	// if (!is_valid_ether_addr(priv->dev->dev_addr)) {
+	if(1) {
 		stmmac_get_umac_addr(priv, priv->hw, priv->dev->dev_addr, 0);
 		if (likely(priv->plat->get_eth_addr))
 			priv->plat->get_eth_addr(priv->plat->bsp_priv,

```

### 3.3 链接顺序修改
只按照上面的修改，会出现读取不到Mac的bug，日志如下
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

需要调整链接顺序，将net的链接顺序放到i2c之后。具体查看文章《记一次由驱动加载顺序导致的bug——eth mac地址配置》
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
