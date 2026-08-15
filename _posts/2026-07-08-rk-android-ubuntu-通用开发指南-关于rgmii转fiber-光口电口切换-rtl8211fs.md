---
title: "关于RGMII转Fiber，光口电口切换 —— RTL8211FS"
date: 2026-07-08
last_modified_at: 2026-07-08
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/关于rgmii转fiber-光口电口切换-rtl8211fs/
toc: true
---

## 信号链路

简单来说，**RGMII《-》Fiber** 指的是在底层硬件设计中，将主控芯片的数字以太网接口（RGMII）转换为光纤（Fiber）物理链路的过程或模块。

具体的数据流向如下：

1. **SoC / 主控 (MAC端)**：输出 **RGMII** 信号（通常为12根引脚，包含 TX/RX 数据、控制信号和时钟，支持千兆速率）。
2. RTL8211FS 接收 RGMII，内部的逻辑模块将其转换为 **1000BASE-X 协议**的数据流（完成 8b/10b 编码等动作）。
3. RTL8211FS 将这些编码后的 1000BASE-X 数据，通过内部的 **SerDes 硬件电路**，以 1.25 Gbps 的波特率，从 `S_TXP/N` 引脚推出去。
4. **光模块 (SFP笼子)**：接收 PHY 芯片发来的 SerDes 高速差分电信号，通过内部的光电转换电路（激光器/光电二极管），最终将信号转换为光波进入 **Fiber（光纤）**。

**8211F** 和 **8211FS** 都是瑞昱（Realtek）推出的非常经典的千兆以太网 PHY（物理层）芯片。在嵌入式开发（如 RK3568/RK3588 等 ARM 板卡）中极为常见。

## 8211F 对比 8211FS
### 1. RTL8211F：纯铜线 PHY

- **功能定位：** 标准的千兆以太网收发器。
- **信号链路：** `MAC (RGMII)` <—> `RTL8211F` <—> `RJ45 网口 (Copper)`
- **特点：** 它的对外接口只有 **MDI（Media Dependent Interface）**，专门用来驱动网络变压器和 RJ45 铜线网口。支持 10/100/1000Base-T。它**无法**直接连接光模块。

### 2. RTL8211FS：光电双模 PHY

- **功能定位：** 支持光纤（Fiber）和铜线（Copper）的双模千兆收发器。
- **信号链路：**
- 链路 A：`MAC (RGMII)` <—> `RTL8211FS` <—> `RJ45 网口`
- 链路 B：`MAC (RGMII)` <—> `RTL8211FS (SerDes)` <—> `SFP 光模块 (Fiber)`

- **特点：** 除了拥有 8211F 的所有功能外，它额外集成了一组 **SerDes 差分引脚**。这组引脚可以直接输出 1000Base-X 或 100Base-FX 协议的信号给光模块，这就是你之前提到的 **RGMII《-》Fiber** 转换的核心芯片。

## RTL8211FS 光口电口转换
如果用的是 RTL8211FS 且外接了 SFP 光笼子，**必须检查芯片的硬件 Strap 配置（通常是引脚拉高/拉低组合）**。RTL8211FS 支持 UTP（铜线）优先、Fiber 优先、强制 Fiber 等多种模式。如果硬件电路默认配成了“铜线模式”，那么光纤端哪怕插上模块也是无法 Link UP 的，这种情况需要在 U-Boot 或 Linux 内核里通过 MDIO 写入特定寄存器来强行切换介质模式。可以先通过改寄存器，确认有效后，修改drivers/net/phy/realtek.c驱动

https://blog.csdn.net/weixin_30755393/article/details/95846611
https://zhuanlan.zhihu.com/p/634128732

注意，8211fs的寄存器改了很多，网上找到的2014版本和2021版本datasheet都不适用。

### 寄存器动作
- 此修改从上述文章中摘抄，未验证。

find /sys -name phy_registers //先找到以太网寄存器的配置节点并进入所在目录

echo 31 0xdc0 >phy_registers //切换到PHY的PAGE 0xdc0

cat phy_registers //读取当前PAGE寄存器的值,核对PHYID1,PHYID2是否正确来确认寄存器是否正确

echo 0 0x value >phy_registers //改写PAGE0第0个寄存器的值为需要的value

