---
title: "lunch选择的版型与版型对应的配置文件"
date: 2024-12-03
last_modified_at: 2024-12-03
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/lunch选择的版型与版型对应的配置文件/
toc: true
---

在Android构建系统中，`lunch`命令是用于选择目标产品（版型）的核心工具。它通过加载与版型相关的配置文件，设置环境变量，从而确保构建系统能够正确生成目标镜像。本文将结合`rk3568_HW.mk`文件的内容，详细说明`lunch`命令如何与版型对应。


### 1. **`lunch`命令的作用**

`lunch`命令的主要功能是：
- 列出当前构建系统中可用的版型（产品）。
- 根据用户选择的版型，设置构建所需的环境变量，例如`TARGET_PRODUCT`、`TARGET_BUILD_VARIANT`等。
- 加载与版型相关的配置文件，包括设备树、内核配置、分区布局等。

例如，当执行以下命令时：
```bash
lunch rk3568_HW-userdebug
```
系统会根据`rk3568_HW`版型加载相关配置并设置环境变量。

---

### 2. **`lunch`与版型的对应机制**

#### 2.1 **版型名称的来源**
在`lunch`菜单中显示的版型名称来源于`AndroidProducts.mk`文件中的定义。该文件通过`PRODUCT_MAKEFILES`变量列出了所有支持的版型。例如：

device/rockchip/rk356x/AndroidProducts.mk

![alt text](/assets/images/androidsdk-使用技巧/lunch选择的版型与版型对应的配置文件/image.png)
这里的`rk3568_HW.mk`文件定义了`rk3568_HW`版型。`lunch`命令会根据该文件加载版型的配置。

#### 2.2 **加载`rk3568_HW.mk`文件**
在`rk3568_HW.mk`文件中，定义了以下关键变量：
- `PRODUCT_NAME := rk3568_HW`
- `PRODUCT_DEVICE := rk3568_HW`
- `PRODUCT_MODEL := rk3568`
- `PRODUCT_MANUFACTURER := rockchip`

这些变量分别指定了产品名称、设备名称、型号和制造商信息。特别是`PRODUCT_NAME`和`PRODUCT_DEVICE`，它们是`lunch`命令与版型对应的核心字段。

#### 2.3 **通过`include`继承其他配置**
`rk3568_HW.mk`文件通过`include`语句继承了多个配置文件，例如：
```makefile
include device/rockchip/rk356x/rk3568_HW/BoardConfig.mk
include device/rockchip/common/BoardConfig.mk
```
这些文件中可能包含设备树路径、内核配置、分区布局等信息。例如，在`BoardConfig.mk`中可能定义了：
```makefile
PRODUCT_KERNEL_DTS := rk3568-evb1-ddr4-v10
BOARD_PREBUILT_DTBIMAGE_DIR := kernel/arch/arm64/boot/dts/rockchip
```
这些信息告诉构建系统应该使用哪个设备树文件以及其路径。

---

### 3. **环境变量的设置**

当用户选择`rk3568_HW-userdebug`时，`lunch`命令会设置以下环境变量：
- `TARGET_PRODUCT=rk3568_HW`
- `TARGET_BUILD_VARIANT=userdebug`
- `TARGET_DEVICE=rk3568_HW`

这些变量将决定构建系统加载哪些配置文件。例如：
- `TARGET_PRODUCT`会指向`rk3568_HW.mk`文件。
- `TARGET_DEVICE`会用于定位设备相关的目录（如`device/rockchip/rk356x/rk3568_HW`）。

通过这些环境变量，构建系统能够准确找到设备树文件、内核配置等关键资源。

## 可选版型
```sh
56. rk3568_HW-user
57. rk3568_HW-userdebug
58. rk3568_NK-user
59. rk3568_NK-userdebug
60. rk3568_QY-user
61. rk3568_QY-userdebug
```
