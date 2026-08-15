---
title: "使用 mkmultidtb.py 打包多个设备树"
date: 2024-12-05
last_modified_at: 2024-12-05
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/使用-mkmultidtb-py-打包多个设备树/
toc: true
---

当我们开发嵌入式系统（特别是基于 Rockchip 平台的设备）时，经常需要将多个设备树（DTB）文件与其他资源文件一起打包为一个 `resource.img` 文件，以供设备启动时加载。本文将详细解析 `mkmultidtb.py` 脚本的工作原理，并说明如何正确使用它完成设备树的打包。


## **脚本介绍**
- 脚本路径：kernel/scripts/mkmultidtb.py
- `mkmultidtb.py` 是一个用于批量处理和打包多个设备树文件的 Python 脚本。其主要用途是根据不同的开发板配置，将多个 DTB 文件打包成一个可供设备启动使用的 `resource.img` 文件。

以下是脚本的核心功能：

1. **读取开发板配置**  
   脚本通过内部定义的 `DTBS` 字典，确定每个开发板所需的 DTB 文件及其配置标识。

2. **处理 DTB 文件**  
   根据 `DTBS` 配置，脚本从指定目录中读取 DTB 文件并进行重命名，加入特定的标识（如 ADC 通道状态）。

3. **调用打包工具**  
   脚本调用外部工具 `scripts/resource_tool`，将处理后的 DTB 文件与图片资源（如启动 logo）一起打包为最终的 `resource.img` 文件。

4. **清理临时文件**  
   在打包完成后，脚本会自动删除生成的中间文件。

---

## **使用方法**

### 1. **准备工作**
- 将所有原始 DTB 文件放置在目录：
  ```
  arch/arm64/boot/dts/rockchip/
  ```
- 确保文件名与 `DTBS` 中的键一致。

### 2. **运行脚本**
进入内核根目录，在命令行中执行脚本，指定开发板名称。例如：

```bash
./scripts/mkmultidtb.py PX30-EVB
```

### 3. **输出文件**
脚本完成后，生成的 `resource.img` 文件会覆盖内核根目录的`resource.img`。

---

## **核心逻辑解析**

### 1. **DTB 文件的配置**
脚本通过 `DTBS` 字典定义了每个开发板所需的 DTB 文件及其配置标识。例如：

```python
DTBS['PX30-EVB'] = OrderedDict([
    ('px30-evb-ddr3-v10', '#_saradc_ch0=1024'),
    ('px30-evb-ddr3-lvds-v10', '#_saradc_ch0=512')
])
```

对于开发板 `PX30-EVB`，需要两个 DTB 文件：
- `px30-evb-ddr3-v10.dtb`
- `px30-evb-ddr3-lvds-v10.dtb`

并且脚本会为这些文件添加标识（如 `#_saradc_ch0=1024`），生成新的文件名。

### 2. **DTB 文件的存放路径**
原始 DTB 文件应存放在以下目录中：

```
arch/arm64/boot/dts/rockchip/
```

文件名必须与 `DTBS` 中的键完全一致。例如：
- `px30-evb-ddr3-v10.dtb`
- `px30-evb-ddr3-lvds-v10.dtb`

### 3. **脚本执行流程**
- **默认 DTB 文件**  
  第一个 DTB 文件会被复制为 `rk-kernel.dtb`，作为默认的设备树文件。
  
- **生成文件名**  
  其他 DTB 文件会在原始文件名后添加标识，比如：
  ```
  px30-evb-ddr3-v10#_saradc_ch0=1024.dtb
  ```

- **打包操作**  
  脚本调用以下命令，将图片和 DTB 文件打包：
  ```bash
  scripts/resource_tool logo.bmp logo_kernel.bmp rk-kernel.dtb px30-evb-ddr3-v10#_saradc_ch0=1024.dtb ...
  ```

- **清理临时文件**  
  打包完成后，删除生成的中间文件。

---

## **打包为 resource.img**

脚本通过调用 `scripts/resource_tool` 工具完成资源的打包。该工具需要以下输入：
- 图片文件：如 `logo.bmp` 和 `logo_kernel.bmp`。
- 处理后的 DTB 文件列表。

执行成功后，`resource_tool` 通常会生成一个名为 `resource.img` 的文件。