cat phy_registers //读取值检查是否修改成功

echo 31 0 > phy_registers //切回到PAGE0寄存器！！！！重要，一定写完要切回来才会生效

### realtek.c修改
- 此修改从上述文章中摘抄，未验证。

```diff
setup_fiber_mode
#endif
+static int phy_8211fS_fiber_mode_fixup(struct phy_device *phydev)
+{	int i;
+	printk("%s in\n", __func__);
+	phy_write(phydev, 31, 0xdc0 );
+   phy_write(phydev, 16, 0x79ad );
+   //phy_write(phydev, 20, 0x79ad );
+	printk("page 0xdc0 register\n");
+	for(i =0; i<8,i++)
+		printk("%d: %x\n",i,phy_read(phydev,i));
+    phy_write(phydev, 31, 0xdc1 );
+   printk("23: %x\n", phy_read(phydev,23));
+   phy_write(phydev, 31, 0x0 );
+   printk("page 0 register\n");
+	for(i =0; i<32,i++)
+		printk("%d: %x\n",i,phy_read(phydev,i));
+	
+	return 0;
+}
/**
 * stmmac_dvr_probe
 * @device: device pointer
#ifdef CONFIG_DWMAC_RK_AUTO_DELAYLINE
	INIT_DELAYED_WORK(&priv->scan_dwork, stmmac_scan_delayline_dwork);
#endif
+	ret = phy_register_fixup_for_uid(RTL_8211FS_PHY_ID, 0xffffffff, +phy_8211fS_fiber_mode_fixup);
+	if (ret)
+		pr_warn("Cannot register PHY board fixup.\n");
	return ret;
error_netdev_register:
```

