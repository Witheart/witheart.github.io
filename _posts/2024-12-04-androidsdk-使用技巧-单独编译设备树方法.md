---
title: "单独编译设备树方法"
date: 2024-12-04
last_modified_at: 2024-12-04
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/单独编译设备树方法/
toc: true
---

### **1. 设置环境变量**
运行以下命令，加载构建环境的相关脚本：

```bash
source build/envsetup.sh
```

---

### **2. 进入 `kernel/` 目录**
切换到内核目录进行设备树相关的编译操作：

```bash
cd kernel/
```

---

### **3. 配置内核默认配置**
运行以下命令，加载内核的默认配置：

```bash
make ARCH=arm64 NK_RK3568_defconfig
```

输出显示 `.config` 文件写入成功，说明默认配置加载完成：

```plaintext
# configuration written to .config
```

---

### **4. 编译设备树文件**
运行以下命令，单独编译设备树文件：

```bash
make ARCH=arm64 rockchip/NK_RK3568.dtb
```

输出结果显示编译成功：

```plaintext
#### build completed successfully (4 seconds) ####
```

---

## **总结**

1. **加载环境变量**：`source build/envsetup.sh`
2. **进入内核目录**：`cd kernel/`
3. **加载默认配置**：`make ARCH=arm64 NK_RK3568_defconfig`
4. **编译设备树**：`make ARCH=arm64 rockchip/NK_RK3568.dtb`
