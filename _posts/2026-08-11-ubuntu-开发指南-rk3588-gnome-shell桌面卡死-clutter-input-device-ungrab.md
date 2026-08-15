---
title: "RK3588 Gnome-shell桌面卡死(clutter_input_device_ungrab)"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-gnome-shell桌面卡死-clutter-input-device-ungrab/
toc: true
---

## 背景

在 RK3588 平台上运行 GNOME Shell 时，偶尔会出现以下日志错误，并导致桌面图形卡死（鼠标能动但界面无响应，通过终端打开的窗口正常）：

```
gnome-shell[PID]: clutter_input_device_ungrab: assertion 'CLUTTER_IS_INPUT_DEVICE (device)' failed
```

根因是 Clutter 输入设备句柄在 ungrab 时已经被释放（NULL 指针），GNOME Shell 的输入事件循环进入异常状态。

本服务通过监控系统日志，在检测到该错误时自动发送 `SIGKILL` 重启 GNOME Shell，由 LightDM 自动拉起新的会话，恢复桌面可用性。

## 工作原理

```
journalctl -f (实时监控日志)
       │
       ▼
  匹配 "clutter_input_device_ungrab: assertion.*CLUTTER_IS_INPUT_DEVICE.*failed"
       │
       ▼
  冷却检查 (30秒内不重复触发)
       │
       ▼
  kill -9 <gnome-shell PID>
       │
       ▼
  LightDM 自动重启 GNOME Shell 会话
```

- **匹配模式**：精确匹配 `clutter_input_device_ungrab: assertion.*CLUTTER_IS_INPUT_DEVICE.*failed`，不会误触发 systemd 服务状态消息或自身日志
- **冷却时间**：30 秒内只触发一次，防止 GNOME Shell 启动时再次产生同类日志导致死循环
- **日志记录**：所有操作通过 `logger -t watchdog-clutter` 写入 journal，可通过 `journalctl -t watchdog-clutter` 查看

## 部署步骤

### 1. 创建监控脚本

```bash
cat > /usr/local/bin/watchdog-clutter.sh << 'EOF'
#!/bin/bash
# watchdog-clutter.sh - 监控 clutter_input_device_ungrab 断言失败并重启 gnome-shell

# 精确匹配原始日志格式:
# gnome-shell[PID]: clutter_input_device_ungrab: assertion 'CLUTTER_IS_INPUT_DEVICE (device)' failed
PATTERN="clutter_input_device_ungrab: assertion.*CLUTTER_IS_INPUT_DEVICE.*failed"
LOG_TAG="watchdog-clutter"
COOLDOWN=30

logger -t "$LOG_TAG" "监控启动, PID=$$, 冷却=${COOLDOWN}s"

LAST_KILL=0

journalctl -f -n 0 --no-pager 2>/dev/null | while read -r line; do
    if echo "$line" | grep -q "$PATTERN"; then
        NOW=$(date +%s)
        if [ $((NOW - LAST_KILL)) -lt $COOLDOWN ]; then
            continue
        fi
        LAST_KILL=$NOW

        PID=$(pgrep -f "^/usr/bin/gnome-shell$" | head -1)
        if [ -n "$PID" ]; then
            logger -t "$LOG_TAG" "检测到clutter断言失败, kill gnome-shell PID=${PID}"
            kill -9 "$PID"
            logger -t "$LOG_TAG" "已发送SIGKILL, lightdm将自动重启gnome-shell"
        else
            logger -t "$LOG_TAG" "检测到错误但gnome-shell进程不存在"
        fi
    fi
done
EOF

chmod +x /usr/local/bin/watchdog-clutter.sh
```

### 2. 创建 systemd 服务

```bash
cat > /etc/systemd/system/watchdog-clutter.service << 'EOF'
[Unit]
Description=Watchdog for clutter_input_device_ungrab assertion failures
After=lightdm.service
Wants=lightdm.service

[Service]
Type=simple
ExecStart=/usr/local/bin/watchdog-clutter.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 3. 启用并启动服务

```bash
systemctl daemon-reload
systemctl enable watchdog-clutter
systemctl start watchdog-clutter
```

### 4. 检查服务状态

```bash
systemctl status watchdog-clutter
```

预期输出：

```
● watchdog-clutter.service - Watchdog for clutter_input_device_ungrab assertion failures
     Loaded: loaded (/etc/systemd/system/watchdog-clutter.service; enabled; vendor preset: enabled)
     Active: active (running)
```

## 验证测试

### 模拟注入错误日志

```bash
logger "gnome-shell[1335]: clutter_input_device_ungrab: assertion 'CLUTTER_IS_INPUT_DEVICE (device)' failed"
```

### 检查 watchdog 是否响应

```bash
# 查看 watchdog 日志
journalctl -t watchdog-clutter -f
```

预期输出：

```
watchdog-clutter[PID]: 检测到clutter断言失败, kill gnome-shell PID=<旧PID>
watchdog-clutter[PID]: 已发送SIGKILL, lightdm将自动重启gnome-shell
```

### 验证 GNOME Shell 已重启

```bash
# 查看当前 gnome-shell PID（应已变更）
pgrep -f "^/usr/bin/gnome-shell$"
```

> **注意**：模拟测试会真的杀死 GNOME Shell，桌面会短暂闪烁并自动恢复，这是预期行为。

## 日常维护

| 命令                                           | 用途                   |
| ---------------------------------------------- | ---------------------- |
| `systemctl status watchdog-clutter`            | 查看服务状态           |
| `journalctl -t watchdog-clutter -f`            | 实时查看 watchdog 日志 |
| `journalctl -t watchdog-clutter --since today` | 查看今日触发记录       |
| `systemctl restart watchdog-clutter`           | 重启服务               |
| `systemctl stop watchdog-clutter`              | 停止服务               |
| `systemctl disable watchdog-clutter`           | 取消开机自启           |

## 平台兼容性

- **适用系统**：使用 LightDM + GNOME Shell 的 Ubuntu 20.04 aarch64 系统
- **前提条件**：LightDM 作为显示管理器（`kill -9` 后自动重启会话）
- **不适用的场景**：使用 GDM 作为显示管理器的系统（需将 `After`/`Wants` 改为 `gdm.service`）
