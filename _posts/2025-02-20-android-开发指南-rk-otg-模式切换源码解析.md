---
title: "RK OTG 模式切换源码解析"
date: 2025-02-20
last_modified_at: 2025-02-20
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/rk-otg-模式切换源码解析/
toc: true
---

概要：本文解析了 RK Android 系统中 OTG 模式切换的实现方式，介绍了相关的系统属性 `persist.usb3.otg.mode` 及其在源码中的应用，并详细分析了 OTG 模式切换的底层逻辑。  


## 1. OTG 模式切换的系统属性  

在 Android 系统设置中，有一个 OTG 模式切换开关：  

![OTG 开关](/assets/images/android-开发指南/rk-otg-模式切换源码解析/image.png)  

这个开关的作用是切换 OTG 的主从机模式，而这个功能的实现依赖于系统属性 `persist.usb3.otg.mode`，该属性的定义位于 `device/rockchip/rk356x/device.mk` 文件中。  

- `persist.usb3.otg.mode=0`：设备处于 **强制主机模式**  
- `persist.usb3.otg.mode=1`：设备处于 **OTG主从自动切换模式**  

### 1.1 系统属性的存储位置  

该属性的值存储在系统 `/data/property/persistent_properties` 文件中，可以通过命令查看：  

```sh
cat /data/property/persistent_properties
```

示例输出（部分内容）：  

```
persist.usb3.otg.mode1
...
```

可见 `persist.usb3.otg.mode` 记录在其中。  

---

## 2. 如何修改 OTG 模式  

### 2.1 使用 `getprop` 和 `setprop`  

Android 提供了 `getprop` 和 `setprop` 命令来操作系统属性。  

- **查看当前 OTG 模式**  
  ```sh
  getprop persist.usb3.otg.mode
  ```  
- **修改 OTG 模式**  
  ```sh
  setprop persist.usb3.otg.mode 1  # OTG主从自动切换模式
  setprop persist.usb3.otg.mode 0  # 强制主机模式
  ```

设置成功后，系统会在 **最多 30 秒内** 使模式生效。  

---

## 3. OTG 模式切换的实现  

### 3.1 为什么需要等待 30 秒？  

在 `system/core/ril/main.c` 文件中，有一个线程负责每 30 秒检查一次 `persist.usb3.otg.mode`，并根据其值更新 OTG 模式。  

关键代码如下：  

```c
static void* pthread_func1 (void* data){
    char fileBuf[100];
    int size;
    char buf[512] = "\0";

    while (1) {
        sleep(30);
        size = readfile("/sys/devices/platform/fe8a0000.usb2-phy/otg_mode", (unsigned char*)fileBuf, sizeof(fileBuf));

        if(property_get("persist.usb3.otg.mode", buf, NULL) > 0) {
            // 设置主机模式
            if(strncmp(buf, "0", strlen("0")) == 0) {
                if(strncmp(fileBuf, "host", strlen("host")) != 0) {
                    system("echo host > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode");
                }        
            }

            // 设置 OTG 模式
            if(strncmp(buf, "1", strlen("1")) == 0) {
                if(strncmp(fileBuf, "otg", strlen("otg")) != 0) {
                    system("echo otg > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode");
                }        
            }        
        }    
    }
    return NULL;
}
```

### 3.2 线程逻辑解析  

1. 每 **30 秒** 读取 `/sys/devices/platform/fe8a0000.usb2-phy/otg_mode` 的当前值。  
2. 读取 `persist.usb3.otg.mode` 的值。  
3. 如果 `persist.usb3.otg.mode=0`，但当前模式不是 `host`，则执行：  
   ```sh
   echo host > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
   ```
4. 如果 `persist.usb3.otg.mode=1`，但当前模式不是 `otg`，则执行：  
   ```sh
   echo otg > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
   ```

---

## 4. 系统 OTG 开关的实现  

### 4.1 代码位置  

系统设置中的 OTG 开关位于：  

`packages/apps/Settings/src/com/android/settings/BrightnessOtg.java`  

### 4.2 点击事件逻辑  

```java
protected void onClick() {
    Log.e("=====", "BrightnessOtg");
    temp++;
    if (temp > 1) {
        temp = 0;
    }

    if (temp == 0) {
        setSummary(context.getString(R.string.storage_summary_off, " ", " "));
        SystemProperties.set("persist.usb3.otg.mode", "0");
    } else if (temp == 1) {
        setSummary(context.getString(R.string.storage_summary_open, " ", " "));
        SystemProperties.set("persist.usb3.otg.mode", "1");
    }
}
```

### 4.3 逻辑解析  

1. 当用户点击 OTG 开关时，`temp` 变量在 `0` 和 `1` 之间切换。  
2. **`temp=0` 时**，设置 `persist.usb3.otg.mode=0`，即 **强制主机模式**。  
3. **`temp=1` 时**，设置 `persist.usb3.otg.mode=1`，即 **OTG主从自动切换模式**。  
4. 线程会在 30 秒内读取该属性，并切换 OTG 模式。  

---

## 5. 直接使用命令行切换 OTG 模式  

除了修改 `persist.usb3.otg.mode`，还可以直接操作 `/sys/devices/platform/fe8a0000.usb2-phy/otg_mode`，但这样因为不会修改系统属性，30 秒后会被线程覆盖。  

### 5.1 不通过图形界面直接强制设置 OTG 模式  

```sh
# 强制主机模式
echo host > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode

# 强制从机模式
echo peripheral > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode

# 强制 OTG 自动识别模式
echo otg > /sys/devices/platform/fe8a0000.usb2-phy/otg_mode
```

### 5.2 避免被线程覆盖  

如果要使手动设置的模式不被 30 秒后线程修改，需要 **同步更新 `persist.usb3.otg.mode`**：  

```sh
setprop persist.usb3.otg.mode 0  # 或 1
```

---

## 6. 结论  

- `persist.usb3.otg.mode` 控制 OTG 主从机模式，存储在 `/data/property/persistent_properties`。  
- 线程每 30 秒检查 `persist.usb3.otg.mode`，并更新 `/sys/devices/platform/.../otg_mode`。  
- 系统设置的 OTG 开关直接修改 `persist.usb3.otg.mode`，触发线程更新模式。  
- 命令行可以直接修改 `/sys/.../otg_mode`，但 30 秒后会被线程覆盖，需同步更新 `persist.usb3.otg.mode`。  
