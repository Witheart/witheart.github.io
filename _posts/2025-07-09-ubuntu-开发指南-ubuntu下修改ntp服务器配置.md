---
title: "Ubuntu下修改ntp服务器配置"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu下修改ntp服务器配置/
toc: true
---

## 1 配置选择说明
Ubuntu系统通常使用两种时间同步服务：
1. `ntpd`：传统NTP守护进程（安装后自动启用）
2. `systemd-timesyncd`：现代Linux默认的时间同步服务

**检查当前使用的服务**：
```bash
# 检查systemd-timesyncd状态
systemctl status systemd-timesyncd

# 检查ntpd是否运行
systemctl status ntp
```

## 2 如果使用ntpd
### 2.1 安装ntp服务
```bash
sudo apt update && sudo apt install ntp -y
```

### 2.2 编辑配置文件
```bash
sudo vim /etc/ntp.conf
```

### 2.3 替换NTP服务器池
找到`pool`开头的行，替换为：
```conf
# 中国公共NTP池
pool cn.pool.ntp.org iburst
# 阿里云NTP
server ntp.aliyun.com iburst
# 清华大学NTP
server ntp.tuna.tsinghua.edu.cn iburst

# 注释或删除其他server/pool行
```

### 2.4 重启服务生效
```bash
sudo systemctl restart ntp
```

### 2.5 验证连接状态
```bash
ntpq -p
```
检查输出：
```
     remote           refid      st t when poll reach
* ntp.aliyun.com  10.137.38.86    2 u   12   64   3
+ cn.pool.ntp.org 10.21.42.55     2 u    8   64   3
```

## 3 如果使用systemd-timesyncd

### 3.1 编辑配置文件
打开配置文件（需要 root 权限）：
```bash
sudo vim /etc/systemd/timesyncd.conf
```

### 3.2 修改 `[Time]` 部分
替换为以下内容（使用中国稳定的 NTP 服务器）：
```ini
[Time]
NTP=cn.pool.ntp.org ntp.aliyun.com ntp.tuna.tsinghua.edu.cn  
FallbackNTP=ntp.tencent.com
# 其他参数保持默认
```

### 3.3 保存后重启服务
```bash
sudo systemctl restart systemd-timesyncd
```

### 3.4 验证状态
```bash
timedatectl timesync-status
```
观察输出中的 `Server` 字段是否显示你配置的中国 NTP 服务器。

### 3.5 日志调试
```bash
journalctl -u systemd-timesyncd.service -f
```

## 4 关于timedatectl 
timedatectl 是用于systemd-timesyncd的，对于ntpd，应该使用其他方式验证，否则会显示'ntp service:n/a'
```bash
timedatectl
               Local time: 三 2025-07-09 15:30:11 CST
           Universal time: 三 2025-07-09 07:30:11 UTC
                 RTC time: 三 2025-07-09 07:30:11
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: n/a
          RTC in local TZ: no

```

## 5 通用状态检查命令
| 项目 | systemd-timesyncd | ntpd |
|------|-------------------|------|
| 服务状态 | `systemctl status systemd-timesyncd` | `systemctl status ntp` |
| 时间同步源 | `timedatectl show-timesync` | `ntpq -p` |
| 详细同步信息 | `timedatectl timesync-status --all` | `ntpstat` |
