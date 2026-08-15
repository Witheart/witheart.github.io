---
title: "解决 Ubuntu 下网络管理工具的混乱问题"
date: 2025-01-21
last_modified_at: 2025-01-21
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/解决-ubuntu-下网络管理工具的混乱问题/
toc: true
---

在 Ubuntu 系统中，可能会遇到多个网络管理工具共存的情况，导致网络配置混乱，甚至无法正常工作。本文将详细分析 Ubuntu 中常见的网络管理工具，并指导如何确定当前使用的工具，禁用多余的工具，确保网络管理的稳定性。

## 常见的网络管理工具

Ubuntu 下的网络管理工具种类繁多，其中一些是默认安装的，一些是用户或应用安装的。以下是常见的网络管理工具：

1. **NetworkManager**：
   - 桌面环境的默认网络管理工具，功能强大，支持有线、无线、VPN 等多种网络。
   - 提供 GUI 和 CLI 工具（如 `nmcli` 和 `nmtui`）。

2. **systemd-networkd**：
   - `systemd` 的网络管理组件，适合服务器和容器环境，轻量级且功能强大。

3. **ifupdown**：
   - 传统的网络管理工具，使用 `/etc/network/interfaces` 配置文件管理网络。
   - 在现代 Ubuntu 系统中已被 `Netplan` 替代。

4. **Netplan**：
   - 从 Ubuntu 18.04 开始引入的网络配置工具，用于统一网络配置，支持 `NetworkManager` 和 `systemd-networkd` 作为后端。

5. **systemd-resolved**：
   - `systemd` 的 DNS 解析服务，配合其他工具管理 DNS。

6. **Wicd 和 ConnMan**：
   - 较旧的网络管理工具，通常用于轻量级或嵌入式系统。

## 不同网络管理工具的优缺点对比

| 工具                | 优点                                   | 缺点                                     | 适用场景                     |
|---------------------|----------------------------------------|------------------------------------------|------------------------------|
| NetworkManager      | 功能强大，支持 GUI/CLI                 | 占用资源较多，可能与其他工具冲突          | 桌面用户，复杂网络管理       |
| systemd-networkd    | 轻量级，适合服务器和容器环境           | 配置稍显复杂，不适合桌面用户              | 服务器，容器                 |
| ifupdown            | 简单、经典，容易脚本化                 | 功能有限，缺乏实时管理能力                | 老系统，简单网络             |
| Netplan             | 配置统一，支持多种后端                | 学习成本较高，仅适合配置阶段              | 服务器，云环境               |
| Wicd                | 轻量级，简单易用                      | 功能有限，已停止维护                      | 老硬件，轻量系统             |
| ConnMan             | 嵌入式友好，快速切换网络              | 支持有限的 GUI 工具                      | 嵌入式设备，IoT              |
| iptables/nftables   | 高度灵活，功能强大                    | 配置复杂，不适合普通用户                  | 防火墙，路由器，NAT          |
| ip 命令             | 通用网络管理工具，功能丰富            | 需要较高的命令行操作能力                  | 通用网络管理                 |

---

## 为什么会出现网络管理混乱？

如果多个工具同时尝试管理网络接口或 DNS 配置，就可能出现冲突，比如：

- 一个工具配置了静态 IP，另一个工具尝试使用 DHCP。
- 不同工具管理的 DNS 配置被覆盖，导致解析失败。
- 无法确认哪个工具实际在管理网络。

---

## 解决网络管理混乱的步骤

以下是解决 Ubuntu 网络管理混乱的完整步骤，包括如何确定当前使用的工具，以及如何禁用多余的工具。

---

### 1. 确定当前使用的网络管理工具

#### 检查所有网络相关服务的状态

运行以下命令，查看所有网络相关服务的状态：

```bash
systemctl list-unit-files | grep -E "network|NetworkManager|wicd|connman"
```

示例输出：
```plaintext
NetworkManager.service                     enabled
networkd-dispatcher.service                enabled
systemd-networkd.service                   disabled
```

- `enabled` 表示服务已启用。
- `disabled` 表示服务未启用。
- 重点查看 `NetworkManager` 和 `systemd-networkd` 的状态。

