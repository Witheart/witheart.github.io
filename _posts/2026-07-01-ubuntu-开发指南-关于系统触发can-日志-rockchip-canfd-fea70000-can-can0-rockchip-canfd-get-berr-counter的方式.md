---
title: "关于系统触发can 日志 rockchip_canfd fea70000.can can0 rockchip_canfd_get_berr_counter的方式"
date: 2026-07-01
last_modified_at: 2026-07-01
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/关于系统触发can-日志-rockchip-canfd-fea70000-can-can0-rockchip-canfd-get-berr-counter的方式/
toc: true
---

## 问题
rk内核在can节点未up时，也会向日志中打印大量的日志：
```bash
[   94.885687] rockchip_canfd fea70000.can can0: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
[   94.885719] rockchip_canfd fea60000.can can1: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
[   95.013838] rockchip_canfd fea70000.can can0: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
[   95.013885] rockchip_canfd fea60000.can can1: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
[   95.043752] rockchip_canfd fea70000.can can0: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
[   95.043776] rockchip_canfd fea60000.can can1: rockchip_canfd_get_berr_counter RX_ERR_CNT=0x00000000, TX_ERR_CNT=0x00000000
```

## 手动触发方式
```bash
while true; do ip -details link show can0; sleep 0.1; done
```
查询can信息时，该日志也会跟着打印。
