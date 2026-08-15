---
title: "构建 RK3588 NPU Runtime DEB 包（librknnrt.so）"
date: 2026-07-15
last_modified_at: 2026-07-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/构建-rk3588-npu-runtime-deb-包-librknnrt-so/
toc: true
---

本文详细讲解如何从 RKNN Toolkit2 SDK 中提取文件，打包为可直接 `dpkg -i` 安装的 `.deb` 包，部署到 RK3588 开发板的根文件系统中。


## 1. 背景

在 RK3588 上运行 AI 模型（如 YOLO、ResNet 等），内核中已有 NPU 驱动，根文件系统还需要部署 **用户态运行时库** 和配套服务。Rockchip 官方的 RKNN Toolkit2 SDK(https://github.com/airockchip/rknn-toolkit2) 提供了这些文件，但默认是散装的——需要手工拷贝并手动配置。将其封装为 `.deb` 包后，一条命令即可完成部署、升级和卸载。

### 本包包含的内容

| 文件                                | 用途                          |
| ----------------------------------- | ----------------------------- |
| `librknnrt.so`                      | NPU 核心推理运行时库          |
| `rknn_server`                       | 后台代理服务（PC 连板调试用） |
| `start_rknn.sh` / `restart_rknn.sh` | 守护/重启脚本                 |
| `rknn_api.h` 等头文件               | 交叉编译开发用                |
| `rknn_server.service`               | systemd 开机自启服务          |

---

## 2. 准备工作

从 RKNN Toolkit2 SDK 中提取以下源文件：

```bash
# SDK 路径（以 rknn-toolkit2 v2.3.2 为例）
SDK=rknn-toolkit2/rknpu2/runtime/Linux

# 核心库
cp ${SDK}/librknn_api/aarch64/librknnrt.so       → /usr/lib/

# 后台服务
cp ${SDK}/rknn_server/aarch64/usr/bin/rknn_server → /usr/bin/
cp ${SDK}/rknn_server/aarch64/usr/bin/start_rknn.sh   → /usr/bin/
cp ${SDK}/rknn_server/aarch64/usr/bin/restart_rknn.sh → /usr/bin/

# 头文件
cp ${SDK}/librknn_api/include/rknn_api.h         → /usr/include/
cp ${SDK}/librknn_api/include/rknn_custom_op.h   → /usr/include/
cp ${SDK}/librknn_api/include/rknn_matmul_api.h  → /usr/include/
```

---

## 3. DEB 包目录结构

在打包目录下创建如下结构（目录名必须为 `<包名>_<版本号>_<架构>` 格式）：

```
huiwan-rk3588npu-driver_1.0.0_arm64/
├── build-deb.sh                  ← 一键打包脚本（可选，但推荐）
├── DEBIAN/
│   ├── control                   ← 包元信息（必须）
│   ├── postinst                  ← 安装后脚本（必须可执行）
│   └── prerm                     ← 卸载前脚本（必须可执行）
├── lib/
│   └── systemd/
│       └── system/
│           └── rknn_server.service   ← 系统服务定义
└── usr/
    ├── bin/
    │   ├── rknn_server           ← 二进制可执行文件
    │   ├── start_rknn.sh         ← 守护启动脚本
    │   └── restart_rknn.sh       ← 重启脚本
    ├── include/
    │   ├── rknn_api.h            ← C API 头文件
    │   ├── rknn_custom_op.h      ← 自定义算子头文件
    │   └── rknn_matmul_api.h     ← 矩阵乘法头文件
    └── lib/
        └── librknnrt.so          ← 核心运行时库
```

> **说明：** `DEBIAN/` 目录下的文件最终会被 `dpkg` 消费而**不会安装到系统**，其余目录（`usr/`、`lib/`）中的文件则按照相同路径安装到目标系统的根目录。

---

## 4. 各文件内容

### 4.1 `DEBIAN/control`（包元信息）

```
Package: huiwan-rk3588npu-driver
Version: 1.0.0
Architecture: arm64
Maintainer: Witheart <wush@hwtek.com>
Section: devel
Priority: optional
Homepage: https://hwtek.com
Description: RK3588 NPU Runtime Driver (librknnrt v2.3.2)
```

**字段说明：**

| 字段           | 必填 | 说明                                      |
| -------------- | :--: | ----------------------------------------- |
| `Package`      |  ✅  | 包名，只能用小写字母、数字、`-`、`+`、`.` |
| `Version`      |  ✅  | 版本号，建议与 librknnrt.so 版本对应      |
| `Architecture` |  ✅  | 固定 `arm64`（RK3588 是 64 位 ARM）       |
| `Maintainer`   |  ✅  | 维护者信息，格式 `名字 <邮箱>`            |
| `Section`      |  ❌  | 分类，`devel` 表示开发工具                |
| `Priority`     |  ❌  | 优先级，`optional` 即可                   |
| `Homepage`     |  ❌  | 项目主页                                  |
| `Description`  |  ✅  | 单行描述（可加 librknnrt 版本号便于辨识） |

### 4.2 `DEBIAN/postinst`（安装后脚本）

```bash
#!/bin/sh

set -e

case "$1" in
	configure)
	systemctl enable rknn_server
esac
```

**作用：** dpkg 安装完成后自动执行，将 `rknn_server` 设为开机自启。

### 4.3 `DEBIAN/prerm`（卸载前脚本）

```bash
#!/bin/sh

set -e

case "$1" in
	configure)
	systemctl stop rknn_server
	systemctl disable rknn_server
esac
```

**作用：** `dpkg -r` 卸载前执行，先停掉运行中的服务并取消开机自启。

### 4.4 `lib/systemd/system/rknn_server.service`

```ini
[Unit]
Description=start rknn_server service

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/usr/bin/rknn_server

[Install]
WantedBy=local-fs.target
```

**关键配置：**

- `Restart=always`：进程异常退出自动拉起
- `RestartSec=1`：间隔仅 1 秒，快速恢复
- `WantedBy=local-fs.target`：文件系统挂载完成后启动

### 4.5 辅助脚本（可选）

**`build-deb.sh`**：在板端一键构建 DEB 包的脚本，内容如下：

```bash
#!/bin/sh
PKG_NAME="huiwan-rk3588npu-driver_1.0.0_arm64"

echo "=== 1. Set file permissions ==="

chmod 755 ${PKG_NAME}/DEBIAN/postinst
chmod 755 ${PKG_NAME}/DEBIAN/prerm
chmod 644 ${PKG_NAME}/DEBIAN/control

chmod 755 ${PKG_NAME}/usr/bin/rknn_server
chmod 755 ${PKG_NAME}/usr/bin/start_rknn.sh
chmod 755 ${PKG_NAME}/usr/bin/restart_rknn.sh

chmod 644 ${PKG_NAME}/usr/lib/librknnrt.so
chmod 644 ${PKG_NAME}/usr/include/*.h
chmod 644 ${PKG_NAME}/lib/systemd/system/rknn_server.service

echo "=== 2. Build deb ==="
dpkg-deb --root-owner-group --build ${PKG_NAME}

echo "=== 3. Done ==="
ls -lh ${PKG_NAME}.deb
echo ""
echo "Install: sudo dpkg -i ${PKG_NAME}.deb"
echo "Remove:  sudo dpkg -r huiwan-rk3588npu-driver"
```

---

## 5. 文件权限要求

deb 包对文件权限有严格要求，不符合会导致安装失败：

| 文件类型                    | 权限值  | 符号        |
| --------------------------- | :-----: | ----------- |
| DEBIAN 目录下的控制脚本     | **755** | `rwxr-xr-x` |
| 可执行二进制（rknn_server） | **755** | `rwxr-xr-x` |
| Shell 脚本（.sh）           | **755** | `rwxr-xr-x` |
| 动态库（.so）               | **644** | `rw-r--r--` |
| 配置文件 / 头文件           | **644** | `rw-r--r--` |

> 使用 `dpkg-deb --root-owner-group` 参数可自动将所有文件的属主和属组设为 `root:root`，无需手动 `chown`。

---

## 6. ⚠️ 重要：CRLF 换行符陷阱

如果你在 **Windows** 上编辑这些脚本文件，默认换行符是 CRLF（`\r\n`），而 Linux 只认 LF（`\n`）。当 deb 包含 CRLF 脚本时，会出现如下报错：

```
dpkg (子进程)：无法执行 post-installation 脚本: 没有那个文件或目录
```

这是因为 shebang `#!/bin/sh\r` 中的 `\r` 导致系统找不到 `/bin/sh\r` 这个解释器。

### 解决方案

**方法一：用 vim 检查并修复**

```bash
vim DEBIAN/postinst
:set ff?        # 查看换行符类型
:set ff=unix    # 转换为 LF
:wq
```

**方法二：用 sed 一键修复**

```bash
sed -i 's/\r$//' DEBIAN/postinst
sed -i 's/\r$//' DEBIAN/prerm
```

**方法三：打包前统一检查**

```bash
file DEBIAN/postinst | grep CRLF && echo "ERROR: CRLF detected!"
```

---

## 7. 构建流程

将整个 `huiwan-rk3588npu-driver_1.0.0_arm64/` 目录拷贝到板端，执行：

```bash
# 方式A：一键构建
sh huiwan-rk3588npu-driver_1.0.0_arm64/build-deb.sh

# 方式B：手动构建
chmod 755 huiwan-rk3588npu-driver_1.0.0_arm64/DEBIAN/postinst
chmod 755 huiwan-rk3588npu-driver_1.0.0_arm64/DEBIAN/prerm
chmod 755 huiwan-rk3588npu-driver_1.0.0_arm64/usr/bin/rknn_server
chmod 755 huiwan-rk3588npu-driver_1.0.0_arm64/usr/bin/*.sh
chmod 644 huiwan-rk3588npu-driver_1.0.0_arm64/usr/lib/librknnrt.so
chmod 644 huiwan-rk3588npu-driver_1.0.0_arm64/usr/include/*.h
chmod 644 huiwan-rk3588npu-driver_1.0.0_arm64/lib/systemd/system/rknn_server.service

dpkg-deb --root-owner-group --build huiwan-rk3588npu-driver_1.0.0_arm64
```

成功输出：

```
=== 1. Set file permissions ===
=== 2. Build deb ===
dpkg-deb: 正在构建软件包 'huiwan-rk3588npu-driver'...
=== 3. Done ===
-rw-r--r-- 1 user user 1.6M  7月 15 11:57 huiwan-rk3588npu-driver_1.0.0_arm64.deb
```

---

## 8. 安装与卸载

### 安装

```bash
sudo dpkg -i huiwan-rk3588npu-driver_1.0.0_arm64.deb
```

安装后 systemd 自动启用 `rknn_server` 服务，重启板子即可生效。也可立即启动：

```bash
sudo systemctl start rknn_server
```

### 验证

```bash
# 检查文件是否到位
ls -la /usr/lib/librknnrt.so
ls -la /usr/bin/rknn_server

# 检查服务状态
systemctl status rknn_server

# 确认 NPU 设备可访问
ls -la /dev/rknpu*
```

### 卸载

```bash
sudo dpkg -r huiwan-rk3588npu-driver

# 如需彻底清除（含配置文件）
sudo dpkg --purge huiwan-rk3588npu-driver
```

卸载时 `prerm` 脚本会自动停服务并取消开机自启。
