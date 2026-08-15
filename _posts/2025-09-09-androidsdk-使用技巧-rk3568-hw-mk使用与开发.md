---
title: "rk3568_HW.mk使用与开发"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/rk3568-hw-mk使用与开发/
toc: true
---

### **概述**

本脚本（Android Makefile）是用于构建基于 Rockchip RK3568 硬件平台的 Android 系统的配置文件。它定义了系统的设备属性、构建参数、分区配置以及其他产品特性。主要目标读者为嵌入式开发者和构建系统工程师。

---

### **功能概览**

该脚本的主要功能包括：

1. **设备硬件定义**  
   - 设置设备的型号 (`PRODUCT_NAME`, `PRODUCT_DEVICE`, `PRODUCT_MODEL`)，如 RK3568 硬件平台的相关信息。
   
2. **系统属性配置**  
   - 定义系统功能的属性覆盖值（`PRODUCT_PROPERTY_OVERRIDES`），譬如低内存杀手（Low Memory Killer）和网络参数。
   - 配置 SELinux 模式（`BOARD_SELINUX_ENFORCING=false`）。
   
3. **静态网络配置**  
   - 定义以太网接口（eth0 和 eth1）的静态 IP 地址、子网掩码、网关及 DNS 信息。
   
4. **系统组件文件拷贝**  
   - 将特定的初始化脚本（如 `init.rk356x.rc` 和 `fstab.enableswap`）复制到指定的构建目录。
   
5. **分区与构建模板**  
   - 引入动态分区配置和常见的分区设置。
   - 包含 Rockchip 和默认 Android 平台的分区与构建配置模板。
   
6. **LCD 显示密度设置**  
   - LCD 显示密度 (`ro.sf.lcd_density=160`)，适配所支持的显示面板。

7. **低内存管理机制设置（LMK）**
   - 控制系统内存的分级回收策略（如低、中、关键内存阈值）。

---

### **快速上手指南**

#### **依赖环境**

1. **系统环境：**
   - 构建环境需要运行在支持 `Android.mk` 编译的操作系统（通常为 Linux）。
   - 安装 Android 构建系统支持工具链及依赖（如 `make`, `gcc`, `python`）。

2. **依赖工具：**
   - 提供 Rockchip 专用的构建脚本和工具链。
   - 包含 Android 工程的完整源码。

3. **必要文件：**
   - `DynamicPartitions.mk`, `rk3568_HW/BoardConfig.mk`, 和其他包含的外部配置文件。

#### **构建示例**

1. 执行构建环境初始化（如 `source build/envsetup.sh`）。
2. 使用 `lunch` 选择设备构建配置项：
   ```bash
   lunch rk3568_hw-userdebug
   ```
3. 开始构建镜像：
   ```bash
   make -j$(nproc) otapackage
   ```

---

### **参数说明**

以下是本脚本对相关参数的说明：

| 参数                            | 作用与功能描述                                                                                      |
|---------------------------------|-------------------------------------------------------------------------------------------------|
| `BOARD_SELINUX_ENFORCING`       | 设置为 `false` 关闭 SELinux 强制模式。                                                          |
| `PRODUCT_SHIPPING_API_LEVEL`    | 定义 API 等级，表示构建的目标为 Android R（API 30）。                                            |
| `ro.sf.lcd_density`             | 定义屏幕显示密度为 160（mdpi）模式用于平板设备。                                                |
| `dalvik.vm.usejit`              | 是否启用 JIT（Just-In-Time）编译，当前设置为 `false`（禁用）。                                   |
| `ro.lmk.upgrade_pressure`       | 低内存回收压力，30 表示低级别压力下开始回收。                                                  |
| `persist.net.eth{x}.staticIp`   | 以太网接口（eth0 和 eth1）静态 IP 设置。                                                       |
| `persist.proc_compact.enable`   | 是否启用进程压缩功能，设置为 `true` 启用。                                                     |
| `DEVICE_PACKAGE_OVERLAYS`       | 定义设备特定属性和功能的覆盖文件路径。                                                         |

---

### **脚本逻辑说明**

1. **设备基本信息配置**  
   - 定义设备品牌、型号、制造商等基本信息。  
     示例：
     ```makefile
     PRODUCT_NAME := rk3568_HW
     PRODUCT_BRAND := rockchip
     PRODUCT_MODEL := rk3568
     ```

2. **属性覆盖**  
   - 使用 `PRODUCT_PROPERTY_OVERRIDES` 配置系统级属性覆盖。  
     示例：
     ```makefile
     PRODUCT_PROPERTY_OVERRIDES += ro.sf.lcd_density=160
     PRODUCT_PROPERTY_OVERRIDES += persist.net.eth1.staticIp=192.168.0.10
     ```

3. **硬件配置模板**  
   - 包含动态分区模板、硬件特定配置文件。通过 `include` 引入额外的子模块，例如：
     ```makefile
     include device/rockchip/common/build/rockchip/DynamicPartitions.mk
     include device/rockchip/rk356x/rk3568_HW/BoardConfig.mk
     ```

4. **文件复制任务**  
   - 将必要文件从 `LOCAL_PATH` 指定的位置复制到构建的目标位置。例如：
     ```makefile
     PRODUCT_COPY_FILES += $(LOCAL_PATH)/init.rk356x.rc:$(TARGET_COPY_OUT_VENDOR)/etc/init/hw/init.rk356x.rc
     ```

5. **动态网络配置**  
   - 设置以太网接口的静态 IP 和 DNS 参数，以适配不同的网络环境。

---

### **开发者指南**

#### **新增特性**
1. 修改和添加属性：  
   - 在 `PRODUCT_PROPERTY_OVERRIDES` 下定义需要的系统属性。
   - 示例：支持增加新的网络接口或 LCD 密度配置。

2. 添加文件覆盖：  
   - 在 `PRODUCT_COPY_FILES` 添加其他初始化脚本到目标路径。

#### **支持新硬件**
1. 定制 `BoardConfig.mk` 文件，根据新硬件特性引入新的驱动或分区支持。
2. 替换与硬件相关的 DTBO 模板文件：
   ```makefile
   PRODUCT_DTBO_TEMPLATE := $(LOCAL_PATH)/new-dt-overlay.in
   ```

---

### **常见问题与解决方法**

| 问题描述                                      | 原因分析                                                                                           | 解决方案                                                                                           |
|---------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| 构建时提示 `init.rk356x.rc` 未找到          | 该文件未正确放置到指定路径中，导致复制失败。                                                       | 确认 `init.rk356x.rc` 文件是否存在于 `$(LOCAL_PATH)` 指定的路径中。                                |
| SELinux 报错                                 | 默认关闭 SELinux 强制模式需要配置兼容安全策略。                                                     | 确保 `BOARD_SELINUX_ENFORCING=false` 或添加自定义策略。                                             |
| 网络接口无连接                              | 静态 IP 设置错误，或设备硬件不支持指定接口（如 eth0、eth1）。                                       | 确保网络配置的 IP、网关与硬件接口对应；检查硬件支持情况。                                           |
| 系统运行卡顿                                | 低内存管理设置不匹配设备实际内存配置。                                                             | 修改 `ro.lmk.low`, `ro.lmk.medium`, `ro.lmk.critical` 适配当前内存容量。                            |
