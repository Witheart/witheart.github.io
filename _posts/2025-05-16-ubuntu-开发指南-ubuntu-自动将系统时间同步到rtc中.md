---
title: "Ubuntu 自动将系统时间同步到RTC中"
date: 2025-05-16
last_modified_at: 2025-05-16
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-自动将系统时间同步到rtc中/
toc: true
---

概要：本文介绍了在 Ubuntu 系统中，通过 systemd 定时器与脚本实现自动检测并同步系统时间与硬件时钟（RTC）的配置方法，包含脚本编写、服务与定时器的创建、启用、关闭及恢复等完整流程。  


## 1. 硬件时钟与系统时钟说明  

在 Ubuntu 中，使用 timedatectl 命令可以查看系统时间（System Clock）与硬件时间（RTC, Real Time Clock）：

```bash
user@user:~$ timedatectl
               Local time: Fri 2025-05-16 15:45:27 CST
           Universal time: Fri 2025-05-16 07:45:27 UTC
                 RTC time: Fri 2025-05-16 07:45:27
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

- **Universal time**：系统时间（UTC 格式）  
- **RTC time**：硬件时钟（通常也以 UTC 表示）  
- 上述输出中，RTC 与系统时钟一致，说明同步正常。

---

## 2. 自动检测并同步脚本编写  

通过脚本提取系统时间与硬件时间的差值，若差值超过设定阈值（如 30 秒），则自动执行同步操作。

### 2.1 编写脚本 `/usr/local/bin/sync-time.sh`  

```bash
#!/bin/bash

# 获取UTC和RTC时间字符串
utc_time_str=$(LANG=C timedatectl | grep "Universal time" | awk '{print $4, $5}')
rtc_time_str=$(LANG=C timedatectl | grep "RTC time" | awk '{print $4, $5}')

# 转换为时间戳（秒数）
utc_time=$(date -d "$utc_time_str" +%s)
rtc_time=$(date -d "$rtc_time_str" +%s)

# 计算绝对差值
diff=$((utc_time - rtc_time))
abs_diff=${diff#-}

# 超过阈值则同步
if [ $abs_diff -ge 30 ]; then
    echo "$(date): 时间差 ${abs_diff}秒，同步中..."
    hwclock --systohc
else
    echo "$(date): 时间正常，差值 ${abs_diff}秒"
fi
```

### 2.2 赋予执行权限  

```bash
sudo chmod +x /usr/local/bin/sync-time.sh
```

---

## 3. 创建 Systemd 服务与定时器  

### 3.1 创建服务单元 `/etc/systemd/system/sync-time.service`  

```ini
[Unit]
Description=Sync system time to hardware clock

[Service]
Type=oneshot
ExecStart=/usr/local/bin/sync-time.sh
User=root
```

### 3.2 创建定时器单元 `/etc/systemd/system/sync-time.timer`  

```ini
[Unit]
Description=每30秒检查并同步时间

[Timer]
OnBootSec=30s
OnUnitActiveSec=30s
AccuracySec=1s

[Install]
WantedBy=timers.target
```

---

## 4. 启用并启动服务  

执行以下命令以启用并启动定时器：

```bash
sudo systemctl daemon-reload
sudo systemctl enable sync-time.timer
sudo systemctl start sync-time.timer
```

---

## 5. 查看服务状态  

### 5.1 查看定时器状态  

```bash
systemctl list-timers sync-time.timer
```

### 5.2 实时查看日志输出  

```bash
journalctl -u sync-time.service -f
```

---

## 6. 常见操作指南  

### 6.1 服务是否开机自启？  

是的！通过以下配置确保服务会在开机时自动启动：

- **定时器配置**：`sync-time.timer` 文件中的 `OnBootSec=30s` 表示系统启动后 30 秒触发一次检查。  
- **启用命令**：执行 `sudo systemctl enable sync-time.timer` 后，定时器会加入开机自启列表。

验证是否启用开机自启：

```bash
systemctl is-enabled sync-time.timer
# 输出应为 "enabled"
```

---

### 6.2 如何关闭服务？  

#### 方法 1：临时关闭（停止本次运行）  

```bash
sudo systemctl stop sync-time.timer     # 停止定时器
sudo systemctl stop sync-time.service   # 停止服务（如果正在运行）
```

#### 方法 2：永久关闭（禁用开机自启）  

```bash
sudo systemctl disable sync-time.timer  # 禁用定时器
sudo systemctl stop sync-time.timer     # 确保定时器已停止
```

验证关闭状态：

```bash
systemctl list-timers | grep sync-time.timer  # 应无输出
systemctl status sync-time.timer              # 状态应为 "inactive (dead)"
```

---

### 6.3 恢复服务（重新启用）  

```bash
sudo systemctl enable sync-time.timer  # 重新启用定时器
sudo systemctl start sync-time.timer   # 立即启动定时器
```

## 7. 同步到硬件RTC的日志查看
查看所有日志
```
sudo journalctl -f
```

手动触发同步
```
sudo hwclock --systohc
```

有相关日志
```
7月 09 16:37:15 user kernel: hym8563_rtc_set_time ---ison
7月 09 16:37:15 user kernel: hym8563_rtc_set_alarm ---ison
7月 09 16:37:15 user kernel: hym8563_rtc_alarm_irq_enable enabled=1---ison
```
