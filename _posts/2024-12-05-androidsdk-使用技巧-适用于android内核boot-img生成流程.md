---
title: "适用于Android内核boot.img生成流程"
date: 2024-12-05
last_modified_at: 2024-12-05
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/适用于android内核boot-img生成流程/
toc: true
---

### 1. **内核编译**
1. 执行以下脚本编译内核源码：

   ```bash
   ./make.sh
   ```

2. 编译完成后，在内核源码目录下生成以下文件：
   - `boot.img`：包含内核镜像 `Image` 和 `second`（实际上是 `resource.img`）。
   - `resource.img`：资源镜像。

   **注意：**
   - 此时生成的 `boot.img` **缺少 `ramdisk.img`**。
   - 此时的 `resource.img` **不完整**，缺少电量显示图片等资源。

---

### 2. **生成完整的 `boot.img`**

#### 2.1 **补充 `resource.img` 的内容**
1. 进入 `u-boot` 目录：

   ```bash
   cd ../u-boot/
   ```

2. 使用 `u-boot` 目录下的打包工具重新打包 `resource.img`：

   ```bash
   ./scripts/pack_resource.sh ../kernel/resource.img
   ```

   **脚本功能：**
   - 解包指定的 `resource.img`。
   - 将 `<uboot>/tools/images/` 目录下的所有 `.bmp` 图片资源，和原有资源一起重新打包为一个新的 `resource.img`。

3. 将打包完成的 `resource.img` 复制回内核源码目录：

   ```bash
   cp resource.img ../kernel/
   ```

---

#### 2.2 **生成完整的 `boot.img`**
1. 返回 Android SDK 顶层目录：

   ```bash
   cd ../
   ```

2. 执行以下命令生成完整的 `boot.img`：

   ```bash
   make bootimage -j16
   ```

   **命令说明：**
   - 生成过程中会自动创建 `ramdisk.img`。
   - 将 `ramdisk.img`、内核镜像 `Image`、内核 DTB 文件，以及重新打包的 `resource.img` 一起打包成完整的 `boot.img`。

3. 生成的完整 `boot.img` 输出路径：

   ```
   <SDK>/out/target/product/<产品名称>/boot.img
   ```

   **说明：** 该 `boot.img` 是最终要烧录到开发板 `boot` 分区的文件。

---

### 总结
- `boot.img` 的生成涉及两个重要步骤：
  1. **补充完善 `resource.img`**。
  2. **生成完整的 `boot.img`**。
- 最终生成的 `boot.img` 包含以下内容：
  - 内核镜像 `Image`。
  - 内核设备树 `DTB` 文件。
  - 初始根文件系统镜像 `ramdisk.img`。
  - 资源镜像 `resource.img`。
