---
title: "Rockchip `make.sh` 使用与开发文档"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/rockchip-make-sh-使用与开发文档/
toc: true
---

./u-boot/make.sh

## **概述**

`make.sh` 是由 Rockchip 提供的固件构建和打包脚本，主要用于 Rockchip 平台的 U-Boot 固件开发。脚本支持多种开发板和芯片型号，能够完成从编译、配置到生成最终镜像文件的全流程操作，包括 `u-boot.img`、`trust.img` 和 `loader.img` 等固件文件的生成。

---

## **功能概览**

1. **构建功能**：
   - 支持使用不同开发板配置文件（`defconfig`）构建 U-Boot。
   - 支持 U-Boot 的调试功能（如符号表、反汇编）。
   - 支持并行编译以加速构建进程。

2. **打包功能**：
   - 通过指定 INI 文件生成 `uboot.img`, `trust.img`, `loader.img` 等固件镜像。
   - 支持多种平台类型（如 `FIT`, `DECOMP` 等）。

3. **调试功能**：
   - 支持 ELF 文件的反汇编、符号表分析。
   - 支持地址解析和回溯。

4. **灵活性**：
   - 支持通过命令行传递参数自定义构建或打包。
   - 支持增量构建或仅生成镜像文件。

---

## **快速上手指南**

### **环境准备**

1. **工具链**：
   - 确保已安装 Rockchip 提供的工具链（如 `gcc-linaro`）。
   - 工具链路径默认设置为：
     - 32 位 ARM：`../prebuilts/gcc/linux-x86/arm/gcc-linaro-6.3.1-2017.05-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-`
     - 64 位 ARM：`../prebuilts/gcc/linux-x86/aarch64/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu/bin/aarch64-linux-gnu-`

2. **rkbin 工具**：
   - `RKBIN_TOOLS` 默认指向 `../rkbin/tools`，确保路径正确。
   - `rkbin` 是 Rockchip 提供的二进制工具仓库，用于生成 `trust` 和 `loader` 镜像。

3. **操作系统依赖**：
   - 安装 `dtc`（设备树编译器）：`sudo apt-get install device-tree-compiler`
   - 安装 Python2（如果目标平台需要）：`sudo apt-get install python2`

---

### **使用方法**

脚本支持以下几种主要操作：

#### **1. 构建目标**
- 使用指定开发板的配置文件（例如 `evb-rk3399`）：
  ```bash
  ./make.sh evb-rk3399
  ```
  > **说明**：脚本会自动加载 `configs/evb-rk3399_defconfig`，并进行编译。

- 使用现有的 `.config` 文件：
  ```bash
  ./make.sh
  ```

- 使用额外的外部设备树文件（`dtb`）：
  ```bash
  ./make.sh EXT_DTB=rk-kernel.dtb
  ```

#### **2. 打包镜像**
- 打包 U-Boot 镜像：
  ```bash
  ./make.sh uboot
  ```
  > 生成文件：`u-boot.img`

- 打包信任区镜像（Trust）：
  ```bash
  ./make.sh trust
  ```
  > 生成文件：`trust.img`

- 指定 INI 文件打包信任区镜像：
  ```bash
  ./make.sh trust my_trust.ini
  ```

- 打包加载器镜像（Loader）：
  ```bash
  ./make.sh loader
  ```
  > 生成文件：`loader.bin`

- 打包 `idblock.bin`：
  ```bash
  ./make.sh --idblock
  ```

#### **3. 调试功能**
- 反汇编 ELF 文件：
  ```bash
  ./make.sh elf
  ```

- 查看符号表：
  ```bash
  ./make.sh sym
  ```

- 查看映射文件：
  ```bash
  ./make.sh map
  ```

- 地址回溯（支持未重定位地址和已重定位地址）：
  ```bash
  ./make.sh <地址>
  ./make.sh <地址-重定位偏移>
  ```

---

## **参数说明**

