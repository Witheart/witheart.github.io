---
title: "Lunch选择的版型与对应的U-Boot配置文件"
date: 2024-12-04
last_modified_at: 2024-12-04
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/lunch选择的版型与对应的u-boot配置文件/
toc: true
---

在构建系统中，**U-Boot配置文件**是指在 `u-boot/configs/` 目录下的 `*_defconfig` 文件。它的主要作用是**定义U-Boot的配置选项**，这些选项会在构建U-Boot时被解析并生成最终的配置文件（`.config`），进而决定U-Boot的功能、硬件支持、启动模式等具体内容。
![alt text](/assets/images/androidsdk-使用技巧/lunch选择的版型与对应的u-boot配置文件/image.png)

## *_defconfig 的作用

`*_defconfig` 文件是 U-Boot 的默认配置文件，主要包含与特定硬件平台相关的预设配置，用于快速生成适合该平台的 U-Boot 镜像。它的作用包括但不限于：

1. **选择硬件支持**：定义支持的处理器、存储设备、网络接口等硬件。
2. **定义启动参数**：配置启动模式、内存映射、设备树使用等。
3. **裁剪功能模块**：根据硬件资源和项目需求裁剪不必要的功能。
4. **快速构建**：通过预定义的配置文件，简化了定制化U-Boot的重复性工作。

`*_defconfig` 文件的内容会在构建时通过 `make <defconfig>` 命令加载，生成 `.config` 文件并完成对 U-Boot 的配置。

---

## U-Boot 配置文件的获取

在构建脚本 `build.sh` 中，有以下内容：

```sh
UBOOT_DEFCONFIG=`get_build_var PRODUCT_UBOOT_CONFIG`
```

这段代码的含义是：U-Boot 的配置文件是由变量 `PRODUCT_UBOOT_CONFIG` 指定的。`PRODUCT_UBOOT_CONFIG` 的值会在不同的硬件平台/版型中有所不同。

---

## 如何确定使用的 `BoardConfig.mk`

在 `device/rockchip/rk356x/` 路径下，有一个通用的 `BoardConfig.mk` 文件，同时在 `device/rockchip/rk356x/` 路径下的具体版型文件夹（如 `rk3568_HW/`）中也有各自的 `BoardConfig.mk` 文件。例如：

- 通用路径：`device/rockchip/rk356x/BoardConfig.mk`
- 版型路径：`device/rockchip/rk356x/rk3568_HW/BoardConfig.mk`

那么，系统究竟使用的是哪一个 `BoardConfig.mk` 文件呢？

### 确定使用的 `BoardConfig.mk`
具体的版型与对应的配置文件关系，可以参考文章《Lunch选择的版型与版型对应的配置文件》。该文章详细介绍了不同版型与 `BoardConfig.mk` 文件之间的映射关系。

---

## 如何找到 U-Boot 配置文件路径

在找到版型对应的 `BoardConfig.mk` 文件后，可以在其中寻找 `PRODUCT_UBOOT_CONFIG` 变量。

经过查询，两个`BoardConfig.mk`是相互包含的，且其中定义了一模一样的内容：
![alt text](/assets/images/androidsdk-使用技巧/lunch选择的版型与对应的u-boot配置文件/image-1.png)

```mk
PRODUCT_UBOOT_CONFIG := rk3568
```

此时可以确认，U-Boot 的配置文件是 `u-boot/configs/rk3568_defconfig`。

---

## 总结

1. **`*_defconfig` 文件的作用**：是 U-Boot 的硬件平台预设配置文件，决定了U-Boot的功能与硬件支持。
2. **如何确定使用的 `BoardConfig.mk` 文件**：通过 `lunch` 选择的版型决定了使用的 `BoardConfig.mk` 文件。
3. **如何找到 U-Boot 配置文件路径**：在选定的 `BoardConfig.mk` 文件中，查找 `PRODUCT_UBOOT_CONFIG` 变量即可确定。
