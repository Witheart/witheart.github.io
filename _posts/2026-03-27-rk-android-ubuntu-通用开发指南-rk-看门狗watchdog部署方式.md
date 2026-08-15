---
title: "RK 看门狗watchdog部署方式"
date: 2026-03-27
last_modified_at: 2026-03-27
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk-看门狗watchdog部署方式/
toc: true
---

概要：本文介绍 RK 平台 watchdog 的部署方式，包括后台喂狗脚本的创建、脚本内容配置、执行权限赋予，以及将喂狗程序加入开机启动（/etc/rc.local）的方法。  



## 1. 后台喂狗程序
**（两个方式任选其一即可）**

### 1.1 方式一
将压缩包中的`watchdog_kick.sh`传到需要开启看门狗机器的`/root`目录下

### 1.2 方式二
```bash
sudo vim /root/watchdog_kick.sh
```

填入如下内容：

```bash
#!/bin/bash

WATCHDOG_DEV="/dev/watchdog"
INTERVAL=20

# 检查设备是否存在
if [ ! -e "$WATCHDOG_DEV" ]; then
    echo "watchdog device not found: $WATCHDOG_DEV"
    exit 1
fi

echo "Watchdog kicker started, interval=${INTERVAL}s"

while true; do
    # 喂狗
    echo "D" > "$WATCHDOG_DEV"

    # 写入内核日志缓冲区
    echo "watchdog kicked at $(date)" > /dev/kmsg

    sleep "$INTERVAL"
done
```

---

## 2. 赋予执行权限

```bash
sudo chmod +x /root/watchdog_kick.sh
```

---

## 3. 加入开机脚本

编辑 `/etc/rc.local`：

```bash
sudo vim /etc/rc.local
```

在这个位置加入：  
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/rk-看门狗watchdog部署方式/PixPin_2026-03-27_16-33-18.png)

加入内容如下：

```bash
# watchdog
(sleep 15; /root/watchdog_kick.sh) &
```
