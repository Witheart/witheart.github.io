---
title: "Linux 搭建ARM架构 BMC 仿真环境"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/linux-搭建arm架构-bmc-仿真环境/
toc: true
---

## 1 安装基本工具

```bash
sudo apt update
sudo apt install qemu-system-arm wget unzip
```


## 2 下载 BMC 体验镜像

为了确保仿真环境的兼容性，推荐从 OpenBMC 官方的 Jenkins CI 服务器直接下载预编译好的固件和配套的 QEMU。以下是以主流的 **Romulus (基于 AST2500)** 机型为例的下载地址：

**下载预编译的 BMC 固件镜像 (.mtd):**

```bash
wget https://jenkins.openbmc.org/job/latest-master/label=docker-builder,target=romulus/lastSuccessfulBuild/artifact/openbmc/build/tmp/deploy/images/romulus/obmc-phosphor-image-romulus.static.mtd
```

**下载 OpenBMC 官方定制的 QEMU 程序:**


```bash
wget https://jenkins.openbmc.org/job/latest-qemu-x86/lastSuccessfulBuild/artifact/qemu/build/qemu-system-arm
chmod +x qemu-system-arm
```

下载完成后，这两个文件放在同一个目录下。

## 3 启动BMC镜像
```bash
./qemu-system-arm -m 256 -M romulus-bmc -nographic \
-drive file=obmc-phosphor-image-romulus.static.mtd,format=raw,if=mtd \
-nic user,hostfwd=tcp::2222-:22,hostfwd=tcp::2443-:443,hostfwd=tcp::2080-:80,hostfwd=udp::2623-:623
```

- **`./qemu-system-arm`**：QEMU 的 ARM 系统模拟器可执行文件。
- **`-m 256`**：分配 256MB 内存给虚拟机。
- **`-M romulus-bmc`**：指定模拟的机器型号为 Romulus BMC（AST2500 SoC）。
- **`-nographic`**：不开启图形窗口，串口输出重定向到当前终端。
- **`-drive file=...,format=raw,if=mtd`**：挂载 OpenBMC 固件镜像（`.mtd` 即 SPI Flash 原始镜像），接口类型为 MTD。
- **`-nic user,...`**：使用用户态网络栈（无需 root），并做端口转发：
  - `2222→22`（SSH，登录用）
  - `2443→443`（HTTPS，Web UI）
  - `2080→80`（HTTP）
  - `2623→623`（IPMI over UDP）

启动后可在终端看串口日志，`ssh -p 2222 root@localhost` 或浏览器 `https://127.0.0.1:2443` 访问 BMC。
用户名： root
密码： 0penBmc (注意第一个是数字 0)
