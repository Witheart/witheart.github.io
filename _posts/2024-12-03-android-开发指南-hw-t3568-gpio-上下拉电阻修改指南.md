---
title: "**HW-T3568 GPIO 上下拉电阻修改指南**"
date: 2024-12-03
last_modified_at: 2024-12-03
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/hw-t3568-gpio-上下拉电阻修改指南/
toc: true
---

## **目的**
修改 RK3568 的上下拉电阻，设置指定 GPIO 的默认电平。

- **注意**：上下拉电阻无法通过终端直接修改。  
  终端仅支持：
  - 配置 GPIO 方向
  - 配置 GPO 输出电平  
  **无法配置 GPI 默认电平。**

---

## **GPIO 编号计算**
GPIO 编号按照以下公式计算（可以使用GPIO编号计算器.html计算）：

```text
GPIO 编号 = 32 × 组号 + 8 × 端口字母值 + 引脚号
```

- **规则说明**：
  1. **组号**：GPIO1 为第 1 组，GPIO2 为第 2 组，依此类推。
  2. **端口字母**：A 对应 0，B 对应 1，C 对应 2，依此类推。
  3. **引脚号**：端口字母后的数字。

**示例**：计算 GPIO2_A2 的编号  
```text
GPIO 编号 = 32 × 2（GPIO2 为第 2 组） + 8 × 0（A 对应 0） + 2 = 66
结果：gpio66
```

---

## **调试手段**
### 1. **硬件手段**
- 使用万用表直接测量 GPIO 引脚电平。

### 2. **终端命令**
以下命令可用于调试 GPIO：

```bash
# 查看所有 GPIO 状态
cat /d/gpio

# 配置 GPIO 方向
echo in/out > /sys/class/gpio/gpio[编号]/direction
# 示例：echo in > /sys/class/gpio/gpio40/direction

# 配置 GPO 高/低电平
echo 1/0 > /sys/class/gpio/gpio[编号]/value
# 示例：echo 1 > /sys/class/gpio/gpio146/value

# 读取 GPI 电平
cat /sys/class/gpio/gpio[编号]/value
# 示例：cat /sys/class/gpio/gpio146/value
```

---

## **GPI 默认电平配置**
### **错误尝试**
- **操作**：将引脚先配置为 GPO 并拉高输出电平，再改为 GPI。  
- **结果**：无法改变 GPI 默认电平，推测 RK3568 内部的 GPI 和 GPO 使用不同电路。

### **正确方法**
上下拉电阻需通过 **设备树** 配置：

1. **设备树修改**  
   修改文件：`kernel/scripts/dtc/include-prefixes/arm64/rockchip/NK_RK3568.dtsi`
   ![alt text](/assets/images/android-开发指南/hw-t3568-gpio-上下拉电阻修改指南/image.png)
   ```dts
   /* 示例代码：配置 GPIO 默认上下拉电阻 */
   &pinctrl {
      ...
       nk_io_init {
           nk_io_gpio: nk-io-gpio{
               rockchip,pins =    ...
                                 //gpi gpo gpio
                                 //（此处只配置上下拉电阻，以后不在此做GPIO方向配置，方向配置请移步 init.rockchip.rc）
                                 <1 RK_PB0 RK_FUNC_GPIO &pcfg_pull_down>,
                                 <2 RK_PD7 RK_FUNC_GPIO &pcfg_pull_up>,
                                 <4 RK_PC4 RK_FUNC_GPIO &pcfg_pull_down>,
                                 <1 RK_PA4 RK_FUNC_GPIO &pcfg_pull_up>,	

                                 <4 RK_PD2 RK_FUNC_GPIO &pcfg_pull_down>,
                                 <1 RK_PB1 RK_FUNC_GPIO &pcfg_pull_up>,
                                 <1 RK_PB2 RK_FUNC_GPIO &pcfg_pull_down>,
                                 <3 RK_PA0 RK_FUNC_GPIO &pcfg_pull_up>,
                                 ...
                     }
       };
   };
   ```

2. **GPIO 初始方向与电平配置**  
   修改文件：`device/rockchip/common/init.rockchip.rc`
   ![alt text](/assets/images/android-开发指南/hw-t3568-gpio-上下拉电阻修改指南/image-1.png)

   注意：init.rc 使用的语法与终端不同，需使用 write 命令。
   ```sh
   # 示例代码：设置 GPIO 初始化
   # 配置 GPIO42 为输入
   write /sys/class/gpio/export 42
   write /sys/class/gpio/gpio42/direction "in"
   chmod 777 /sys/class/gpio/gpio42/value

   # 配置 GPIO96 为输出，默认电平为 0
   write /sys/class/gpio/export 96
   write /sys/class/gpio/gpio96/direction "out"
   chmod 777 /sys/class/gpio/gpio96/value
   write /sys/class/gpio/gpio96/value 0
   ```
