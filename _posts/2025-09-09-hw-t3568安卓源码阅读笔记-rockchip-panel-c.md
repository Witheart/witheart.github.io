---
title: "rockchip_panel.c"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "HW-T3568安卓源码阅读笔记"
tags:
  - "HW-T3568安卓源码阅读笔记"
permalink: /hw-t3568安卓源码阅读笔记/rockchip-panel-c/
toc: true
---

u-boot/drivers/video/drm/rockchip_panel.c
# 开发指南
struct rockchip_panel_priv
用于存储与 Rockchip 显示面板相关的各种配置和状态信息（比如添加控制gpio）

func rockchip_panel_probe
通过指定的名字在设备树中请求屏幕控制的gpio资源

func panel_simple_prepare
用于控制屏幕面板上电


# 代码解析
### 包含文件
- **包含文件**: 包含了DRM（直接渲染管理器）、各种系统实用工具、GPIO控制、设备管理、电源调节以及自定义的Rockchip显示相关头文件。

### 数据结构
1. **rockchip_cmd_header**: 定义了面板通信中使用的命令头的结构。
2. **rockchip_cmd_desc**: 描述一个带有头部和有效载荷的命令。
3. **rockchip_panel_cmds**: 包含要发送到面板的一系列命令。
4. **rockchip_panel_plat**: 包含平台数据，如电源设置、总线格式以及面板初始化和去初始化时的命令序列。
   - `power_invert`: 指示是否需要反转电源供应。
   - `bus_format`: 指定媒体总线格式。
   - `bpc`: 每分量位数。
   - `delay`: 面板操作的各种时间延迟。
   - `on_cmds` 和 `off_cmds`: 用于打开和关闭面板的命令序列。

5. **rockchip_panel_priv**: 面板驱动的私有数据，包括用于控制背光、电源和复位的GPIO描述符。

### 函数

- **get_panel_cmd_type**: 确定命令接口类型（SPI或MCU）。
- **rockchip_panel_parse_cmds**: 将命令数据解析成结构化的格式以便发送到面板。
- **rockchip_panel_write_spi_cmds**: 通过SPI写入命令。
- **rockchip_panel_send_mcu_cmds**, **rockchip_panel_send_spi_cmds**, **rockchip_panel_send_dsi_cmds**: 通过不同接口（MCU、SPI、DSI）发送命令的函数。

- **panel_simple_prepare**, **panel_simple_unprepare**: 管理面板的准备（上电、初始化）和去准备（断电、去初始化）过程。
  - 这些函数处理GPIO设置、电源管理以及打开或关闭面板时必要的命令序列。

- **panel_simple_enable**, **panel_simple_disable**: 启用或禁用面板的功能，特别是管理背光。

- **rockchip_panel_ofdata_to_platdata**: 将设备树数据翻译成面板的平台数据。

- **rockchip_panel_probe**: 面板驱动的初始化函数，设置GPIO、电源供应和背光。

### 设备树支持
- 驱动程序使用设备树绑定来配置面板，允许灵活地设置GPIO引脚、电源供应和命令序列。

### 驱动程序注册
- 代码以向U-Boot的驱动模型注册驱动程序结束，指定其名称、类别、兼容字符串以及必要的探测和设置函数指针。
