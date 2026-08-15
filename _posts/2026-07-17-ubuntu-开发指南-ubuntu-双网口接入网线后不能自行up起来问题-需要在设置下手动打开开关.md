---
title: "Ubuntu 双网口接入网线后不能自行up起来问题，需要在设置下手动打开开关"
date: 2026-07-17
last_modified_at: 2026-07-17
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-双网口接入网线后不能自行up起来问题-需要在设置下手动打开开关/
toc: true
---

## 问题描述

3588 双有线网卡，eth0如果在开机前没有接入网线，开机后再接入网线，那么eth0无法自动up，需要在设置下手动打开开关才能up。

实测3片板子，有1片有这个问题，另外2片没有。

查看其他系统，似乎有针对这个问题的改动，如下

```ini
systemctl cat NetworkManager

ExecStartPre=-/sbin/ifconfig eth0 up
ExecStartPost=-/usr/bin/nmcli conn delete id eth0
```

- **`ExecStartPre=-/sbin/ifconfig eth0 up`**：在 NetworkManager 启动**之前**，系统强制向内核发送指令拉起 `eth0`。这个动作会提前唤醒 RK3588 的 PHY 芯片，强制完成底层驱动的初始化。这样当 NetworkManager 随后启动并接管网卡时，底层驱动已经明确知道自己支持拔插检测了，从而避免了“不支持 carrier detection”的致命误判。
- **`ExecStartPost=...`**：由于提前用 ifconfig 拉起网卡，NM 启动时可能会生成一个临时的脏配置（名为 `eth0`），这行代码负责在 NM 启动后顺手把它清理掉，防止冲突。

同样的部署方式如下：
```bash
sudo mkdir -p /etc/systemd/system/NetworkManager.service.d
```

```bash
sudo bash -c 'cat > /etc/systemd/system/NetworkManager.service.d/fix-carrier-detect.conf << EOF
[Service]
ExecStartPre=-/sbin/ifconfig eth0 up
ExecStartPost=-/usr/bin/nmcli conn delete id eth0
EOF'

```

```bash
sudo systemctl daemon-reload
sudo systemctl restart NetworkManager
```

但是实测，该补丁打上后，问题一致。

## 首先分析下不能自行up的原因
```bash
journalctl -u NetworkManager -b 0 | grep eth0

7月 16 18:24:32 rk3588 NetworkManager[466]: <info>  [1784197472.5181] device (eth0): driver '(null)' does not support carrier detection.
7月 16 18:24:32 rk3588 NetworkManager[466]: <info>  [1784197472.5183] device (eth0): driver 'rk_gmac-dwmac' does not support carrier detection.
```
问题板的网卡回复不支持载波检测。

推测是NetworkManager 服务过早启动，此时PHY 芯片还没完全初始化完毕。所以上述的补丁在NetworkManager启动之前，系统强制向内核发送指令拉起 eth0。这样当 NetworkManager 随后启动并接管网卡时，底层驱动已经明确知道自己支持拔插检测了，从而避免了“不支持 carrier detection”的致命误判。

但是这个补丁为什么在问题版上没用呢？尝试加入日志：
```bash
[Service]
ExecStartPre=/bin/sh -c 'echo "--- Before UP ---"; ip link show eth0; echo "--- Exec UP ---"; /sbin/ifconfig eth0 up 2>&1; echo "--- After UP ---"; ip link show eth0'
ExecStartPre=/bin/sleep 3
ExecStartPost=-/usr/bin/nmcli conn delete id eth0
```

查看日志
```bash
dmesg | grep -iE 'eth0|gmac|phy|network'
```

多次报错如下
```bash
[    7.569680] rk_gmac-dwmac fe1c0000.ethernet eth0: PHY [stmmac-1:01] driver [RTL8211F Gigabit Ethernet] (irq=POLL)
[    8.572231] rk_gmac-dwmac fe1c0000.ethernet: Failed to reset the dma
[    8.572274] rk_gmac-dwmac fe1c0000.ethernet eth0: stmmac_hw_setup: DMA engine initialization failed
[    8.572287] rk_gmac-dwmac fe1c0000.ethernet eth0: stmmac_open: Hw setup failed
```
从第 7 秒到第 35 秒，内核每秒钟都在尝试拉起网卡，但全部因为 Failed to reset the dma（DMA复位失败） 而崩溃。

## 说明：目前还未知此问题的原因
