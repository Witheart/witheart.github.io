---
title: "Linux 4G模块 EC20 EC200等系列开机兼容脚本-ECM模式"
date: 2025-10-18
last_modified_at: 2025-10-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-4g模块-ec20-ec200等系列开机兼容脚本-ecm模式/
toc: true
---

```bash
# 4G 拨号======
init_4g() {
    echo "[witheart] 初始化4G拨号..." > /dev/kmsg

    # 获取Quectel模块的PID
    pid=$(lsusb | grep "2c7c:" | awk -F: '{print $3}' | cut -c 1-4)

    # 未检测到模块时直接退出
    if [ -z "$pid" ]; then
        echo "[witheart] 错误：未检测到Quectel模块，跳过初始化4G流程" > /dev/kmsg
        return 1
    fi

    # 根据PID选择拨号命令
    case "$pid" in
        "0125")
            echo "[witheart] 检测到EC20模块(PID:0125)" > /dev/kmsg
            echo -e "AT+QCFG=\"usbnet\",1\r\n" > /dev/ttyUSB2
            sleep 2
            echo -e "AT+CFUN=1,1\r\n" > /dev/ttyUSB2
            ;;
        "0901")
            echo "[witheart] 检测到EC200U模块(PID:0901)" > /dev/kmsg
            echo -e "AT+QCFG=\"usbnet\",1\r\n" > /dev/ttyUSB0
            sleep 2
            echo -e "AT+qnetdevctl=1,1,1\r\n" > /dev/ttyUSB0
            ;;
        "6002")
            echo "[witheart] 检测到EC200M模块(PID:6002)" > /dev/kmsg
            echo -e "AT+QCFG=\"usbnet\",1\r\n" > /dev/ttyUSB1
            sleep 2
            echo -e "AT+qnetdevctl=0,1,1\r\n" > /dev/ttyUSB1
            sleep 2
            echo -e "AT+qnetdevctl=1,1,1\r\n" > /dev/ttyUSB1
            ;;
        *)
            echo "[witheart] 检测到未知的 Quectel 移动网络模块(PID:$pid)" > /dev/kmsg
            ;;
    esac

    sleep 2
    ifconfig usb0 up
    sleep 1
    udhcpc -i usb0
    sleep 1
    nmcli connection modify "Mobile Network" ipv4.route-metric 1000
    sleep 1
    nmcli connection down "Mobile Network" && sudo nmcli connection up "Mobile Network"

    echo "[witheart] 初始化4G拨号结束" > /dev/kmsg
}
# 延迟10s执行4G拨号初始化
( sleep 10; init_4g ) &

```
