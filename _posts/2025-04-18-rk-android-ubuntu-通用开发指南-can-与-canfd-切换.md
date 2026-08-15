---
title: "CAN 与 CANFD 切换"
date: 2025-04-18
last_modified_at: 2025-04-18
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/can-与-canfd-切换/
toc: true
---

概要：本文介绍了在硬件支持的情况下，如何在普通CAN和CANFD之间进行切换，包括驱动层面的配置和运行时的参数设置。  


## 1. CANFD 兼容性说明  

- **CANFD 接收兼容性**：CANFD 接收可以兼容普通 CAN 帧。  
- **CANFD 发送特性**：CANFD 发送时会发送 FD 帧，普通 CAN 设备会将其视为错误帧。  

---

## 2. 切换方式  

有两种方式进行 CAN 和 CANFD 的切换：  
1. 从驱动层面上进行切换。  
2. 使用 canfd 驱动，但通过 FD 功能的开关进行切换。  

---

## 3. 方式一：驱动层面的切换  

### 3.1 defconfig 中的配置选项  

在 `defconfig` 中，以下是与 CAN 相关的驱动选项：  

- `CONFIG_CAN=y`  
- `CONFIG_CAN_RAW=y`  
- `CONFIG_CAN_BCM=y`  
- `CONFIG_CAN_GW=y`  
- `CONFIG_CAN_DEV=y`  
- `CONFIG_CAN_CALC_BITTIMING=y`  
- `CONFIG_CAN_ROCKCHIP=y`  
- `CONFIG_CANFD_ROCKCHIP=y`  

其中：  
- `CONFIG_CAN_ROCKCHIP=y` 控制普通 CAN 驱动的编译。  
- `CONFIG_CANFD_ROCKCHIP=y` 控制 CANFD 驱动的编译。  

这些选项的配置文件路径为：  
- **Kconfig**：`kernel/drivers/net/can/rockchip/Kconfig`  
- **Makefile**：`kernel/drivers/net/can/rockchip/Makefile`  

### 3.2 设备树中的驱动使能  

在设备树的 CAN 节点中，需要设置 `compatible` 属性以选择使用的驱动：  

```dts
can0: can@fe570000 {
    compatible = "rockchip,can-1.0";  // 使用普通 CAN 驱动
    // compatible = "rockchip,canfd-1.0";  // 使用 CANFD 驱动
    reg = <0x0 0xfe570000 0x0 0x1000>;
    interrupts = <GIC_SPI 1 IRQ_TYPE_LEVEL_HIGH>;
    clocks = <&cru CLK_CAN0>, <&cru PCLK_CAN0>;
    clock-names = "baudclk", "apb_pclk";
    resets = <&cru SRST_CAN0>, <&cru SRST_P_CAN0>;
    reset-names = "can", "can-apb";
    tx-fifo-depth = <1>;
    rx-fifo-depth = <6>;
    status = "okay";
};
```  

---

## 4. 方式二：运行时参数切换  

### 4.1 使用普通 CAN  

通过以下命令设置 CAN 接口为普通模式：  

```bash
ip link set can0 type can bitrate 1000000 fd off
```  

### 4.2 使用 CANFD  

通过以下命令设置 CAN 接口为 CANFD 模式，并指定仲裁域波特率和数据域波特率：  

```bash
ip link set can0 type can bitrate 1000000 dbitrate 3000000 fd on
```  

### 4.3 验证参数设置  

- 将节点启动：  

```bash
ip link set can0 up
```  

如果没有报错，则说明参数设置正确。  

- 查看节点详细信息：  

```bash
ip -details link show can0
```  

在输出中，检查以下内容以确认 CANFD 是否启用：  

```
can <FD> state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 100
```  

- **如果显示 `<FD>`**：说明 CANFD 已开启。  
- **如果不显示 `<FD>`**：说明 CANFD 未开启，当前为普通 CAN 模式。  

### 4.4 示例  

#### 4.4.1 CANFD 开启的示例  

```bash
rk3568_HW:/ # ip -d link show can0  
3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 72 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10  
    link/can  promiscuity 0  
    can <FD> state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 100  
          bitrate 1003378 sample-point 0.864  
          tq 26 prop-seg 15 phase-seg1 16 phase-seg2 5 sjw 1  
          rockchip_canfd: tseg1 1..128 tseg2 1..128 sjw 1..128 brp 1..256 brp-inc 2  
          dbitrate 2970000 dsample-point 0.720  
          dtq 13 dprop-seg 8 dphase-seg1 9 dphase-seg2 7 dsjw 1  
          rockchip_canfd: dtseg1 1..32 dtseg2 1..16 dsjw 1..16 dbrp 1..256 dbrp-inc 2  
          clock 148500000 numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535  
```  

#### 4.4.2 CANFD 关闭的示例  

```bash
rk3568_HW:/ # ip -d link show can0  
3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 16 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10  
    link/can  promiscuity 0  
    can state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 100  
          bitrate 1003378 sample-point 0.864  
          tq 26 prop-seg 15 phase-seg1 16 phase-seg2 5 sjw 1  
          rockchip_canfd: tseg1 1..128 tseg2 1..128 sjw 1..128 brp 1..256 brp-inc 2  
          dbitrate 2970000 dsample-point 0.720  
          dtq 13 dprop-seg 8 dphase-seg1 9 dphase-seg2 7 dsjw 1  
          rockchip_canfd: dtseg1 1..32 dtseg2 1..16 dsjw 1..16 dbrp 1..256 dbrp-inc 2  
          clock 148500000 numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535  
```
