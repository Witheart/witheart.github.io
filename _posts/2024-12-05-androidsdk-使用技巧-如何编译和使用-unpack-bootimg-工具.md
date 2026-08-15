---
title: "如何编译和使用 `unpack_bootimg` 工具"
date: 2024-12-05
last_modified_at: 2024-12-05
categories:
  - "AndroidSDK 使用技巧"
tags:
  - "AndroidSDK 使用技巧"
permalink: /androidsdk-使用技巧/如何编译和使用-unpack-bootimg-工具/
toc: true
---

在 Rockchip 的 Android SDK 开发中，`unpack_bootimg` 是一个非常重要的工具，用于解包 `boot.img` 文件，以便查看或修改其中的内容。以下将详细介绍如何编译和使用该工具。


## 1. **编译 `unpack_bootimg` 工具**

在 Rockchip SDK 中，`unpack_bootimg` 工具并非默认编译生成，因此需要手动编译。以下是具体步骤：

### 1.1 加载环境变量

在 SDK 根目录下，运行以下命令加载环境变量：

```bash
source build/envsetup.sh
```

此命令会初始化构建环境，并为后续的编译做好准备。

### 1.2 选择目标产品

运行以下命令选择目标产品配置：

```bash
lunch
```

在弹出的列表中，选择与你的硬件平台匹配的目标产品。例如，对于 RK3568 平台，可以选择类似 `rk3568_r-userdebug` 的配置。如果不确定具体选项，可以直接按回车键查看支持的目标产品列表。

### 1.3 编译 `unpack_bootimg` 工具

在 SDK 顶层目录下，运行以下命令生成 `unpack_bootimg` 工具：

```bash
make unpack_bootimg -j$(nproc)
```

- `-j$(nproc)` 表示使用系统中所有可用的 CPU 核心进行并行编译，以加快编译速度。
- 编译完成后，工具会出现在以下路径：
  ```
  out/host/linux-x86/bin/unpack_bootimg
  ```

---

## 2. **使用 `unpack_bootimg` 工具**

编译完成后，可以使用 `unpack_bootimg` 工具解包 `boot.img` 文件。以下是具体步骤：

### 2.1 准备工作

确保你的 `boot.img` 文件可用，并存放在一个方便操作的目录中。例如，将 `boot.img` 放在当前目录下。

### 2.2 解包 `boot.img`

**解包前，需要确保已经刷新了环境变量：执行 `source build/envsetup.sh`以及 `lunch`。**

运行以下命令解包 `boot.img`：

```bash
unpack_bootimg --boot_img boot.img --out out_dir
```

参数说明：

- `--boot_img`：指定需要解包的 `boot.img` 文件路径。
- `--out`：指定解包后的输出目录。如果目录不存在，工具会自动创建。

### 2.3 查看解包结果

解包完成后，输出目录（如 `out_dir`）中会包含以下文件：

- **内核镜像 (`Image`)**：Linux 内核的二进制文件。
- **设备树 (`DTB`)**：描述硬件配置的设备树文件。
- **初始文件系统 (`ramdisk`)**：系统启动时加载的临时根文件系统。
- **资源文件 (`resource.img`)**：包含启动 logo 和其他资源。

你可以通过 `ls` 命令查看解包后的文件内容：

```bash
ls out_dir/
```

---

## **总结**

1. 加载环境变量：
   ```bash
   source build/envsetup.sh
   ```
2. 选择目标产品：
   ```bash
   lunch rk3568_r-userdebug
   ```
3. 编译工具：
   ```bash
   make unpack_bootimg -j$(nproc)
   ```
4. 使用工具解包：
   ```bash
   unpack_bootimg --boot_img boot.img --out out_dir
   ```
