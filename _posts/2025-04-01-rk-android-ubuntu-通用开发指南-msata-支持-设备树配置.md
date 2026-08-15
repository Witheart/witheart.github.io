---
title: "mSATA 支持——设备树配置"
date: 2025-04-01
last_modified_at: 2025-04-01
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/msata-支持-设备树配置/
toc: true
---

概要：本文介绍了 mSATA 接口在设备树中的配置方法，指出其与 PCIe 接口资源复用的特性，以及如何在 Rockchip 平台的设备树文件中启用或禁用相应功能。


## 1. mSATA 与 PCIe 的资源复用关系

mSATA 接口复用了 PCIe 的硬件资源，因此在系统中不能同时启用 mSATA 和 PCIe，否则会导致 SATA 无法使用。

---

## 2. 设备树配置说明

配置文件路径：  
kernel/arch/arm64/boot/dts/rockchip/NK-R36S0.dtsi

### 2.1 配置示例

以下为设备树中关于 SATA 与 PCIe 的配置片段：

```dtsi
//==========sata 或 pcie 配置开始==========
//sata 和 pcie 不能共用
&sata2 {
    status = "okay";
};
 
//pciex2
#if 0
&pcie2x1 {
        reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_HIGH>;
        vpcie3v3-supply = <&vcc3v3_pcie>;
        status = "okay";
};
#endif
//==========sata 或 pcie 配置结束==========
```

### 2.2 配置说明

- 若要启用 mSATA（即启用 SATA 功能）：
  - 设置 &sata2 的 status 为 "okay"
  - 注释掉或关闭 &pcie2x1 的配置

- 若要启用 PCIe：
  - 设置 &pcie2x1 的 status 为 "okay"
  - 注释掉或关闭 &sata2 的配置

---

## 3. 参考资料

- RK 官方文档：  
  RK官方文档\01、Linux\Common\PCIe\Rockchip_Developer_Guide_PCIe_CN.pdf