#### 检查 `NetworkManager` 的状态

运行以下命令，检查 `NetworkManager` 是否正在管理网络：

```bash
nmcli general status
```

示例输出：
```plaintext
STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled
```

如果 `STATE` 为 `connected`，说明 `NetworkManager` 正在管理网络。

#### 检查 `systemd-networkd` 的状态

运行以下命令，检查 `systemd-networkd` 是否运行：

```bash
networkctl
```

示例输出：
```plaintext
WARNING: systemd-networkd is not running, output will be incomplete.

IDX LINK   TYPE     OPERATIONAL SETUP
  1 lo     loopback n/a         unmanaged
  2 enp1s0 ether    n/a         unmanaged
```

如果显示 `WARNING: systemd-networkd is not running`，说明 `systemd-networkd` 未运行。

#### 检查是否使用了 `ifupdown`

运行以下命令，查看 `/etc/network/interfaces` 文件是否存在：

```bash
cat /etc/network/interfaces
```

- 如果文件不存在或为空，说明没有使用 `ifupdown`。

#### 检查 `Netplan` 配置

运行以下命令，查看是否存在 Netplan 配置文件：

```bash
ls /etc/netplan/
```

示例输出：
```plaintext
01-network-manager-all.yaml
```

运行以下命令，查看 Netplan 的具体配置：

```bash
cat /etc/netplan/01-network-manager-all.yaml
```

示例输出：
```yaml
network:
  version: 2
  renderer: NetworkManager
```

- 如果 `renderer` 设置为 `NetworkManager`，说明 Netplan 使用 `NetworkManager` 作为后端。

#### 检查 DNS 配置

运行以下命令，查看 `systemd-resolved` 是否正在管理 DNS：

```bash
resolvectl status
```

示例输出：
```plaintext
Global
  Current DNS Server: 223.5.5.5
```

- 如果输出中包含 `Current DNS Server`，说明 `systemd-resolved` 正在管理 DNS。

---

### 2. 根据结果优化网络管理工具

通过以上检查可以确定当前使用的网络管理工具，并禁用多余的工具。以下是具体优化步骤：

#### 如果使用 `NetworkManager`

- 确保 `NetworkManager` 服务已启用并运行：
  ```bash
  sudo systemctl enable NetworkManager --now
  ```

- 禁用 `systemd-networkd`：
  ```bash
  sudo systemctl disable systemd-networkd --now
  ```

- 禁用 `networkd-dispatcher`：
  ```bash
  sudo systemctl disable networkd-dispatcher --now
  ```

- 确保 Netplan 配置使用 `NetworkManager`：
  ```yaml
  network:
    version: 2
    renderer: NetworkManager
  ```

#### 如果使用 `systemd-networkd`

- 确保 `systemd-networkd` 服务已启用并运行：
  ```bash
  sudo systemctl enable systemd-networkd --now
  ```

- 禁用 `NetworkManager`：
  ```bash
  sudo systemctl disable NetworkManager --now
  ```

- 确保 Netplan 配置使用 `systemd-networkd`：
  ```yaml
  network:
    version: 2
    renderer: networkd
  ```

#### 如果使用 `ifupdown`

- 确保 `/etc/network/interfaces` 配置正确。
- 禁用 `NetworkManager` 和 `systemd-networkd`：
  ```bash
  sudo systemctl disable NetworkManager --now
  sudo systemctl disable systemd-networkd --now
  ```

---

### 3. 验证配置

完成优化后，重启相关服务或系统，并验证网络状态：

- 重启网络服务：
  ```bash
  sudo systemctl restart NetworkManager
  ```

- 检查网络接口状态：
  ```bash
  ip addr show
  ```

- 检查 DNS 配置：
  ```bash
  resolvectl status
  ```

---

## 总结

1. 确定当前使用的网络管理工具（如 `NetworkManager` 或 `systemd-networkd`）。
2. 禁用未使用的工具（如 `systemd-networkd`、`ifupdown`）。
3. 确保 Netplan 配置正确，后端工具与实际使用的网络管理工具一致。
4. 验证最终配置，确保网络运行正常。
