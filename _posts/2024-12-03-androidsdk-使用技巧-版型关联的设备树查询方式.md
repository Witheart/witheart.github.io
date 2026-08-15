---
title: "版型关联的设备树查询方式"
date: 2024-12-03
last_modified_at: 2024-12-03
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/版型关联的设备树查询方式/
toc: true
---

在使用`lunch`命令指定某一个编译版型后，可以通过以下步骤来确定该版型使用的设备树：

### 1. **执行`get_build_var TARGET_DEVICE_DIR`命令**

- 在执行`lunch`命令选择一个产品后，运行以下命令：
  ```
  get_build_var TARGET_DEVICE_DIR
  ```
- 该命令会返回当前选择的目标设备目录路径。例如，对于`rk3568_r-userdebug`版型，可能返回路径为：
  ```
  device/rockchip/rk356x/rk3568_r/
  ```
- 进入该目录后，可以查看该版型的配置文件，例如`BoardConfig.mk`，以确定设备树的相关信息 。

### 2. **检查`BoardConfig.mk`文件**

- 在上述目标设备目录中，打开`BoardConfig.mk`文件，查找以下变量：
  - `PRODUCT_KERNEL_DTS`：指定了设备树文件的名称，例如：
    ```
    PRODUCT_KERNEL_DTS ?= rk3568-evb1-ddr4-v10
    ```
    这里的值`rk3568-evb1-ddr4-v10`就是该版型使用的设备树文件。
  - `BOARD_PREBUILT_DTBIMAGE_DIR`：指定了设备树文件的路径，例如：
    ```
    BOARD_PREBUILT_DTBIMAGE_DIR := kernel/arch/arm64/boot/dts/rockchip
    ```
    结合这两个变量，可以确定设备树文件的完整路径为：
    ```
    kernel/arch/arm64/boot/dts/rockchip/rk3568-evb1-ddr4-v10.dts
    ```
  - `BOARD_PREBUILT_DTBIMAGE_DIR` 可能在当前目录的`BoardConfig.mk`文件中找不到，请查看上一层的`BoardConfig.mk`文件，例如：
    ```
    BOARD_PREBUILT_DTBIMAGE_DIR := kernel/arch/arm64/boot/dts/rockchip
    ```
    结合这两个变量，可以确定设备树文件的完整路径为：
    ```
    kernel/arch/arm64/boot/dts/rockchip/rk3568-evb1-ddr4-v10.dts
    ```
