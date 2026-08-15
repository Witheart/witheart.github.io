---
title: "Ubuntu 增加磁盘空间提醒的桌面弹窗（已验证适用于 GNOME、XFCE）"
date: 2025-09-30
last_modified_at: 2025-09-30
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-增加磁盘空间提醒的桌面弹窗-已验证适用于-gnome-xfce/
toc: true
---

## 问题背景

- 客诉桌面无法启动，经排查，是根分区存储空间不足引起的。
- 需要增加磁盘空间不足时的弹窗预警功能。

## 解决思路

- 方法一：使用 cron 定时任务检查磁盘空间，配合`notify-send`命令进行弹窗提醒。
- 方法二：使用类似 Stacer 的系统监控软件

## 方式一：自定义脚本

1. **创建监控脚本**

```bash
# 创建脚本文件
sudo nano /usr/local/bin/disk-space-alert.sh
```

粘贴以下内容：

```bash
#!/bin/bash

# 设置阈值（0-100）
THRESHOLD=90

# 获取根分区使用率（去掉百分号）
USAGE=$(df / --output=pcent | tail -1 | tr -d '% ')

# 检查是否超过阈值
if [ "$USAGE" -gt "$THRESHOLD" ]; then
    # 获取当前登录用户的ID
    USER_ID=$(id -u)

    # 获取DBUS会话地址（确保通知能显示在桌面）
    DBUS_ADDRESS="unix:path=/run/user/${USER_ID}/bus"

    # 发送桌面通知
    DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=$DBUS_ADDRESS \
    notify-send -t 1000 -u normal \
    "⚠️ 磁盘空间警告" \
    "根分区使用率已达 ${USAGE}%！请及时清理空间！"
fi
```

2. **设置脚本权限**

```bash
sudo chmod +x /usr/local/bin/disk-space-alert.sh
```

3. **配置定时任务**

- 使用桌面登录时的用户，登录终端

```bash
# 编辑当前用户的cron任务
crontab -e
```

添加以下内容（每 10 分钟检查一次）：

```bash
*/10 * * * * /usr/local/bin/disk-space-alert.sh
```

- 未安装 cron，则使用下面的方式安装

```bash
sudo apt update
sudo apt install cron

# 首次使用时，需要选择编辑器，可选择默认的vim
```

4. **手动测试**
   在桌面终端下测试，不要使用 ssh

```bash
# 临时调低阈值测试
THRESHOLD=5 /usr/local/bin/disk-space-alert.sh

# 或直接发送测试通知
notify-send -u normal "测试标题" "测试内容"
```

5. **注意**
-t 选项指定的显示时长只在 normal 和 low 等级的弹窗生效，critical 等级则需要手动点击关闭。

6. **效果展示**
   ![alt text](/assets/images/ubuntu-开发指南/ubuntu-增加磁盘空间提醒的桌面弹窗-已验证适用于-gnome-xfce/PixPin_2025-09-30_10-40-51.png)

## 方式二：使用 Stacer

1. **安装 Stacer（带图形界面）**

```bash
sudo apt install stacer
```

- 打开 Stacer > 设置 > 启用"磁盘空间监控"
- 设置阈值
  ![alt text](/assets/images/ubuntu-开发指南/ubuntu-增加磁盘空间提醒的桌面弹窗-已验证适用于-gnome-xfce/PixPin_2025-09-30_10-41-38.png)

- 缺点：
  - 弹窗只维持一小段时间，不会反复提醒，需要降到阈值以下并再次进行触发，才能再次触发弹窗
  - 软件占用资源较多
