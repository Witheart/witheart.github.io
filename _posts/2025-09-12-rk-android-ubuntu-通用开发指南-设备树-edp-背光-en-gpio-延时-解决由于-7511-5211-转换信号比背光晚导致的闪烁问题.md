---
title: "设备树 eDP 背光 en gpio 延时——解决由于 7511 5211 转换信号比背光晚导致的闪烁问题"
date: 2025-09-12
last_modified_at: 2025-09-12
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/设备树-edp-背光-en-gpio-延时-解决由于-7511-5211-转换信号比背光晚导致的闪烁问题/
toc: true
---

## 1 问题原因

3588 的 LVDS 信号是使用 ch7511 芯片，转换 eDP 信号资源得到的。7511 芯片在将 eDP 信号转换为 LVDS 信号的过程中存在一定的处理延迟，而背光使能（EN）信号直接源自 CPU 的 eDP 资源。由于这一路径差异，使得经过 7511 转换后的背光使能信号早于 LVDS 信号生效，导致在 LVDS 信号尚未稳定时便提前开启背光，进而引发短暂的闪屏现象。
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/设备树-edp-背光-en-gpio-延时-解决由于-7511-5211-转换信号比背光晚导致的闪烁问题/image.png)
(黄色是EN，绿色是LVDS信号)
可以看到LVDS信号在EN拉高后920ms才出现。

## 2 解决方式

```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
index 6f4077f2b..c9cd018fc 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
@@ -313,6 +313,7 @@
                bpc = <8>;
                prepare-delay-ms = <200>;
                enable-delay-ms = <20>;
+			   blen-after-signal-delay-ms = <1000>; //LVDS信号出后，延迟的时间再打开背光，通过CH7511B转换后，设置1000ms时实测间隔为640ms
                lvds-gpio0 = <&gpio2 RK_PC3 GPIO_ACTIVE_HIGH>; //GPIO2_C5_d_1V8_7511_GPIO0
                lvds-gpio1 = <&gpio2 RK_PC5 GPIO_ACTIVE_HIGH>; //GPIO4_C2_d_1V8_7511_GPIO1
                lvds-gpio2 = <&gpio4 RK_PC3 GPIO_ACTIVE_HIGH>; //GPIO4_C3_d_1V8_7511_GPIO2
diff --git a/u-boot/drivers/video/drm/rockchip_panel.c b/u-boot/drivers/video/drm/rockchip_panel.c
index 87d4c3189..27ddec8a6 100644
--- a/u-boot/drivers/video/drm/rockchip_panel.c
+++ b/u-boot/drivers/video/drm/rockchip_panel.c
@@ -55,6 +55,7 @@ struct rockchip_panel_plat {
 		unsigned int disable;
 		unsigned int reset;
 		unsigned int init;
+		unsigned int blen_after_signal;
 	} delay;

 	struct rockchip_panel_cmds *on_cmds;
@@ -360,8 +361,10 @@ static void panel_simple_prepare(struct rockchip_panel *panel)
 	if (dm_gpio_is_valid(&priv->edp_bl_on))
 		dm_gpio_set_value(&priv->edp_bl_on, 1);

-	if (dm_gpio_is_valid(&priv->edp_bl_en))
-		dm_gpio_set_value(&priv->edp_bl_en, 1);
+	// if (dm_gpio_is_valid(&priv->edp_bl_en)){
+	// 	dm_gpio_set_value(&priv->edp_bl_en, 1);
+	// 	printf("[witheart] u-boot/drivers/video/drm/rockchip_panel.c) panel_simple_prepare() set edp_bl_en\n");
+	// }

 	if (dm_gpio_is_valid(&priv->enable_gpio))
 		dm_gpio_set_value(&priv->enable_gpio, 1);
@@ -439,9 +442,17 @@ static void panel_simple_unprepare(struct rockchip_panel *panel)

 static void panel_simple_enable(struct rockchip_panel *panel)
 {
+	printf("[witheart] u-boot/drivers/video/drm/rockchip_panel.c) panel_simple_enable()\n");
 	struct rockchip_panel_plat *plat = dev_get_platdata(panel->dev);
 	struct rockchip_panel_priv *priv = dev_get_priv(panel->dev);

+	if (dm_gpio_is_valid(&priv->edp_bl_en)){
+		if(plat->delay.blen_after_signal)
+			mdelay(plat->delay.blen_after_signal);
+		dm_gpio_set_value(&priv->edp_bl_en, 1);
+		printf("[witheart] u-boot/drivers/video/drm/rockchip_panel.c) panel_simple_enable() set edp_bl_en\n");
+	}
+
 	if (priv->enabled)
 		return;

@@ -493,6 +504,7 @@ static int rockchip_panel_ofdata_to_platdata(struct udevice *dev)
 	plat->delay.disable = dev_read_u32_default(dev, "disable-delay-ms", 0);
 	plat->delay.init = dev_read_u32_default(dev, "init-delay-ms", 0);
 	plat->delay.reset = dev_read_u32_default(dev, "reset-delay-ms", 0);
+	plat->delay.blen_after_signal = dev_read_u32_default(dev, "blen-after-signal-delay-ms", 0);
 	plat->lvds_index = dev_read_u32_default(dev, "nodka-lvds", 0);

 	plat->bus_format = dev_read_u32_default(dev, "bus-format",

```
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/设备树-edp-背光-en-gpio-延时-解决由于-7511-5211-转换信号比背光晚导致的闪烁问题/image-1.png)
(黄色是EN，绿色是LVDS信号)
修改代码后，LVDS信号出现后延时了640ms，EN信号才出现，时序正确。

