---
title: "使用 linux-header 板上编译模块测试"
date: 2025-09-01
last_modified_at: 2025-09-01
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/使用-linux-header-板上编译模块测试/
toc: true
---

在安装了Linux-Header后，可以编译一个简单内核模块验证：

## 1 创建测试模块
```c
// hello.c
#include <linux/module.h>
#include <linux/init.h>

MODULE_LICENSE("GPL");

static int __init hello_start(void) {
    printk(KERN_INFO "RK3588: Headers 5.10.160 loaded!\n");
    return 0;
}

static void __exit hello_end(void) {
    printk(KERN_INFO "RK3588: Module unloaded.\n");
}

module_init(hello_start);
module_exit(hello_end);
```

## 2 编写 Makefile
```make
obj-m := hello.o
KERNEL_SRC := /usr/src/linux-headers-5.10.160+
PWD := $(shell pwd)

all:
    $(MAKE) -C $(KERNEL_SRC) M=$(PWD) modules

clean:
    $(MAKE) -C $(KERNEL_SRC) M=$(PWD) clean
```

## 3 编译模块
```bash
make  # 成功会生成 hello.ko
```

## 4 加载测试
```bash
sudo insmod hello.ko         # 加载模块
sudo rmmod hello             # 卸载模块
sudo dmesg | tail -10        # 查看内核日志
```
**成功输出：**  
```
[  123.456789] RK3588: Headers 5.10.160 loaded!
[  125.789012] RK3588: Module unloaded.
```
