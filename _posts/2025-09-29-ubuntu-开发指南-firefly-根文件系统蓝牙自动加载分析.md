---
title: "firefly 根文件系统蓝牙自动加载分析"
date: 2025-09-29
last_modified_at: 2025-09-29
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/firefly-根文件系统蓝牙自动加载分析/
toc: true
---

概要：本文分析了 firefly 根文件系统中蓝牙固件自动加载的机制，定位到系统通过 udev 规则调用 bt-attach.service 自动加载 brcm_patchram_plus1 导致手动加载失败的问题，并提供了关闭自动加载的方法。


## 1. 背景  

在使用 firefly 的根文件系统时，发现手动执行下载蓝牙固件的命令会出现超时无响应的问题。执行以下命令时：

```bash
brcm_patchram_plus1 --enable_hci --no2bytes --use_baudrate_for_download --tosleep 200000 --baudrate 1500000 --patchram /system/etc/firmware/BCM4345C0.hcd /dev/ttyS9 -d
```

输出如下：

```
/dev/ttyS9
proc_resetwriting
01 03 0c 00
```

该输出循环显示，表示复位失败。通过查找 `brcm_patchram_plus1` 进程，发现系统已经自动加载了该程序，导致手动加载时失败。
```bash
ps -ef | grep brcm
```

进一步验证发现，系统已通过某进程自动完成固件下载，因此手动执行会因端口被占用而超时。

---

## 2. 分析  

### 2.1 查找加载进程  

通过查找服务，发现 `/etc/systemd/system/bt-attach.service` 调用了 `brcm_patchram_plus1`。

此外，该服务还会根据设备树中的配置，写入正确的蓝牙串口，或者读取 `/usr/bin/bt_uart.cfg` 中的串口配置。

### 2.2 尝试停止服务  

```bash
sudo systemctl stop bt-attach.service
sudo systemctl disable bt-attach.service
systemctl status bt-attach.service
```

虽然服务可以被停止，但由于其为 static 类型，`disable` 无效，仍会在开机时自启动。

### 2.3 查看服务文件  

```bash
cat /etc/systemd/system/bt-attach.service
```

输出内容：

```ini
[Unit]
Description=bluetooth-toggle

[Service]
Type=forking
ExecStart=/usr/bin/bt-attach
```

该服务文件中未定义启动目标（如 `[Install]` 节），因此无法通过 `enable/disable` 控制其启动行为。

### 2.4 查看调用链  

```bash
systemd-analyze critical-chain bt-attach.service
```

输出结果未包含 `bt-attach.service`，说明它不是系统核心启动链的一部分。

---

## 3. udev 规则触发分析  

查找 udev 规则中是否包含对 `bt-attach` 的调用：

```bash
grep -r "bt-attach" /etc/udev/rules.d/ /lib/udev/rules.d/
```

输出：

```
/lib/udev/rules.d/50-bluetooth.rules:SUBSYSTEM=="rfkill", ACTION=="change", ATTR{name}=="bt_default", ATTR{type}=="bluetooth", ATTRS{state}=="1", RUN+="/bin/systemctl start bt-attach.service"
/lib/udev/rules.d/50-bluetooth.rules:SUBSYSTEM=="rfkill", ACTION=="change", ATTR{name}=="bt_default", ATTR{type}=="bluetooth", ATTRS{state}=="0", RUN+="/bin/systemctl stop bt-attach.service"
```

即：`bt-attach.service` 是通过 udev 规则，在蓝牙射频开关状态变化时触发的。具体规则文件路径为：

```
/lib/udev/rules.d/50-bluetooth.rules
```

---

## 4. 解决方案  

屏蔽上述 udev 规则后重启系统，`brcm_patchram_plus1` 不再自动启动，此时可以手动成功加载蓝牙固件。

屏蔽命令：

```bash
mv /lib/udev/rules.d/50-bluetooth.rules /lib/udev/rules.d/50-bluetooth.rules.bak

udevadm control --reload-rules

udevadm trigger --subsystem-match=bluetooth --action=change
```

执行命令：

```bash
brcm_patchram_plus1 --enable_hci --no2bytes --use_baudrate_for_download --tosleep 200000 --baudrate 1500000 --patchram /system/etc/firmware/BCM4345C0.hcd /dev/ttyS9 -d
```

固件加载成功。

## 5. 源码
- `/etc/systemd/system/bt-attach.service`
```bash

[Unit]
Description=bluetooth-toggle

[Service]
Type=forking
ExecStart=/usr/bin/bt-attach
```

- `/usr/bin/bt-attach`
```bash
#!/usr/bin/env bash

model_name=$(tr -d '\0' </sys/firmware/devicetree/base/model | tr 'a-z' 'A-Z')

while read line
do
        chip_name=$(echo ${line} | cut -d ' ' -f 1)

        if [[ ${model_name} == *3588* || ${model_name} == *3576* ]]; then
                uart=$(basename /sys/firmware/devicetree/base/pinctrl/wireless-bluetooth/uart*-gpios | tr -cd "[0-9]")
                uart="/dev/ttyS${uart}"
                break
        elif [[ ${model_name} == *${chip_name}* ]]; then
                uart=$(echo ${line} | cut -d ' ' -f 2)
                break
        fi

done < /usr/bin/bt_uart.cfg

bt_type=$(rk_wifi_gettype)

rtk_attach() {
        ret=`ps -ef |grep rtk_hciattach |grep -v "grep" |wc -l`
        if [ ${ret} = 1 ]; then
            killall rtk_hciattach
            sleep 1
        fi
        /usr/bin/rtk_hciattach -n -s 115200 ${uart} rtk_h5 1500000 noflow &
}

if [[ ${bt_type} = "RTL"* ]]; then
        rtk_attach
        exit 0
else
        killall brcm_patchram_plus1
        fwname=$(/usr/bin/bt_fwname ${uart})

        if [[ ${fwname} = "bcm43438a1.hcd" ]]; then
                ln -sf /vendor/etc/firmware/nvram_ap6212a.txt /vendor/etc/firmware/nvram.txt
        elif [[ ${fwname} = "BCM4345C0.hcd" ]]; then
                ln -sf /vendor/etc/firmware/nvram_ap6255.txt /vendor/etc/firmware/nvram.txt
        fi

        start-stop-daemon --start --oknodo --pidfile /var/run/hciattach.pid --background --startas \
/usr/bin/brcm_patchram_plus1 -- --enable_hci --no2bytes --use_baudrate_for_download \
--tosleep  200000 --baudrate 1500000 --patchram /system/etc/firmware/${fwname} ${uart}
fi

exit 0

```