| 参数               | 功能描述                                                                                                                                           | 示例                                |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `[board]`          | 指定开发板名称，使用对应的 `defconfig` 文件进行构建。                                                                                              | `./make.sh evb-rk3399`             |
| `uboot`            | 打包 `u-boot.img` 镜像。                                                                                                                          | `./make.sh uboot`                  |
| `trust`            | 打包 `trust.img` 镜像。                                                                                                                           | `./make.sh trust`                  |
| `loader`           | 打包 `loader.bin` 镜像。                                                                                                                          | `./make.sh loader`                 |
| `--spl`/`--tpl`    | 使用 SPL（Secondary Program Loader）或 TPL（Third Program Loader）打包加载器镜像。                                                                 | `./make.sh --spl --tpl`            |
| `<地址>`           | 地址解析或回溯，用于调试符号表和 ELF 文件。                                                                                                       | `./make.sh 0x12345678`             |
| `*.ini`            | 指定用于打包 `trust.img` 或 `loader.bin` 的 INI 配置文件。                                                                                        | `./make.sh trust my_trust.ini`     |
| `EXT_DTB=<文件>`   | 指定外部 DTB 文件，用于构建。                                                                                                                     | `./make.sh EXT_DTB=my_kernel.dtb`  |
| `CROSS_COMPILE`    | 指定交叉编译工具链。                                                                                                                              | `./make.sh CROSS_COMPILE=<路径>`   |
| `--raw-compile`    | 构建但不打包镜像文件（适用于 `FIT` 平台）。                                                                                                       | `./make.sh --raw-compile`          |
| `--no-uboot`       | 打包不包含 U-Boot 的 `uboot.img`（适用于 SPL => Trust => Kernel 的场景）。                                                                          | `./make.sh --no-uboot`             |

---

## **脚本逻辑说明**

脚本主要包含以下功能模块：

### **1. 参数解析 (`process_args`)**
- 解析用户输入的参数，并根据命令区分构建、打包和调试功能。
- 支持动态调整工具链、配置文件以及特定的操作模式。

### **2. 环境准备 (`prepare`)**
- 检查 `rkbin` 工具路径是否正确。
- 根据 `.config` 文件，确定目标平台是否需要 ARM64 TrustZone 支持。

### **3. 工具链选择 (`select_toolchain`)**
- 自动选择 32 位或 64 位交叉编译工具链。
- 检查工具链是否可用，并将路径保存到临时文件 `.cc`。

### **4. 芯片信息提取 (`select_chip_info`)**
- 从 `.config` 文件中提取芯片型号（如 `RK3399`, `RV1126`）和相关配置信息。

### **5. 配置调整 (`fixup_platform_configure`)**
- 自动调整平台配置（如 U-Boot 和 Trust 镜像大小，SHA/RSA 签名等）。

### **6. 镜像打包**
- **U-Boot 镜像**：调用 `scripts/uboot.sh` 打包 `u-boot.img`。
- **加载器镜像**：调用 `scripts/loader.sh` 生成 `loader.bin`。
- **信任区镜像**：根据是否包含 TrustZone，调用 `scripts/atf.sh` 或 `scripts/tos.sh`。

### **7. 调试功能**
- 支持通过工具链自带的 `nm` 和 `objdump` 对 ELF 文件进行反汇编和符号表分析。
- 支持解析地址并关联符号表定位代码位置。

---

## **开发者指南**

### **1. 脚本可修改部分**
- **工具链路径**：
  修改以下变量以适应不同的交叉编译器路径：
  ```bash
  CROSS_COMPILE_ARM32=<路径>
  CROSS_COMPILE_ARM64=<路径>
  ```

- **rkbin 工具路径**：
  修改 `RKBIN_TOOLS` 指向正确的 `rkbin` 安装位置：
  ```bash
  RKBIN_TOOLS=<路径>
  ```

### **2. 扩展支持的开发板**
- 添加新的开发板配置文件到 `configs/` 目录，文件名需以 `_defconfig` 结尾。
- 脚本会自动识别新增的配置文件。

### **3. 扩展功能**
- 脚本结构清晰，可通过新增函数扩展调试功能或自定义的打包逻辑。

---

## **常见问题与解决方法**

| 问题                                                                 | 解决方法                                                                                     |
|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 报错 `ERROR: No ../rkbin repository`                                 | 检查 `rkbin` 工具路径是否正确，确保 `RKBIN_TOOLS` 指向可用的 `rkbin/tools` 目录。             |
| 报错 `ERROR: No CROSS_COMPILE gcc`                                   | 检查交叉编译工具链路径是否正确，确保指定的路径包含 `gcc` 可执行文件。                         |
| 打包 `trust.img` 时找不到 INI 文件                                   | 确保 INI 文件路径正确，或者在命令行中显式指定 INI 文件。                                     |
| 报错 `ERROR: No CONFIG_SYS_TEXT_BASE for u-boot`                    | 检查 `CONFIG_SYS_TEXT_BASE` 是否在 `.config` 文件中正确配置。                                |
| 报错 `ERROR: No 'dtc'`                                              | 安装设备树编译器：`sudo apt-get install device-tree-compiler`。                              |

---
