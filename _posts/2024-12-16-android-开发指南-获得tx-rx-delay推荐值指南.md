---
title: "获得TX_RX_delay推荐值指南"
date: 2024-12-16
last_modified_at: 2024-12-16
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/获得tx-rx-delay推荐值指南/
toc: true
mathjax: true
---

# 背景说明
- 在 Rockchip 平台中，TX 和 RX delay 指的是 MAC 芯片和 PHY 芯片之间，时钟和数据相位的延迟调整。由于千兆网卡的高频信号更容易受到 PCB layout 走线和电磁干扰的影响，RGMII 接口需要进行精确的时序配置。如果测试中出现吞吐率不足、不稳定或 TX、RX 不通的现象，可以通过调整 tx_delay 和 rx_delay 参数（如 dts 中的配置值）来优化时序，确保网络稳定运行。
- 本 SOP 详细说明了如何通过 ADB 连接进行网口调试和测试操作，最终获得TX_RX_delay推荐值。


## 环境准备

1. **打开两个终端窗口：**

   - **窗口 1**：用于执行命令。
   - **窗口 2**：用于查看并过滤 `logcat` 日志。
2. **启动 ADB shell：**

   - 在两个窗口中都执行以下命令进入 ADB 环境：
     ```bash
     adb shell
     ```
3. **或者不使用ADB，只使用串口调试工具**

---

## 步骤 1：配置并查看 `logcat`
**如果只使用串口调试工具，不使用ADB，那么不需要执行步骤1。**

在 **窗口 2** 中，按照以下操作查看并过滤指定的 `logcat` 日志：

1. 执行以下命令进入 `logcat` 查看模式：
   ```bash
   logcat | grep -i -E "dwmac|ethernet|RTL8211F|eth1|test led ctrl|RX\(0x|tx_delay|rx_delay|PTP|IEEE 1588|PHY loopback|loopback: PASS"
   ```

   - 该命令将过滤包含以下关键字的日志信息：`dwmac`、`ethernet`、`RTL8211F`、`eth1`、`test led ctrl`、`RX(0x`、`tx_delay`、`rx_delay`、`PTP`、`IEEE 1588`、`PHY loopback`、`loopback: PASS`。

---

## 步骤 2：进入目标目录并执行测试

按照以下操作进行命令执行：

1. 进入设备的 `/sys/devices/platform` 目录：

   ```bash
   cd /sys/devices/platform
   ```
2. 使用 `ls` 命令找到与 **ethernet** 相关的节点，并进入对应目录。例如：

   ```bash
   ls
   cd <ethernet_node_directory>
   ```
3. 执行网口测试命令：

   ```bash
   echo 1000 > phy_lb_scan
   ```

   - 执行该命令时，网口对应的指示灯会闪烁。
   - 执行结果如下图所示：

     ![1733991124976](/assets/images/android-开发指南/获得tx-rx-delay推荐值指南/image/测试流程/1733991124976.png)
4. 测试执行结束后，系统会返回一个推荐值，结果如下图所示：
   ![1733991356888](/assets/images/android-开发指南/获得tx-rx-delay推荐值指南/image/测试流程/1733991356888.png)

---

### 步骤 3：设置推荐值并验证

1. **写入推荐值到延迟寄存器：**

   ```bash
   echo 0x36 0x22 > rgmii_delayline
   ```

   - `0x36` 和 `0x22` 为示例推荐值，请根据实际测试结果填写相应值。
2. **验证推荐值是否写入成功：**

   ```bash
   cat rgmii_delayline
   ```

   - 输出应显示类似：
     ```
     tx delayline: 0x36, rx delayline: 0x22
     ```

---

### 步骤 4：使用推荐值执行回环测试

1. **执行回环测试命令：**

   ```bash
   echo 1000 > phy_lb
   ```
   - 确保测试结果输出 **PASS**，如下图所示：
     ![1733990719634](/assets/images/android-开发指南/获得tx-rx-delay推荐值指南/image/测试流程/1733990719634.png)
2. **记录：**

   - 如果测试结果为 **PASS**，请记录下推荐值，并根据多个板子的测试推荐值，最终得到时候这个版型的推荐值。
   - 如果测试结果为 **FAIL**，请参考《Rockchip_Developer_Guide_Linux_GMAC_RGMIl_Delayline_CN.pdf》P4。
