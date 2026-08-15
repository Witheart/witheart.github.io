---
title: "make menuconfig 使用全流程"
date: 2025-06-07
last_modified_at: 2025-06-07
categories:
  - "Ubuntu SDK 编译指南"
tags:
  - "Ubuntu SDK 编译指南"
permalink: /ubuntu-sdk-编译指南/make-menuconfig-使用全流程/
toc: true
---

概要：本文详细介绍了使用 make menuconfig 配置 Linux 内核的完整流程，涵盖从 defconfig 生成 .config 文件、使用 menuconfig 编辑配置，到将配置保存回 defconfig 的全过程，并指出了使用中的关键注意事项与缺点。  


## 1. 关键点说明

- **make menuconfig 编辑的是内核根目录下的 .config 文件。**  
- **每一步都要指定架构（如 ARCH=arm64），否则可能会默认使用 x86 架构下的文件。**  
- **一般使用的 defconfig 文件位于如下路径：**  
  kernel-5.10/arch/arm64/configs/RB_RK3588_defconfig  

---

## 2. 操作步骤详解

### 2.1 从 defconfig 生成 .config 文件

```bash
make ARCH=arm64 RB_RK3588_defconfig
```

执行上述命令后，会根据指定的 defconfig 文件生成内核根目录下的 .config 文件。

---

### 2.2 使用 menuconfig 编辑 .config 文件

```bash
make ARCH=arm64 menuconfig
```

执行命令后，将进入图形化配置界面：

- 使用方向键浏览和选择配置项  
- 修改所需配置后，选择 `<Save>` 选项保存修改  

此时，.config 文件就被更新为新的配置内容。

---

### 2.3 将 .config 保存回 defconfig 文件

```bash
make ARCH=arm64 savedefconfig
```

该命令会根据当前的 .config 生成一个 defconfig 文件，保存在内核根目录下。

- 若需使用该文件作为新的 defconfig，需手动复制到原来的 defconfig 所在目录，例如：  
  ```bash
  cp defconfig arch/arm64/configs/RB_RK3588_defconfig
  ```

---

## 3. 注意事项与缺点

- **savedefconfig 生成的 defconfig 文件中不能添加注释**  
  - 加了注释后，下一次重新执行 savedefconfig 会将其覆盖掉  
  - 建议注释内容另行保存，避免丢失  

---
