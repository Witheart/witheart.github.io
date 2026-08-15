---
title: "Ubuntu两种ntp服务对比"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu两种ntp服务对比/
toc: true
---

## 对比
传统 NTP (ntpd) 和 systemd-timesyncd 的主要区别对比：

| **特性**               | **传统 NTP (ntpd)**                   | **systemd-timesyncd**                |
|------------------------|---------------------------------------|---------------------------------------|
| **功能范围**           | 完整的 NTP 实现，支持客户端和服务端 | 仅 SNTP 客户端功能                   |
| **时间精度**           | 毫秒级 (0.5-10ms)                   | 几十毫秒级 (10-100ms)               |
| **资源占用**           | 较高 (5-15MB RAM)                    | 极低 (<1MB RAM)                      |
| **配置文件**           | `/etc/ntp.conf` (复杂)              | `/etc/systemd/timesyncd.conf` (简单) |
| **自定义能力**         | 高度灵活，支持复杂网络拓扑          | 仅基础配置                          |
| **服务端功能**         | ✓ 可作为时间服务器                 | ✗ 无法作为时间服务器                |
| **硬件时钟同步**       | 需要额外配置                       | ✓ 内置支持                          |
| **系统集成**           | 独立服务                           | 完全集成到 systemd                  |
| **调试工具**           | ntpq, ntpstat, ntpdate 等           | 仅 timedatectl 和 journalctl         |
| **时间跳变处理**       | 平滑调整 (默认)                    | 直接调整                            |
| **适用场景**           | 服务器、对时间精度要求高的环境     | 桌面系统、虚拟机、基础同步需求      |

### 推荐选择：

1. **使用传统 NTP (ntpd) 的场景**：
   - 需要将系统作为时间服务器
   - 在复杂网络环境中
   - 对时间精度要求高（如金融系统、科学计算）
   - 需要监控和高级配置功能
   - 您已熟悉 NTP 配置

2. **使用 systemd-timesyncd 的场景**：
   - 桌面或单用户系统
   - 资源受限的环境（如低功耗设备）
   - 基础时间同步需求
   - 需要与 systemd 深度集成
   - 希望使用默认配置

## 检查服务状态
- 检查传统的 ntpd服务
```bash
systemctl status ntp

```

- 检查 systemd-timesyncd服务
```bash
systemctl status systemd-timesyncd

```


## 如何从 ntpd 切换为 systemd-timesyncd 

```bash
# 1. 停止并禁用 NTP
sudo systemctl stop ntp
sudo systemctl disable ntp
sudo apt purge ntp #这一步一般会帮你卸载掉传统的ntp，然后自动安装systemd-timesyncd

# 2. 启用 timesyncd
sudo systemctl unmask systemd-timesyncd
sudo systemctl enable --now systemd-timesyncd

# 3. 配置自定义服务器（中国大陆）
sudo nano /etc/systemd/timesyncd.conf
"""
[Time]
NTP=cn.pool.ntp.org ntp.aliyun.com ntp.tuna.tsinghua.edu.cn  
FallbackNTP=ntp.tencent.com
# 其他参数保持默认
"""

# 4. 重启服务并检查状态
sudo systemctl restart systemd-timesyncd
timedatectl timesync-status
```

- 注意，如果上述启动方式不生效，可能是安装了chrony的ntp服务，将ntpd和systemd-timesyncd都屏蔽了，卸载掉chrony即可。
