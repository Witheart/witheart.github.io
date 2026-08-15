---
title: "Linux 基本错误码返回"
date: 2025-06-11
last_modified_at: 2025-06-11
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/linux-基本错误码返回/
toc: true
---

## 1 错误码定义
`include/linux/errno.h`
[https://kernel.googlesource.com/pub/scm/linux/kernel/git/nico/archive/+/v0.97/include/linux/errno.h](https://kernel.googlesource.com/pub/scm/linux/kernel/git/nico/archive/+/v0.97/include/linux/errno.h)

## 2 使用错误码进行调试
很多内核函数都会使用这些错误码进行返回，我们在调用时获取返回值并打印，便可通过debug口获取这些日志，方便调试。如下：
```c
	ret = gpio_request_by_name(dev, "edp-bl-en", 0,
				   &priv->edp_bl_en, GPIOD_IS_OUT);
	if (ret && ret != -ENOENT) {
		printf("[Witheart]%s: Cannot get edp-bl-en GPIO: %d\n", __func__, ret);
		return ret;
	}
```
gpio_request_by_name在asm/gpio.h中声明
[https://elixir.bootlin.com/u-boot/v2025.04/source/include/asm-generic/gpio.h#L537](https://elixir.bootlin.com/u-boot/v2025.04/source/include/asm-generic/gpio.h#L537)
```h
/**
 * gpio_request_by_name() - Locate and request a GPIO by name
 *
 * This operates by looking up the given list name in the device (device
 * tree property) and requesting the GPIO for use. The property must exist
 * in @dev's node.
 *
 * Use @flags to specify whether the GPIO should be an input or output. In
 * principle this can also come from the device tree binding but most
 * bindings don't provide this information. Specifically, when the GPIO uclass
 * calls the xlate() method, it can return default flags, which are then
 * ORed with this @flags.
 *
 * If we find that requesting the GPIO is not always needed we could add a
 * new function or a new GPIOD_NO_REQUEST flag.
 *
 * At present driver model has no reference counting so if one device
 * requests a GPIO which subsequently is unbound, the @desc->dev pointer
 * will be invalid. However this will only happen if the GPIO device is
 * unbound, not if it is removed, so this seems like a reasonable limitation
 * for now. There is no real use case for unbinding drivers in normal
 * operation.
 *
 * The device tree binding is doc/device-tree-bindings/gpio/gpio.txt in
 * generate terms and each specific device may add additional details in
 * a binding file in the same directory.
 *
 * @dev:	Device requesting the GPIO
 * @list_name:	Name of GPIO list (e.g. "board-id-gpios")
 * @index:	Index number of the GPIO in that list use request (0=first)
 * @desc:	Returns GPIO description information. If there is no such
 *		GPIO, @desc->dev will be NULL.
 * @flags:	Indicates the GPIO input/output settings (GPIOD_...)
 * Return: 0 if OK, -ENOENT if the GPIO does not exist, -EINVAL if there is
 * something wrong with the list, or other -ve for another error (e.g.
 * -EBUSY if a GPIO was already requested)
 */
int gpio_request_by_name(struct udevice *dev, const char *list_name,
			 int index, struct gpio_desc *desc, int flags);
```
可以看到其中定义了-EBUSY，查表可知，其对应的返回值是-16

发生错误时，内核日志如下：
```sh
rockchip_panel_probe: Cannot get edp-bl-en GPIO: -16
```
