---
title: "内核配置文件"
date: 2024-12-03
last_modified_at: 2024-12-03
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/内核配置文件/
toc: true
---

本文档旨在说明内核配置文件与版型的对应，以及如何生成自定义的内核配置文件。

# 如何为版型指定内核配置文件
device/rockchip/rk356x/BoardConfig.mk
```
PRODUCT_KERNEL_CONFIG ?= NK_RK3568_defconfig
```
并将该BoardConfig.mk包含在具体的版型mk文件中device/rockchip/rk356x/rk3568_HW/BoardConfig.mk
include device/rockchip/rk356x/BoardConfig.mk


# RK3568 内核配置流程工作流说明

### 1. **加载基础配置**

1. **进入内核源码目录**：
   ```bash
   cd <kernel_source_directory>
   ```

2. **加载默认配置文件**：
   使用 Rockchip 提供的默认配置文件（如 `rockchip_defconfig`）生成基础 `.config` 文件：
   ```bash
   make ARCH=arm64 rockchip_defconfig
   ```
   此命令会从 `arch/arm64/configs/rockchip_defconfig` 文件中加载配置，并生成 `.config` 文件。

---

### 2. **修改内核配置**
根据项目需求，对内核配置进行自定义修改。

1. **打开图形化配置界面**：
   使用以下命令进入内核配置的图形化界面：
   ```bash
   make ARCH=arm64 menuconfig
   ```
   在界面中，可以启用或禁用特定功能（如驱动、文件系统支持等）。

2. **保存配置**：
   修改完成后，保存配置，这会更新 `.config` 文件。

---

### 3. **保存为自定义配置文件**
如果需要复用当前配置，可以保存为一个新的 `defconfig` 文件。

1. **生成简化的配置文件**：
   将当前 `.config` 文件保存为一个 `defconfig` 文件：
   ```bash
   make ARCH=arm64 savedefconfig
   ```

2. **保存到指定路径**：
   将生成的 `defconfig` 文件移动到内核配置目录下，例如：
   ```bash
   mv defconfig arch/arm64/configs/my_custom_defconfig
   ```

---
### 4. **使用新配置编译内核**
通过修改文章开头提到的BoardConfig.mk配置文件并使用build.sh进行内核编译。
```
./build.sh -K //执行 build.sh 脚本编译内核

make bootimage //打包生成 boot.img 生成的镜像文件存放在产品输出目录下
```

### 5. **手动测试自定义配置**

1. **加载自定义配置文件**：
   使用以下命令加载自定义的 `defconfig` 文件：
   ```bash
   make ARCH=arm64 my_custom_defconfig
   ```

2. **编译内核**：
   编译内核以验证配置是否正确：
   ```bash
   make ARCH=arm64 CROSS_COMPILE=<path_to_toolchain> -j$(nproc)
   ```
   这会根据生成的 `.config` 文件编译内核。

3. **烧录并测试**：
   将生成的内核镜像烧录到开发板上，检查是否正常运行。

---

### **工作流总结**
整个内核配置流程可以总结为以下步骤：
1. **加载基础配置**：使用 `rockchip_defconfig` 生成基础 `.config` 文件。
2. **修改配置**：通过 `menuconfig` 根据需求调整内核选项。
3. **保存自定义配置**：使用 `savedefconfig` 保存为新的 `defconfig` 文件。
4. **测试和验证**：加载自定义配置，编译内核并在开发板上测试。