```diff
--- a/kernel/drivers/net/phy/realtek.c
+++ b/kernel/drivers/net/phy/realtek.c
@@ -46,6 +46,11 @@
 #define RTL8366RB_POWER_SAVE			0x15
 #define RTL8366RB_POWER_SAVE_ON			BIT(12)
 
+#define RTL8211FS_FIBER_ESR			0x0F
+#define RTL8211FS_MODE_MASK			0xC000
+#define RTL8211F_MODE_COPPER		0
+#define RTL8211FS_MODE_FIBER		1
+
 #define RTL_SUPPORTS_5000FULL			BIT(14)
 #define RTL_SUPPORTS_2500FULL			BIT(13)
 #define RTL_SUPPORTS_10000FULL			BIT(0)
@@ -58,6 +63,10 @@
 
 #define RTL_GENERIC_PHYID			0x001cc800
 
+struct rtl8211f_priv {
+	int lastmode;
+};
+
 MODULE_DESCRIPTION("Realtek PHY driver");
 MODULE_AUTHOR("Johnson Leung");
 MODULE_LICENSE("GPL");
@@ -93,7 +102,6 @@ static int rtl821x_ack_interrupt(struct phy_device *phydev)
 static int rtl8211f_ack_interrupt(struct phy_device *phydev)
 {
 	int err;
-
 	err = phy_read_paged(phydev, 0xa43, RTL8211F_INSR);
 
 	return (err < 0) ? err : 0;
@@ -140,7 +148,6 @@ static int rtl8211e_config_intr(struct phy_device *phydev)
 static int rtl8211f_config_intr(struct phy_device *phydev)
 {
 	u16 val;
-
 	if (phydev->interrupts == PHY_INTERRUPT_ENABLED)
 		val = RTL8211F_INER_LINK_STATUS;
 	else
@@ -242,7 +249,7 @@ static int rtl8211f_config_init(struct phy_device *phydev)
 			"2ns RX delay was already %s (by pin-strapping RXD0 or bootloader configuration)\n",
 			val_rxdly ? "enabled" : "disabled");
 	}
-
+	
 	return 0;
 }
 
@@ -560,6 +567,89 @@ static int rtlgen_resume(struct phy_device *phydev)
 	return ret;
 }
 
+static int rtl8211f_probe(struct phy_device *phydev)
+{
+	struct device *dev = &phydev->Multi Dimensional Input Output;
+	struct rtl8211f_priv *priv;
+
+	priv = devm_kzalloc(dev, sizeof(struct rtl8211f_priv), GFP_KERNEL);
+	if (!priv)
+		return -ENOMEM;
+	
+	phydev->priv = priv;
+
+	return 0;
+}
+
+static void rtl8211f_remove(struct phy_device *phydev)
+{
+	struct device *dev = &phydev->Multi Dimensional Input Output;
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	if (priv)
+		devm_kfree(dev, priv);
+}
+
+static int rtl8211f_mode(struct phy_device *phydev)
+{
+	u16 val;
+
+	val = phy_read(phydev, RTL8211FS_FIBER_ESR);
+	val &= RTL8211FS_MODE_MASK;
+
+	if(val)
+		return RTL8211FS_MODE_FIBER;
+	else
+		return RTL8211F_MODE_COPPER;
+}
+
+static int rtl8211f_config_aneg(struct phy_device *phydev)
+{
+	int ret;
+
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	ret = genphy_read_abilities(phydev);
+	if(ret < 0)
+		return ret;
+
+	linkmode_copy(phydev->advertising, phydev->supported);
+
+	if (rtl8211f_mode(phydev) == RTL8211FS_MODE_FIBER) {
+		dev_info(&phydev->Multi Dimensional Input Output, "Fiber Mode");
+		priv->lastmode = RTL8211FS_MODE_FIBER;
+		return genphy_c37_config_aneg(phydev);
+	}
+
+	dev_info(&phydev->Multi Dimensional Input Output, "Copper Mode");
+
+	priv->lastmode = RTL8211F_MODE_COPPER;
+
+	return genphy_config_aneg(phydev);
+}
+
+static int rtl8211f_read_status(struct phy_device *phydev)
+{
+	int ret;
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	if(rtl8211f_mode(phydev) != priv->lastmode) {
+		ret = rtl8211f_config_aneg(phydev);
+		if(ret < 0)
+			return ret;
+
+		ret = genphy_restart_aneg(phydev);
+		if(ret < 0)
+			return ret;
+	}
+
+	if (rtl8211f_mode(phydev) == RTL8211FS_MODE_FIBER)
+		return genphy_c37_read_status(phydev);
+
+	return genphy_read_status(phydev);
+}
+
+
 static struct phy_driver realtek_drvs[] = {
 	{
 		PHY_ID_MATCH_EXACT(0x00008201),
@@ -632,10 +722,15 @@ static struct phy_driver realtek_drvs[] = {
 		.write_page	= rtl821x_write_page,
 	}, {
 		PHY_ID_MATCH_EXACT(0x001cc916),
-		.name		= "RTL8211F Gigabit Ethernet",
+		// .name		= "RTL8211F Gigabit Ethernet",
+		.name		= "RTL8211F(S) Gigabit Ethernet",
+		.probe		= rtl8211f_probe,
+		.remove		= rtl8211f_remove,		
 		.config_init	= &rtl8211f_config_init,
 		.ack_interrupt	= &rtl8211f_ack_interrupt,
 		.config_intr	= &rtl8211f_config_intr,
+		.config_aneg	= rtl8211f_config_aneg,
+		.read_status	= rtl8211f_read_status,		
 		.suspend	= genphy_suspend,
 		.resume		= rtl821x_resume,
 		.read_page	= rtl821x_read_page,
```

