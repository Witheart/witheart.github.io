---
title: "自定义设备树属性并解析——以eDP背光属性为例rk3588"
date: 2025-06-11
last_modified_at: 2025-06-11
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/自定义设备树属性并解析-以edp背光属性为例rk3588/
toc: true
---

## 1 问题背景
- 原生的设备树中已经预设好了许多参数，但总会遇到某些参数不符合要求，或者需要增加某些原来没有的参数的情况。
- 比如rk3588原生的SDK并没有对设备树屏幕背光使能引脚的解析，而硬件电路设计上有该引脚，这时候就需要我们在设备树中添加对该引脚的引用，然后在原来屏幕初始化的位置进行解析。
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/自定义设备树属性并解析-以edp背光属性为例rk3588/PixPin_2025-06-11_10-05-24.png)
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/自定义设备树属性并解析-以edp背光属性为例rk3588/PixPin_2025-06-11_10-05-40.png)

可以看到，`EDP_ENBLK`是连接到rk3588的`GPIO2_C1_d`上的

## 2 解决过程
### 2.1 设备树增加引用
`kernel-5.10/arch/arm64/boot/dts/rockchip/RB_RK3588.dtsi`
在设备树面板配置这里，新增该引脚的引用
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/自定义设备树属性并解析-以edp背光属性为例rk3588/PixPin_2025-06-11_10-07-23.png)

### 2.2 u-boot 屏幕初始化函数中添加设备树解析
1. 在rockchip_panel_probe中解析设备树
2. 在panel_simple_prepare中使能背光引脚

`u-boot/drivers/video/drm/rockchip_panel.c`
```diff
diff --git a/u-boot/drivers/video/drm/rockchip_panel.c b/u-boot/drivers/video/drm/rockchip_panel.c
index de7e5e25c2..9dca813695 100755
--- a/u-boot/drivers/video/drm/rockchip_panel.c
+++ b/u-boot/drivers/video/drm/rockchip_panel.c
@@ -71,6 +71,8 @@ struct rockchip_panel_priv {
        struct gpio_desc spi_sdi_gpio;
        struct gpio_desc spi_scl_gpio;
        struct gpio_desc spi_cs_gpio;
+
+       struct gpio_desc edp_bl_en;
 };
 
 static inline int get_panel_cmd_type(const char *s)
@@ -279,6 +281,12 @@ static void panel_simple_prepare(struct rockchip_panel *panel)
        if (priv->power_supply)
                regulator_set_enable(priv->power_supply, !plat->power_invert);
 
+       //Witheart: eDP背光en信号
+       if (dm_gpio_is_valid(&priv->edp_bl_en))
+               dm_gpio_set_value(&priv->edp_bl_en, 1);
+       ret = dm_gpio_get_value(&priv->edp_bl_en);
+       printf("[Witheart]edp_bl_en: %d\n", ret);
+
        if (dm_gpio_is_valid(&priv->enable_gpio))
                dm_gpio_set_value(&priv->enable_gpio, 1);
 
@@ -457,6 +465,16 @@ static int rockchip_panel_probe(struct udevice *dev)
        int ret;
        const char *cmd_type;
 
+       printf("[Witheart]rockchip_panel_probe start...(u-boot/drivers/video/drm/rockchip_panel.c)\n");
+
+       //Witheart: 获取eDP背光en脚
+       ret = gpio_request_by_name(dev, "edp-bl-en", 0,
+                                  &priv->edp_bl_en, GPIOD_IS_OUT);
+       if (ret && ret != -ENOENT) {
+               printf("%s: Cannot get edp-bl-en GPIO: %d\n", __func__, ret);
+               return ret;
+       }
+
        ret = gpio_request_by_name(dev, "enable-gpios", 0,
                                   &priv->enable_gpio, GPIOD_IS_OUT);
        if (ret && ret != -ENOENT) {
@@ -529,6 +547,7 @@ static int rockchip_panel_probe(struct udevice *dev)
        panel->bpc = plat->bpc;
        panel->funcs = &rockchip_panel_funcs;
 
+       printf("[Witheart]rockchip_panel_probe end...(u-boot/drivers/video/drm/rockchip_panel.c)\n");
        return 0;
 }
```

### 2.3 复用问题
如果设置后背光不正常，接上debug口，查看debug日志，发现类似这样的日志
```sh
rockchip_panel_probe: Cannot get edp-bl-en GPIO: -16
```
- `-16`说明为资源被占用，此时要检查该引脚是不是在设备树的其他位置被引用
