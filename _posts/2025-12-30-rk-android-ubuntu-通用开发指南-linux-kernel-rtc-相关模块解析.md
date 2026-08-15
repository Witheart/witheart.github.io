---
title: "Linux kernel RTC 相关模块解析"
date: 2025-12-30
last_modified_at: 2025-12-30
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/linux-kernel-rtc-相关模块解析/
toc: true
---

概要：本文介绍了 Linux 内核中 RTC（实时时钟）模块的代码路径和调用流程，分析了 ioctl 接口的实现逻辑，并提供了使用 C/C++ 语言调用 RTC 接口读取时间的示例。适合希望深入了解 RTC 驱动机制的开发者阅读。


## 1. 代码路径解析  

### 1.1 基本路径  
- RTC 驱动代码路径：  
  ```
  kernel/drivers/rtc
  ```

### 1.2 ioctl 接口实现  
- 接口文件位置：  
  ```
  kernel/drivers/rtc/rtc-dev.c
  ```

- ioctl 函数定义：  
  ```c
  static long rtc_dev_ioctl(struct file *file,
  		unsigned int cmd, unsigned long arg)
  ```

- 主要命令说明：
  - **设置 RTC 时间**
    ```c
    case RTC_SET_TIME:
        if (!capable(CAP_SYS_TIME))
            err = -EACCES;
        break;
    ```
  - **读取 RTC 时间**
    ```c
    case RTC_RD_TIME:
    ```
  - **设置闹钟时间**
    ```c
    case RTC_ALM_SET:
    ```
  - **读取闹钟时间**
    ```c
    case RTC_ALM_READ:
    ```

### 1.3 接口函数调用关系  
- 命令调用的接口在以下文件中实现：  
  ```
  kernel/drivers/rtc/interface.c
  ```

- 读取 RTC 时间的函数流程：
  ```c
  rtc_read_time(struct rtc_device *rtc, struct rtc_time *tm)
  ->
  static int __rtc_read_time(struct rtc_device *rtc, struct rtc_time *tm)
  ```

### 1.4 具体驱动实现  
- 驱动文件示例：  
  ```
  kernel/drivers/rtc/rtc-hym8563.c
  ```

- 操作结构体定义：
  ```c
  static const struct rtc_class_ops hym8563_rtc_ops = {
      .read_time = hym8563_rtc_read_time,
  };
  ```

- 实际读取时间的函数：
  ```c
  static int hym8563_rtc_read_time(struct device *dev, struct rtc_time *tm)
  {
      ret = i2c_smbus_read_i2c_block_data(client, HYM8563_SEC, 7, buf);
      // 使用 I2C 操作寄存器读取数据
  }
  ```

---

## 2. C/C++ ioctl 操作 RTC 方法  

```c
#include <stdio.h>
#include <fcntl.h>
#include <linux/rtc.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <time.h>

int main() {
    int fd, ret;
    struct rtc_time rtc_tm;
    
    // 打开RTC设备
    fd = open("/dev/rtc0", O_RDONLY);
    if (fd < 0) {
        perror("打开RTC设备失败");
        return -1;
    }
    
    // 读取RTC时间
    ret = ioctl(fd, RTC_RD_TIME, &rtc_tm);
    if (ret < 0) {
        perror("读取RTC时间失败");
        close(fd);
        return -1;
    }
    
    printf("RTC时间: %04d-%02d-%02d %02d:%02d:%02d\n",
           rtc_tm.tm_year + 1900, rtc_tm.tm_mon + 1, rtc_tm.tm_mday,
           rtc_tm.tm_hour, rtc_tm.tm_min, rtc_tm.tm_sec);
    
    close(fd);
    return 0;
}
```
