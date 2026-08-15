---
title: "Ubuntu根文件系统打包方式"
date: 2024-12-18
last_modified_at: 2024-12-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu根文件系统打包方式/
toc: true
---

本指南介绍如何使用FireFly官方提供的打包工具 `ff_export_rootfs` 将Ubuntu的根文件系统打包成一个镜像文件。

## 前提条件

- 确保已安装 `ff_export_rootfs` 工具，参考文末链接。


## 步骤

### 1. 创建打包目录

在根目录下创建一个目录，用于存放打包生成的根文件系统镜像：

```bash
sudo mkdir /myrootfs
```

### 2. 执行打包

使用 `ff_export_rootfs` 命令进行打包：

```bash
sudo ff_export_rootfs /myrootfs
```

**注意**：命令末尾不能带斜杠 `/`，否则打包会失败，可能和循环依赖有关。

### 3. 检查打包结果

打包成功后，工具将输出以下信息：

```
Export rootfs to /myrootfs/Ubuntu20.04.6LTS_Cinduel_ext4_202412181752.img Success
```

生成的镜像文件将位于 `/myrootfs` 目录下。

### 4. 处理打包失败

如果打包失败：

- **清理打包目录**：确保 `/myrootfs` 目录下没有任何旧的打包失败文件，否则这些文件也会被打包进去。

  ```bash
  sudo rm -rf /myrootfs/*
  ```

- **清理系统缓存**：建议重启系统以清理缓存，然后再次尝试打包：

  ```bash
  sudo reboot
  ```

## 注意事项

- `ff_export_rootfs` 工具可能没有循环依赖检测功能，但在实践中它仍然可以有效地将根文件系统打包出来。

## 参考资料

- [FireFly AIO-3399ProC Export Dev SF](https://wiki.t-firefly.com/AIO-3399ProC/export_dev_sf.html)