### realtek.c修改 —— RK官方版本
```diff
diff --git a/arch/arm64/configs/rockchip_defconfig b/arch/arm64/configs/rockchip_defconfig
index c266bef..30e1b98 100644
--- a/arch/arm64/configs/rockchip_defconfig
+++ b/arch/arm64/configs/rockchip_defconfig
@@ -1003,3 +1003,4 @@ CONFIG_SCHEDSTATS=y
 CONFIG_BUG_ON_DATA_CORRUPTION=y
 CONFIG_ENABLE_DEFAULT_TRACERS=y
 # CONFIG_RUNTIME_TESTING_MENU is not set
+CONFIG_REALTEK_PHY=y
diff --git a/drivers/net/phy/realtek.c b/drivers/net/phy/realtek.c
old mode 100644
new mode 100755
index b487930..cebd692
--- a/drivers/net/phy/realtek.c
+++ b/drivers/net/phy/realtek.c
@@ -243,6 +243,13 @@ static int rtl8211f_config_init(struct phy_device *phydev)
 			val_rxdly ? "enabled" : "disabled");
 	}
 
+	phy_write(phydev, 31, 0xdc0 );
+   phy_write(phydev, 16, 0x79ad );
+	phy_write(phydev, 31, 0xa43);
+	phy_write(phydev, 24, 0x311e);
+	phy_write(phydev, 31, 0x0 );
+
+	return 0;
 	return 0;
 }
 
@@ -560,6 +567,98 @@ static int rtlgen_resume(struct phy_device *phydev)
 	return ret;
 }
 
+#define RTL8211FS_FIBER_ESR			0x0F
+#define RTL8211FS_MODE_MASK			0xC000
+#define RTL8211F_MODE_COPPER		0
+#define RTL8211FS_MODE_FIBER		1
+
+struct rtl8211f_priv {
+	int lastmode;
+};
+
+static int rtl8211f_probe(struct phy_device *phydev)
+{
+	struct device *dev = &phydev->mdio.dev;
+	struct rtl8211f_priv *priv;
+
+	priv = devm_kzalloc(dev, sizeof(struct rtl8211f_priv), GFP_KERNEL);
+	if (!priv)
+		return -ENOMEM;
+	
+	phydev->priv = priv;
+
+	return 0;
+}
+
+static void rtl8211f_remove(struct phy_device *phydev)
+{
+	struct device *dev = &phydev->mdio.dev;
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	if (priv)
+		devm_kfree(dev, priv);
+}
+
+static int rtl8211f_mode(struct phy_device *phydev)
+{
+	u16 val;
+
+	val = phy_read(phydev, RTL8211FS_FIBER_ESR);
+	val &= RTL8211FS_MODE_MASK;
+
+	if(val)
+		return RTL8211FS_MODE_FIBER;
+	else
+		return RTL8211F_MODE_COPPER;
+}
+
+static int rtl8211f_config_aneg(struct phy_device *phydev)
+{
+	int ret;
+
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	ret = genphy_read_abilities(phydev);
+	if(ret < 0)
+		return ret;
+
+	linkmode_copy(phydev->advertising, phydev->supported);
+
+	if (rtl8211f_mode(phydev) == RTL8211FS_MODE_FIBER) {
+		dev_info(&phydev->mdio.dev, "Fiber Mode");
+		priv->lastmode = RTL8211FS_MODE_FIBER;
+		return genphy_c37_config_aneg(phydev);
+	}
+
+	dev_info(&phydev->mdio.dev, "Copper Mode");
+
+	priv->lastmode = RTL8211F_MODE_COPPER;
+
+	return genphy_config_aneg(phydev);
+}
+
+static int rtl8211f_read_status(struct phy_device *phydev)
+{
+	int ret;
+	struct rtl8211f_priv *priv = phydev->priv;
+
+	if(rtl8211f_mode(phydev) != priv->lastmode) {
+		ret = rtl8211f_config_aneg(phydev);
+		if(ret < 0)
+			return ret;
+
+		ret = genphy_restart_aneg(phydev);
+		if(ret < 0)
+			return ret;
+	}
+
+	if (rtl8211f_mode(phydev) == RTL8211FS_MODE_FIBER)
+		return genphy_c37_read_status(phydev);
+
+	return genphy_read_status(phydev);
+}
+
+
 static struct phy_driver realtek_drvs[] = {
 	{
 		PHY_ID_MATCH_EXACT(0x00008201),
@@ -633,9 +732,13 @@ static struct phy_driver realtek_drvs[] = {
 	}, {
 		PHY_ID_MATCH_EXACT(0x001cc916),
 		.name		= "RTL8211F Gigabit Ethernet",
+		.probe		= rtl8211f_probe,
+		.remove	= rtl8211f_remove,
 		.config_init	= &rtl8211f_config_init,
 		.ack_interrupt	= &rtl8211f_ack_interrupt,
 		.config_intr	= &rtl8211f_config_intr,
+		.config_aneg	= rtl8211f_config_aneg,
+		.read_status	= rtl8211f_read_status,
 		.suspend	= genphy_suspend,
 		.resume		= rtl821x_resume,
 		.read_page	= rtl821x_read_page,
```
