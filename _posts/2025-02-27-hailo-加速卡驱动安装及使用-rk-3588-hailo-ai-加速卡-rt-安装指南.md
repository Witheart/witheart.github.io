---
title: "RK 3588 Hailo AI 加速卡 RT 安装指南"
date: 2025-02-27
last_modified_at: 2025-02-27
categories:
  - "hailo 加速卡驱动安装及使用"
tags:
  - "hailo 加速卡驱动安装及使用"
permalink: /hailo-加速卡驱动安装及使用/rk-3588-hailo-ai-加速卡-rt-安装指南/
toc: true
---

## 1. 安装概述  

要使用 Hailo AI 加速卡，需要完成以下三部分内容：  

1. **PCIe 支持**：确保硬件上 PCIe M.2 可以识别设备。  
2. **Hailo PCIe 驱动安装**：用于与加速卡硬件进行交互。  
3. **Hailo RT 库安装**：用于调用 Hailo PCIe 驱动。  

截至本文更新时间，驱动与 RT 库的最新版本均为 **4.20.0**。  
本文介绍 **Hailo RT 库的安装**，请先确保前两步已经完成。  

### 参考链接  

- [Hailo RT 安装文档](https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/?sp_referrer=install/install.html#installation-on-ubuntu)  
- [Hailo 官方文档](https://hailo.ai/developer-zone/documentation/hailort-v4-20-0/)  
- [Rockchip 设备 Hailort 驱动安装指南](https://community.hailo.ai/t/how-could-i-install-the-hailort-driver-into-rockchip-device-such-as-rk3588/124/2)  
- [如何在 ARM 板上运行 Hailo](https://medium.com/@zlodeibaal/how-to-run-hailo-on-arm-boards-d2ad599311fa)  

---

## 2. 下载 RT 库  

前往 [Hailo 开发者专区](https://hailo.ai/developer-zone/software-downloads/) 下载 **RT 库的 `.deb` 安装包**。  

示例下载界面：  
![Hailo 下载页面](/assets/images/hailo-加速卡驱动安装及使用/rk-3588-hailo-ai-加速卡-rt-安装指南/image.png)  
![Hailo 软件包](/assets/images/hailo-加速卡驱动安装及使用/rk-3588-hailo-ai-加速卡-rt-安装指南/image-1.png)  

---

## 3. 安装 RT 库  

### 3.1 传输 `.deb` 文件  

将下载的 `hailort_4.20.0_arm64.deb` 传输到目标 RK3588 设备。  

### 3.2 执行安装命令  

```sh
sudo dpkg --install hailort_4.20.0_arm64.deb
```

安装过程中需要输入 `y` 确认，示例如下：  

```sh
正在选中未选择的软件包 hailort。
(正在读取数据库 ... 系统当前共安装有 103350 个文件和目录。)
准备解压 hailort_4.20.0_arm64.deb  ...
正在解压 hailort (4.20.0) ...
正在设置 hailort (4.20.0) ...
Do you wish to activate hailort service? (required for most pyHailoRT use cases) [y/N]:
Starting hailort.service
Created symlink /etc/systemd/system/multi-user.target.wants/hailort.service → /lib/systemd/system/hailort.service.
```

---

## 4. 验证安装  

### 4.1 设备检测  

重启设备后，执行以下命令检查 Hailo 设备是否被识别：  

```sh
hailortcli scan
```

**正确输出示例**：  

```sh
Hailo Devices:
[-] Device: 0000:01:00.0
```

### 4.2 PCIe 设备检测  

运行 `lspci` 命令，检查输出是否包含 Hailo 设备：  

```sh
lspci
```

**正确输出示例**：  

```sh
0000:01:00.0 Co-processor: Hailo Technologies Ltd. Hailo-8 AI Processor (rev 01)
```

如果未检测到 Hailo 设备，可尝试更新 PCI 设备 ID，需要联网：  

```sh
sudo update-pciids
```

更新完成后，再次运行 `lspci`，应能看到 Hailo 设备信息。

---

至此，Hailo RT 库已成功安装，并且 PCIe 设备可以正常识别 Hailo AI 加速卡。如果 `hailortcli scan` 和 `lspci` 输出正确，则说明安装成功。  
