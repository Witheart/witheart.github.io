---
title: "RK 3588 Hailo AI 加速卡驱动安装指南"
date: 2025-02-27
last_modified_at: 2025-02-27
categories:
  - "hailo 加速卡驱动安装及使用"
tags:
  - "hailo 加速卡驱动安装及使用"
permalink: /hailo-加速卡驱动安装及使用/rk-3588-hailo-ai-加速卡驱动安装指南/
toc: true
---

概要：本指南详细介绍了在 RK3588 平台上安装 Hailo AI 加速卡驱动的步骤，包括 PCIe 支持检查、驱动编译、RT 库安装以及常见问题解决方案。  


## 1. 安装概述  

要使用 Hailo 这张 AI 加速卡，需要逐步完成以下三个部分的内容：  

1. **PCIe 支持**：确保硬件上 PCIe M.2 可以识别设备。  
2. **Hailo PCIe 驱动的安装**：用于与加速卡硬件进行交互。  
3. **Hailo RT 库的安装**：用于调用 Hailo PCIe 驱动。  

截至本文更新时间，驱动与 RT 库的最新版本均为 **4.20.0**。  

参考链接：  
[https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/?sp_referrer=install/install.html#installation-on-ubuntu](https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/?sp_referrer=install/install.html#installation-on-ubuntu)  

[https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/](https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/)

[https://community.hailo.ai/t/how-could-i-install-the-hailort-driver-into-rockchip-device-such-as-rk3588/124/2](https://community.hailo.ai/t/how-could-i-install-the-hailort-driver-into-rockchip-device-such-as-rk3588/124/2)

[https://medium.com/@zlodeibaal/how-to-run-hailo-on-arm-boards-d2ad599311fa](https://medium.com/@zlodeibaal/how-to-run-hailo-on-arm-boards-d2ad599311fa)



从官方文档来看，驱动和 RT 库都可以使用 `.deb` 进行安装。但由于没有编译出 `linux-header` 标头文件，因此选择从源码 SDK 编译驱动，而 RT 库使用 `.deb` 进行安装。  

> **说明**：驱动使用 `.deb` 安装的原理是利用 `linux-header` 在目标设备上进行本地编译。  

---

## 2. PCIe 设备检测  

使用 `lspci` 命令检查是否检测到 Co-processor 设备：  

```bash
lspci | grep Co-processor
```

如果输出类似以下内容，则可以进行驱动安装：  

```
0000:01:00.0 Co-processor: Device 1e60:2864 (rev 01)
```

如果未检测到设备，请参考 **BUG 解决** 部分。  

---

## 3. 从源码编译驱动  

### 3.1 下载驱动源码  

指定要下载的版本（示例中为 `v4.xx.x`，请根据需要替换）：  

```bash
git clone --depth 1 -b v4.xx.x https://github.com/hailo-ai/hailort-drivers.git
```

**建议**：驱动文件下载到 `SDK/kernel/driver` 目录下。  

> **Windows 下载注意事项**  
> 由于某些原因，如果需要在 Windows 主机上下载驱动再移动到 Linux 主机进行编译，请执行以下命令：  
>  
> ```bash
> git config --global core.autocrlf input
> ```
>  
> 这样可以强制下载的文件行尾序列为 `LF`，避免 `CRLF` 造成的问题。  

确认已下载的 HailoRT 驱动版本：  

```bash
git -C hailort-drivers/ log -1
```

将 `hailort-drivers` 放到 `SDK/kernel/driver/` 目录下。  

---

### 3.2 配置驱动编译  

#### **修改 Makefile**  

```bash
echo "obj-y       += hailort-drivers/linux/pcie/" >> Makefile
```

> **注意**：  
> 直接修改 `Makefile` 可能会导致 `defconfig` 无法灵活配置该选项，因此推荐以下方式。  

#### **修改 Kconfig**  

在 `kernel/arch/arm64/Kconfig` 添加：  

```makefile
config HAILO
    bool "Enable Hailo Support"
    default y
```

#### **修改 defconfig**  

在 `kernel/arch/arm64/configs/rockchip_linux_defconfig` 添加：  

```makefile
CONFIG_HAILO=y
```

#### **修改 kernel/drivers/Makefile**  

```makefile
# Hailo M.2 加速卡驱动
obj-$(CONFIG_HAILO)       += hailort-drivers/linux/pcie/
```

---

### 3.3 编译驱动并确认 `hailo_pci.ko`  

执行以下命令进行编译：  

```bash
./build.sh kernel
```

成功编译后，驱动文件应位于：  

```bash
kernel/drivers/hailort-drivers/linux/pcie/hailo_pci.ko
```

---

### 3.4 下载固件  

```bash
./kernel/drivers/hailort-drivers/download_firmware.sh
```

---

## 4. 复制驱动与固件到目标板  

### 4.1 需要准备的文件  

- **hailo_pci.ko**（位于 `SDK/kernel/drivers/hailort-drivers/linux/pcie/hailo_pci.ko`）  
- **51-hailo-udev.rules**（位于 `SDK/kernel/drivers/hailort-drivers/linux/pcie/51-hailo-udev.rules`）  
- **hailo8_fw.4.xx.x.bin**（由 `download_firmware.sh` 下载，文件保存在命令执行的路径下）  
- **modules.builtin**（位于 `SDK/kernel/modules.builtin`）  
- **modules.order**（位于 `SDK/kernel/modules.order`）  

### 4.2 复制文件到目标板  
1. 创建驱动目录：
   ```bash
   sudo mkdir -p /usr/lib/modules/<kernel_version>/kernel/drivers/hailo
   ```
2. 复制驱动文件：
   ```bash
   sudo cp hailo_pci.ko /usr/lib/modules/<kernel_version>/kernel/drivers/hailo
   ```
3. 复制 `modules.builtin` 和 `modules.order`：
   ```bash
   sudo cp modules.builtin /usr/lib/modules/<kernel_version>/
   sudo cp modules.order /usr/lib/modules/<kernel_version>/
   ```
4. 创建固件目录并移动固件：
   ```bash
   sudo mkdir -p /lib/firmware/hailo
   sudo mv hailo8_fw.4.xx.0.bin /lib/firmware/hailo/hailo8_fw.bin
   ```
5. 复制 udev 规则：
   ```bash
   sudo cp 51-hailo-udev.rules /etc/udev/rules.d/
   ```

### 4.3 使用脚本进行4.2的操作
也可使用 `install_hailo_driver.sh` 脚本执行4.2的复制操作。
`install_hailo_driver.sh`脚本内容：
- 需要根据实际的环境修改
1. /lib/modules/下的库名称（可能和uname -r获取到的不一致，参见文末）
2. FIRMWARE_FILE="hailo8_fw.4.20.0.bin"固件版本号
```sh
#!/bin/bash

# 获取当前系统的内核版本
# KERNEL_VERSION=$(uname -r)
KERNEL_VERSION=5.10.160

# 目标路径
DRIVER_DIR="/usr/lib/modules/$KERNEL_VERSION/kernel/drivers/hailo"
FIRMWARE_DIR="/lib/firmware/hailo"
UDEV_RULES_DIR="/etc/udev/rules.d"

# 需要复制的文件
DRIVER_FILE="hailo_pci.ko"
MODULES_BUILTIN_FILE="modules.builtin"
MODULES_ORDER_FILE="modules.order"
FIRMWARE_FILE="hailo8_fw.4.20.0.bin"
UDEV_RULES_FILE="51-hailo-udev.rules"

# 检查是否以 root 权限运行
if [[ $EUID -ne 0 ]]; then
   echo "请使用 sudo 运行此脚本！"
   exit 1
fi

echo "步骤 1: 创建驱动目录..."
sudo mkdir -p "$DRIVER_DIR"

echo "步骤 2: 复制驱动文件..."
if [[ -f "$DRIVER_FILE" ]]; then
    sudo cp "$DRIVER_FILE" "$DRIVER_DIR"
else
    echo "错误: 找不到 $DRIVER_FILE 文件！"
    exit 1
fi

echo "步骤 3: 复制 modules.builtin 和 modules.order..."
if [[ -f "$MODULES_BUILTIN_FILE" ]]; then
    sudo cp "$MODULES_BUILTIN_FILE" "/usr/lib/modules/$KERNEL_VERSION/"
else
    echo "错误: 找不到 $MODULES_BUILTIN_FILE 文件！"
    exit 1
fi

if [[ -f "$MODULES_ORDER_FILE" ]]; then
    sudo cp "$MODULES_ORDER_FILE" "/usr/lib/modules/$KERNEL_VERSION/"
else
    echo "错误: 找不到 $MODULES_ORDER_FILE 文件！"
    exit 1
fi

echo "步骤 4: 创建固件目录并移动固件..."
sudo mkdir -p "$FIRMWARE_DIR"

if [[ -f "$FIRMWARE_FILE" ]]; then
    sudo mv "$FIRMWARE_FILE" "$FIRMWARE_DIR/hailo8_fw.bin"
else
    echo "错误: 找不到 $FIRMWARE_FILE 文件！"
    exit 1
fi

echo "步骤 5: 复制 udev 规则..."
if [[ -f "$UDEV_RULES_FILE" ]]; then
    sudo cp "$UDEV_RULES_FILE" "$UDEV_RULES_DIR/"
else
    echo "错误: 找不到 $UDEV_RULES_FILE 文件！"
    exit 1
fi

echo "Hailo 驱动文件复制完成！"

# echo "步骤 6: 更新模块依赖并重新加载 udev 规则..."
# sudo depmod
# sudo udevadm control --reload-rules
# sudo udevadm trigger

# echo "步骤 7: 尝试加载驱动模块..."
# sudo modprobe hailo_pci

# echo "Hailo 驱动安装完成！"
```

---

## 5. 加载驱动并设置开机自动加载  

运行 `depmod` 并加载驱动：  

```bash
sudo depmod -a
sudo modprobe hailo_pci
```

将驱动加入开机加载：  

```bash
echo hailo_pci | sudo tee -a /etc/modules
```

重启设备后，使用 `lsmod` 检查是否加载了驱动。  

---

## 6. 问题解决  

### 6.1 `modprobe` 错误：Exec format error  

**错误信息**：  

```bash
modprobe: ERROR: could not insert 'hailo_pci': Exec format error
```

**原因**：  

- `hailo_pci.ko` 模块与当前内核不匹配。  
- 编译时 Git 仓库状态不干净，导致 `dirty` 后缀问题。  

**检查步骤**：  

```bash
uname -r  # 检查当前内核版本
modinfo hailo_pci.ko | grep vermagic  # 检查驱动 vermagic
```

如果两者版本不一致，请重新编译驱动，并确保内核和驱动同时编译。  

---

### 6.2 `depmod -a` 错误  

**错误信息**：  

```bash
depmod: ERROR: could not open directory /lib/modules/5.10.160+: No such file or directory
depmod: FATAL: could not search modules: No such file or directory
```

**解决方案**：  

1. **检查 `/lib/modules/` 目录名称**，确保 `uname -r` 输出的版本和 `/lib/modules/` 目录名一致。  
2. **创建软链接** 规避 `depmod` 报错：  

```bash
sudo ln -s /lib/modules/5.10.160/ /lib/modules/5.10.160+
```
