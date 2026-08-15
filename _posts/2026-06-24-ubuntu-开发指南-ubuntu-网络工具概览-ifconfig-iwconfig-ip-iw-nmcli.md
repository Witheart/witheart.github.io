---
title: "Ubuntu 网络工具概览 —— ifconfig iwconfig ip iw nmcli"
date: 2026-06-24
last_modified_at: 2026-06-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-网络工具概览-ifconfig-iwconfig-ip-iw-nmcli/
toc: true
---

Ubuntu（以及整个 Linux 生态）之所以存在这么多网络管理工具，本质上是**Linux 内核网络栈的演化**以及**网络使用场景复杂化**共同造成的历史叠加结果。

这些工具可以按“底层 vs 高层”**以及**“旧时代 vs 新时代”来分类。

## 第一代：早期的基石（Legacy 遗留工具）

这些工具伴随了 Linux 的早期发展，主要基于较老的 `ioctl` 系统调用与内核通信。它们设计简单，但无法很好地支持现代 Linux 内核的高级网络特性（如策略路由、网络命名空间等）。目前绝大多数 Linux 发行版已将其标记为废弃（Deprecated）。

- **`ifconfig` (Interface Configuration):**
- **作用：** 属于 `net-tools` 软件包，用于配置和查看有线/虚拟网络接口的 IP 地址、MAC 地址和 MTU 等基本信息。
- **现状：** 已被 `ip` 命令全面取代。如果你在较新的 Ubuntu 中直接输入 `ifconfig`，系统通常会提示你安装 `net-tools`，因为它不再默认预装。

- **`iwconfig` (Wireless Configuration):**
- **作用：** 属于 `wireless-tools` 软件包，是 `ifconfig` 的无线网络版本。基于旧的 WEXT (Wireless Extensions) 接口，用于设置 SSID、频段、加密密钥（如早期的 WEP）等。
- **现状：** 已被 `iw` 命令取代。它无法良好支持现代的 WPA/WPA2/WPA3 认证机制。

## 第二代：现代 Linux 内核的标准接口（iproute2 系列）

随着 Linux 内核网络子系统的重构，引入了更高效、更强大的 **Netlink 套接字**机制。围绕新机制，社区开发了全新的工具集，直接对接内核的底层网络配置。

- **`ip`:**
- **作用：** 属于 `iproute2` 软件包。它是目前 Linux 网络配置的**核心“瑞士军刀”**。一个 `ip` 命令合并并取代了以前的 `ifconfig`（接口）、`route`（路由表）、`arp`（ARP 缓存）、`vconfig`（VLAN）等多个工具。
- **特点：** 功能极其强大，支持多路由表、网络命名空间（netns）、隧道（TUN/TAP）等底层配置。它是目前系统脚本和网络守护进程在底层最常调用的工具。

- **`iw`:**
- **作用：** 取代 `iwconfig` 的现代无线配置工具，基于新的 `nl80211` 接口。
- **特点：** 专门用于底层的无线设备管理，比如查看物理层支持的频段、建立 AP 模式、或者管理 mesh 网络。但它本身不处理复杂的密码认证（这通常由 `wpa_supplicant` 或 `iwd` 负责）。

## 第三代：高级网络管理器（系统级守护进程的 CLI）

前面两代工具（`ip`、`iw`）配置的网络在重启后或网卡重新插拔后就会丢失，它们只是“一次性”地修改当前内核状态。而在现代设备中，网络状态是动态的（Wi-Fi 漫游、休眠唤醒、插拔网线、拨号 VPN）。我们需要一个后台服务来自动管理这些逻辑。

- **`nmcli` (NetworkManager Command Line Interface):**
- **作用：** 它是 `NetworkManager` 这个后台守护进程的命令行控制端。
- **核心理念：** `nmcli` 管理的不是“网卡”，而是“连接（Connection）”（即配置文件的集合）。你可以为一个物理网卡创建多个“连接”（比如公司静态 IP 配置文件、家里 DHCP 配置文件），并随时通过 `nmcli` 切换。
- **特点：** 它通过 D-Bus 与 `NetworkManager` 通信，`NetworkManager` 再在底层调用 Netlink 接口。它会自动处理依赖关系（例如连上 Wi-Fi 后自动运行 DHCP 获取 IP，并更新 DNS），是目前 Ubuntu 桌面版和服务器版的默认主流网络管理方式。
