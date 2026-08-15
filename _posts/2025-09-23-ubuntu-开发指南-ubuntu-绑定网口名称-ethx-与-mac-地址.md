---
title: "Ubuntu 绑定网口名称 ethX 与 MAC 地址"
date: 2025-09-23
last_modified_at: 2025-09-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-绑定网口名称-ethx-与-mac-地址/
toc: true
---

概要：本文介绍了如何在 Ubuntu 20.04 系统中，通过 udev 规则将特定的物理网口（MAC 地址）绑定为固定的 ethX 命名方式。内容涵盖环境验证、MAC 地址查看、规则文件编写及系统重载等操作步骤。


## 1. 验证环境

本文已在 Ubuntu 20.04 上通过验证。

### 1.1 查看系统版本

```bash
cat /etc/lsb-release
```

---

## 2. 查看 MAC 地址

### 2.1 MAC 地址的查看方式

- 使用 ifconfig 命令查看 MAC 地址。

```bash
ifconfig
```

- 如果未安装 `ifconfig`，可先安装 `net-tools`：

```bash
sudo apt update

sudo apt install net-tools
```

### 2.2 查看 MAC 地址与物理端口的对应关系

- ​​ 确保所有网线均已拔除 ​​，此时在终端执行 `ifconfig` 命令，所有物理网口对应的接口均不应显示 UP 状态和有效的 inet(IPv4 地址)。然后，​​ 一次只插入一根网线 ​​ 到您想要识别的物理端口，稍等片刻待链路协商成功后，​​ 再次执行 `ifconfig` 命令 ​​。仔细观察命令输出，在众多接口信息中，​​ 唯一一个获取到了 IP 地址（inet 字段）的接口，就是刚才所插网线对应的逻辑接口 ​​。该接口信息中紧随`ether`后面的那一串十二位的十六进制数字（格式如 00:1a:4b:3c:8d:f1）即为其 MAC 地址。
- 记录下“物理端口位置 -> 系统接口名 (如 enp3s0) -> MAC 地址”这个对应关系。随后 ​​ 拔掉这根网线 ​​，重复上述“一插一查一记一拔”的过程，直到所有物理端口都被遍历识别完毕。

![alt text](/assets/images/ubuntu-开发指南/ubuntu-绑定网口名称-ethx-与-mac-地址/PixPin_2025-09-23_11-11-56.png)

---

## 3. 建立 udev 规则

### 3.1 进入规则目录

```bash
cd /etc/udev/rules.d/
```

查看是否已有网络相关规则文件：

- 如果有，可直接修改；
- 如果没有，则新建一个规则文件。

### 3.2 新建规则文件

创建新规则文件：

```bash
sudo nano 70-persistent-net.rules
```

写入以下内容：

```bash
# eth0 绑定到 50:0a:52:08:9f:f8
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="50:0a:52:08:9f:f8", NAME="eth0"

# eth1 绑定到 50:0a:52:08:9f:f9
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="50:0a:52:08:9f:f9", NAME="eth1"

# eth2 绑定到 50:0a:52:08:9f:fb
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="50:0a:52:08:9f:fb", NAME="eth2"

# eth3 绑定到 50:0a:52:08:9f:fa
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="50:0a:52:08:9f:fa", NAME="eth3"
```

ATTR 字段填写 MAC 地址，NAME 字段填写要绑定的系统接口名称。

> 注意：MAC 地址需使用小写格式。

### 3.3 nano 保存与退出方法

在 nano 编辑器中：

- 保存文件：按下 `Ctrl + O`，然后回车确认；
- 退出编辑器：按下 `Ctrl + X`。

---

## 4. 应用规则并重启

执行以下命令以应用新的规则：

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger --action=add
```

然后重启系统：

```bash
sudo reboot
```

---

## 5. 查看日志验证

重启后查看日志，确认网络命名情况：

```bash
dmesg | grep -i "eth"
```

日志输出如下图所示：

![alt text](/assets/images/ubuntu-开发指南/ubuntu-绑定网口名称-ethx-与-mac-地址/PixPin_2025-09-23_11-00-45.png)

日志中出现了三次命名记录：

1. **内核初始命名**（如：eth0、eth1、eth2、eth3）
2. **基于 PCIe 规则的重命名**（如：enp2s0、enp4s0、enp3s0、enp5s0）
3. **自定义 udev 规则重命名**（如：eth0、eth1、eth2、eth3）

---

## 6. 最终验证

再次使用 `ifconfig` 查看，确认每个 ethX 接口是否正确对应到设置的 MAC 地址。

```bash
ifconfig
```
