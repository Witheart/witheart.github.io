---
title: "Ubuntu接入无DHCP网线后开机脚本rc.local加载变慢"
date: 2026-08-06
last_modified_at: 2026-08-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu接入无dhcp网线后开机脚本rc-local加载变慢/
toc: true
---

## 1. 问题现象

- RK3588 设备首次烧录后，插入网线开机，屏幕亮一段时间后突然重启
- 用户感知为"开机后卡住，然后黑屏重启"
- 不插网线或对端有 DHCP 服务时不会复现

## 2. 复现与分析

### 2.1 复现条件

- 网线插入
- 对端无 DHCP 服务（如直连 x86 PC、交换机无 DHCP 分配）
- **仅首次烧录开机出现**（因为 rc.local 检测到首次开机后会格式化 userdata 并调用 reboot）

### 2.2 分析过程

拿到日志后，核心问题是"为什么首次开机会卡住再重启"，分析思路如下：

1. 找到 rc.local 的执行时间点 → 确定脚本何时被调用
2. 追溯 rc.local 之前的启动事件 → 看是什么阻塞了它
3. 找到阻塞的关键服务 → 定位根因

日志显示系统启动到约 10 秒时 Network Manager 启动完成，紧接着 `Network Manager Wait Online` 开始执行：

```
1435: [  OK  ] Started Network Manager.
1436: [  OK  ] Reached target Network.
1437:          Starting Network Manager Wait Online...           ← 关键！网络等待开始
1438:          Starting OpenVPN service...
1439:          Starting OpenBSD Secure Shell server...
```

`Reached target Network` 表示基础网络已就绪，但 `Network Manager Wait Online` 是进一步等待"网络完全可用"，这个服务会阻塞 `network-online.target` 的达成。

日志中出现两处进度提示，均显示 **"no limit"**：

```
1463: [*     ] A start job is running for Network Manager Wait Online (4s / no limit)
1476: [**    ] A start job is running for Network Manager Wait Online (8s / no limit)
```

`(no limit)` 说明 `NetworkManager-wait-online.service` 的 `TimeoutStartSec` 为 0（或未设置），即**没有超时限制**，会一直等到 DHCP 完成或者超时放弃。

> 第二次启动日志中同样出现：
>
> ```
> 3201: [*     ] A start job is running for Network Manager Wait Online (8s / no limit)
> ```

约 20 秒时，wait-online 最终以 **FAILED** 结束，`network-online.target` 达成：

## 3. 问题根因

### 3.1 直接原因

`rc-local.service` 配置了 `After=network-online.target`，启动顺序依赖于网络就绪。

`NetworkManager-wait-online.service` 存在且未被 mask，会真正等待网络就绪：

```
系统启动
    │
    ▼
NetworkManager 启动，检测到 eth1 物理链路 UP
    │
    ▼
对 eth1 发起 DHCP 请求（获取 IP）
    │
    ▼
对端无 DHCP Server → DHCP DISCOVER 无响应
    │
    ▼
NetworkManager-wait-online.service 持续等待（约 30 秒超时）
    │
    ▼
network-online.target 未达成
    │
    ▼
rc-local.service 被阻塞，rc.local 脚本无法执行
    │
    ▼
30 秒后 network-online.target 达成
    │
    ▼
rc.local 开始执行 → 格式化 userdata → reboot
```

### 3.2 与正常系统的对比

| 项目                                 | 正常系统                 | 有问题系统   |
| ------------------------------------ | ------------------------ | ------------ |
| `NetworkManager-wait-online.service` | **masked** → `/dev/null` | **正常存在** |
| `network-online.target` 状态         | inactive (dead)          | active       |
| wait-online 是否执行                 | 否（被屏蔽）             | 是           |
| rc.local 启动时机                    | 立即执行                 | 等待约 30 秒 |
| 首次开机时长                         | 正常                     | 多 30 秒卡顿 |

## 4. 分析方法

### 4.1 查看 rc-local.service 依赖

```bash
systemctl show rc-local.service | grep -E "^After=|^Wants=|^Requires="
```

输出中包含 `After=network-online.target`，确认依赖网络就绪。

### 4.2 查看 network-online.target 状态

```bash
systemctl status network-online.target
```

有问题系统显示 **active**，正常系统显示 **inactive (dead)**。

### 4.3 检查 NetworkManager-wait-online.service 是否被 mask

```bash
ls -al /etc/systemd/system/NetworkManager-wait-online.service
```

- 正常系统：软链接到 `/dev/null`（masked）
- 有问题系统：文件不存在（未 mask，使用默认服务）

### 4.4 查看原始服务内容

```bash
cat /lib/systemd/system/NetworkManager-wait-online.service
# 或
systemctl cat NetworkManager-wait-online.service
```

## 5. 解决方案

### 5.1 推荐方案：mask NetworkManager-wait-online.service

```bash
sudo systemctl mask NetworkManager-wait-online.service
```

**原理**：mask 后该服务永远不会运行，`network-online.target` 无人触发，始终为 inactive 状态，rc-local 的 `After=network-online.target` 形同虚设，立即启动。

### 5.2 验证修复

```bash
# 确认已被 mask
ls -al /etc/systemd/system/NetworkManager-wait-online.service
# 应输出: ... -> /dev/null

# 重启后验证
systemctl status network-online.target
# 应显示: Active: inactive (dead)
```

### 5.3 备选方案

| 方案               | 命令                                                                                | 说明                      |
| ------------------ | ----------------------------------------------------------------------------------- | ------------------------- |
| 给 eth1 配静态 IP  | `nmcli con add con-name "eth1-static" ifname eth1 type ethernet ip4 192.168.x.x/24` | DHCP 不等待，网络立即就绪 |
| 限制 DHCP 超时     | 在 `/etc/NetworkManager/conf.d/` 添加 `ipv4.dhcp-timeout=5`                         | 缩短等待时间              |
| 修改 rc-local 依赖 | 将 `After=network-online.target` 改为 `After=network.target`                        | rc.local 不等待网络就绪   |

## 6. 总结

- **根因**：`NetworkManager-wait-online.service` 未 mask，插网线但无 DHCP 时会阻塞 `network-online.target` 达成，rc-local.service 因此延迟约 30 秒才执行
- **修复**：`sudo systemctl mask NetworkManager-wait-online.service`，一行命令即可
- **注意**：如果系统有其他服务强依赖 `network-online.target`（需要网络真正就绪才能工作），mask 此服务需要评估影响
