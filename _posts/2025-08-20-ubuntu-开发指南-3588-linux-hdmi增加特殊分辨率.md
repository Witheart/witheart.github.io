---
title: "3588 Linux HDMI增加特殊分辨率"
date: 2025-08-20
last_modified_at: 2025-08-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-linux-hdmi增加特殊分辨率/
toc: true
---

此方式为强制输出，不读EDID信息。

## 0 参考链接
- 最有用[https://redmine.rpdzkj.cn/attachments/834](https://redmine.rpdzkj.cn/attachments/834)
- [https://blog.csdn.net/xie__jin__cheng/article/details/144964370](https://blog.csdn.net/xie__jin__cheng/article/details/144964370)
- [https://blog.csdn.net/ewin2012/article/details/132513908](https://blog.csdn.net/ewin2012/article/details/132513908)
- [https://blog.csdn.net/u010936265/article/details/134227945](https://blog.csdn.net/u010936265/article/details/134227945)
- [https://www.forlinx.com/article_view_970.html](https://www.forlinx.com/article_view_970.html)
- 这个应该是可以兼容特殊分辨率和普通分辨率的教程，可惜要vip[https://blog.csdn.net/qq_46030455/article/details/140802496](https://blog.csdn.net/qq_46030455/article/details/140802496)
- 这个教程连uboot都改了[https://blog.csdn.net/qq_65999385](https://blog.csdn.net/qq_65999385)


## 1 环境
- RK3588
- Linux

## 2 获取屏幕timing屏参
### 使用x86 win PC获取
将屏幕通过HDMI接入win PC上，屏幕正常显示后，使用EDID读取软件(如ELDIM-EDIDviewer[https://eldim-edidviewer.software.informer.com/4.0/](https://eldim-edidviewer.software.informer.com/4.0/))进行读取，如下图所示：
![alt text](/assets/images/ubuntu-开发指南/3588-linux-hdmi增加特殊分辨率/PixPin_2025-08-20_09-04-20.png)

可以方便地读取到诸如水平前后肩之类的信息。

### 使用3588获取
`kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c`文件中，
define DEBUG应该就会在插入HDMI时，内核打印读取到的EDID信息，具体没有尝试过

- 相关代码
```c
if (edid) {
		dev_dbg(hdmi->dev, "got edid: width[%d] x height[%d]\n",
			edid->width_cm, edid->height_cm);
```

`kernel/include/linux/dev_printk.h`
```h
#if defined(CONFIG_DYNAMIC_DEBUG) || \
	(defined(CONFIG_DYNAMIC_DEBUG_CORE) && defined(DYNAMIC_DEBUG_MODULE))
#define dev_dbg(dev, fmt, ...)						\
	dynamic_dev_dbg(dev, dev_fmt(fmt), ##__VA_ARGS__)
#elif defined(DEBUG)
#define dev_dbg(dev, fmt, ...)						\
	dev_printk(KERN_DEBUG, dev, dev_fmt(fmt), ##__VA_ARGS__)
#else
#define dev_dbg(dev, fmt, ...)						\
({									\
	if (0)								\
		dev_printk(KERN_DEBUG, dev, dev_fmt(fmt), ##__VA_ARGS__); \
})
#endif
```


## 3 修改代码
### 3.1 增加屏参
`kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c`
- 这个文件中，需要增加特殊的屏参，以及取消EDID的读取，并注释掉不用的屏参。
屏参含义如下
```c
/* 0x58 - 4096x2160@59.94Hz RB */
{ DRM_MODE("4096x2160", DRM_MODE_TYPE_DRIVER, 556188, 4096, 4104,
4136, 4176, 0, 2160, 2208, 2216, 2222, 0,
DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_NVSYNC) },
```
![alt text](/assets/images/ubuntu-开发指南/3588-linux-hdmi增加特殊分辨率/PixPin_2025-08-20_16-20-22.png)

- 具体修改如下
```diff
diff --git a/kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c b/kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c
index 4c8fd805d..0a278df15 100644
--- a/kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c
+++ b/kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c
@@ -141,41 +141,46 @@ static const struct dw_hdmi_audio_tmds_n common_tmds_n_table[] = {
 };
 
 static const struct drm_display_mode dw_hdmi_default_modes[] = {
-	/* 16 - 1920x1080@60Hz 16:9 */
-	{ DRM_MODE("1920x1080", DRM_MODE_TYPE_DRIVER, 148500, 1920, 2008,
-		   2052, 2200, 0, 1080, 1084, 1089, 1125, 0,
+	// /* 16 - 1920x1080@60Hz 16:9 */
+	// { DRM_MODE("1920x1080", DRM_MODE_TYPE_DRIVER, 148500, 1920, 2008,
+	// 	   2052, 2200, 0, 1080, 1084, 1089, 1125, 0,
+	// 	   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
+	// /* 2 - 720x480@60Hz 4:3 */
+	// { DRM_MODE("720x480", DRM_MODE_TYPE_DRIVER, 27000, 720, 736,
+	// 	   798, 858, 0, 480, 489, 495, 525, 0,
+	// 	   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
+	// /* 4 - 1280x720@60Hz 16:9 */
+	// { DRM_MODE("1280x720", DRM_MODE_TYPE_DRIVER, 74250, 1280, 1390,
+	// 	   1430, 1650, 0, 720, 725, 730, 750, 0,
+	// 	   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
+	// /* 31 - 1920x1080@50Hz 16:9 */
+	// { DRM_MODE("1920x1080", DRM_MODE_TYPE_DRIVER, 148500, 1920, 2448,
+	// 	   2492, 2640, 0, 1080, 1084, 1089, 1125, 0,
+	// 	   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
+	// /* 19 - 1280x720@50Hz 16:9 */
+	// { DRM_MODE("1280x720", DRM_MODE_TYPE_DRIVER, 74250, 1280, 1720,
+	// 	   1760, 1980, 0, 720, 725, 730, 750, 0,
+	// 	   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
+	// /* 17 - 720x576@50Hz 4:3 */
+	// { DRM_MODE("720x576", DRM_MODE_TYPE_DRIVER, 27000, 720, 732,
+	// 	   796, 864, 0, 576, 581, 586, 625, 0,
+	// 	   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
+	// /* 2 - 720x480@60Hz 4:3 */
+	// { DRM_MODE("720x480", DRM_MODE_TYPE_DRIVER, 27000, 720, 736,
+	// 	   798, 858, 0, 480, 489, 495, 525, 0,
+	// 	   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
+	//   .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
+	/* 4 - 480x854@56.4Hz 16:9 */
+	{ DRM_MODE("480x854", DRM_MODE_TYPE_DRIVER, 28000, 480, 497,
+		   502, 520, 0, 854, 917, 937, 954, 0,
 		   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
 	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
-	/* 2 - 720x480@60Hz 4:3 */
-	{ DRM_MODE("720x480", DRM_MODE_TYPE_DRIVER, 27000, 720, 736,
-		   798, 858, 0, 480, 489, 495, 525, 0,
-		   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
-	/* 4 - 1280x720@60Hz 16:9 */
-	{ DRM_MODE("1280x720", DRM_MODE_TYPE_DRIVER, 74250, 1280, 1390,
-		   1430, 1650, 0, 720, 725, 730, 750, 0,
-		   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
-	/* 31 - 1920x1080@50Hz 16:9 */
-	{ DRM_MODE("1920x1080", DRM_MODE_TYPE_DRIVER, 148500, 1920, 2448,
-		   2492, 2640, 0, 1080, 1084, 1089, 1125, 0,
-		   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
-	/* 19 - 1280x720@50Hz 16:9 */
-	{ DRM_MODE("1280x720", DRM_MODE_TYPE_DRIVER, 74250, 1280, 1720,
-		   1760, 1980, 0, 720, 725, 730, 750, 0,
-		   DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
-	/* 17 - 720x576@50Hz 4:3 */
-	{ DRM_MODE("720x576", DRM_MODE_TYPE_DRIVER, 27000, 720, 732,
-		   796, 864, 0, 576, 581, 586, 625, 0,
-		   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
-	/* 2 - 720x480@60Hz 4:3 */
-	{ DRM_MODE("720x480", DRM_MODE_TYPE_DRIVER, 27000, 720, 736,
-		   798, 858, 0, 480, 489, 495, 525, 0,
-		   DRM_MODE_FLAG_NHSYNC | DRM_MODE_FLAG_NVSYNC),
-	  .picture_aspect_ratio = HDMI_PICTURE_ASPECT_4_3, },
 };
 
 enum frl_mask {
@@ -2296,7 +2301,8 @@ static int dw_hdmi_connector_get_modes(struct drm_connector *connector)
 			return -ENOMEM;
 		memcpy(edid, edid_blob_ptr->data, edid_blob_ptr->length);
 	} else {
-		edid = drm_get_edid(connector, hdmi->ddc);
+		// edid = drm_get_edid(connector, hdmi->ddc);
+		edid = NULL;
 		hdmi->hdcp_caps = dw_hdmi_qp_hdcp_capable(hdmi);
 	}
 
@@ -2382,6 +2388,7 @@ static int dw_hdmi_connector_get_modes(struct drm_connector *connector)
 		info->color_formats = 0;
 
 		dev_info(hdmi->dev, "failed to get edid\n");
+		dev_info(hdmi->dev, "dw-hdmi-qp.c\n");
 	}
 
 	return ret;
@@ -2475,7 +2482,8 @@ static void dw_hdmi_attach_properties(struct dw_hdmi_qp *hdmi)
 		if (hdmi->plat_data->get_grf_color_fmt)
 			color = hdmi->plat_data->get_grf_color_fmt(data);
 
-		val = (hdmi_readl(hdmi, PKT_VSI_CONTENTS1) >> 8) & 0xffffff;
+		// val = (hdmi_readl(hdmi, PKT_VSI_CONTENTS1) >> 8) & 0xffffff;
+		val = HDMI_FORUM_OUI;
 		if (val == HDMI_FORUM_OUI)
 			hdmi->allm_enable = true;
 		else

```

### 3.2 设备树修改
需要使能clock：hdptxphy_hdmi_clk0和hdptxphy_hdmi_clk1
- 修改如下
```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
index b1ec42e12..5d66d023e 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
@@ -96,6 +96,8 @@
 &display_subsystem {
 	memory-region = <&drm_logo>;
 	memory-region-names = "drm-logo";
+	clocks = <&hdptxphy_hdmi_clk0>, <&hdptxphy_hdmi_clk1>;
+	clock-names = "hdmi0_phy_pll", "hdmi1_phy_pll";
 };
 
 &dfi {

diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
index 6f4077f2b..b516341c9 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dtsi
@@ -536,6 +536,14 @@
 	status = "disabled";
 };
 
+&hdptxphy_hdmi_clk0 {
+	status = "okay";
+};
+
+&hdptxphy_hdmi_clk1 {
+	status = "okay";
+};
+
 #if 1
 /* Should work with at least 128MB cma reserved above. */
 &hdmirx_ctrler {

```