## 3 解决过程

原计划是在背光使能函数调用之后插入延时，以补偿 7511 芯片的信号转换延迟，例如：

```
输出LVDS信号函数

<在此处插入延时>

调用背光使能函数
```

但由于函数调用链过长，且在该调用链中无法准确定位输出 LVDS 信号的具体函数，因此该方案难以实施，如下：

```
1. 设备树（GPIO 定义）
   - 文件：kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
   - 内容：定义了 edp-bl-en 引脚，例如
     - edp-bl-en = <&gpio2 RK_PC1 GPIO_ACTIVE_HIGH>; // LCD_BKL_EN_GPIO3_A6_d_3V3
   - 说明：设备树为面板背光（或相关信号）绑定了具体的 GPIO 控制器和引脚号。

2. 在 U-Boot 面板驱动中请求该 GPIO
   - 文件：u-boot/drivers/video/drm/rockchip_panel.c
   - 代码片段：ret = gpio_request_by_name(dev, "edp-bl-en", 0, &priv->edp_bl_en, GPIOD_IS_OUT);
   - 说明：驱动在 probe/初始化时根据设备节点名请求并保存 GPIO 描述符到 priv->edp_bl_en。

3. 在准备阶段设置 GPIO 值（打开背光）
   - 文件：u-boot/drivers/video/drm/rockchip_panel.c
   - 代码片段：if (dm_gpio_is_valid(&priv->edp_bl_en)) dm_gpio_set_value(&priv->edp_bl_en, 1);
   - 说明：检查 GPIO 有效后将其置高（打开背光）。该代码位于 panel_simple_prepare 函数中。

4. panel_simple_prepare 在面板函数表中注册
   - 位置：panel_simple_prepare 被放入结构体
     - static const struct rockchip_panel_funcs rockchip_panel_funcs
   - 说明：该结构体封装了面板的一组操作函数（如 prepare、enable、disable 等）。

5. 结构体在 probe 时绑定到 panel 对象
   - 函数：rockchip_panel_probe
   - 说明：probe 时会初始化面板设备并把 rockchip_panel_funcs 赋给 panel->funcs，使得后续通过 panel->funcs->prepare 能够调用到 panel_simple_prepare。

6. 通过结构体链查找并调用 prepare 方法
   - 说明：调用链通过 panel->funcs->prepare 来执行面板的准备动作。prepare 的声明/查找位置在：
     - 文件：u-boot/drivers/video/drm/rockchip_panel.h 中的 rockchip_panel_prepare（作为接口/声明）。

7. connector 层调用 panel 的 prepare
   - 文件：u-boot/drivers/video/drm/rockchip_connector.c
   - 函数：rockchip_connector_path_pre_enable（内部会调用 rockchip_panel_prepare）
   - 说明：connector 层在路径预使能阶段调用面板的 prepare 操作。

8. connector 的 pre-enable 整体流程
   - 文件：同上（rockchip_connector.c）
   - 函数：rockchip_connector_pre_enable（包含并调用 path_pre_enable）
   - 说明：这是连接器在早期使能阶段的总体入口，会调用 path_pre_enable、进而调用 panel 的 prepare。

9. display 层调用 connector 的 pre-enable
   - 文件：u-boot/drivers/video/drm/rockchip_display.c
   - 函数：display_enable（调用 rockchip_connector_pre_enable）
   - 说明：display 层在开启显示链路时，负责调用 connector 的 pre-enable 等一系列步骤。

10. display 启动流程与 Logo 展示
    - 文件：同上（rockchip_display.c）
    - 函数：display_logo（内部包含并调用 display_enable）
    - 说明：用于在启动时显示 logo，会按序执行 display_enable 等操作以准备显示硬件。

11. 更上层的 logo 调用
    - 函数：rockchip_show_logo（调用 display_logo）
    - 上层入口：do_rockchip_logo_show（调用 rockchip_show_logo）
    - 说明：启动流程中的 logo 显示由 do_rockchip_logo_show 触发，逐层调用到最终的面板 prepare，从而触发 GPIO 打开背光。
```

于是在 u-boot/drivers/video/drm/rockchip_panel.c，通过分析调试日志发现，某个特定函数的执行时机位于 U-Boot logo 显示完成之后。这一时序特征表明该函数的调用时间点明显晚于 LVDS 信号开始输出的时刻。

基于这一发现，对背光控制逻辑进行了优化调整：

1. 移除了原有的背光使能（en）设置代码
2. 将背光控制逻辑迁移至上述函数中执行
3. 在背光使能前特意加入了适当的延时机制

这样的修改确保了显示信号的稳定建立：

- 首先完成 LVDS 信号的稳定输出
- 经过预定延时后，再使能背光
