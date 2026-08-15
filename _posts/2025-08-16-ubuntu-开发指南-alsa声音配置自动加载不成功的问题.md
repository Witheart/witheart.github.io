---
title: "alsa声音配置自动加载不成功的问题"
date: 2025-08-16
last_modified_at: 2025-08-16
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/alsa声音配置自动加载不成功的问题/
toc: true
---

## 问题描述
根据arch文档的说法
>alsa-utils包 软件包默认包含了 systemd 单元配置文件 alsa-restore.service 和 alsa-state.service。

>在安装时它们会自动安装并激活（通过软件包提供的指向sound.target的符号链接）。选项如下所述：

>- alsa-restore.service默认在启动时读取/var/lib/alsa/asound.state，并在关机时写入更新值。由于 /etc/alsa/state-daemon.conf不存在，除非用户有意识的创建。
>- alsa-state.service在守护进程模式下（重新）启动alsactl 以持续跟踪并保持音量改变,前提是用户有意识的创建了/etc/alsa/state-daemon.conf。
显然，这两种方法是互斥的,您可以根据自己的要求决定选择两种方法之一。要编辑这些单位，参考systemd#修改现存单元文件. 您可以用systemctl查看他们的状态。

但问题是，我的系统中虽然启动了alsa-restore.service，并且有执行成功的相关日志，但是似乎alsa-restore.service没有从/var/lib/alsa/asound.state处加载声音配置，查看该服务内容如下:
```ini
systemctl cat alsa-restore.service

# /lib/systemd/system/alsa-restore.service
#
# Note that two different ALSA card state management schemes exist and they
# can be switched using a file exist check - /etc/alsa/state-daemon.conf .
#

[Unit]
Description=Save/Restore Sound Card State
Documentation=man:alsactl(1)
ConditionPathExists=!/etc/alsa/state-daemon.conf
ConditionPathExistsGlob=/dev/snd/control*
After=alsa-state.service

[Service]
Type=oneshot
RemainAfterExit=true
ExecStartPre=/bin/mkdir -p /run/alsa
ExecStart=-/usr/sbin/alsactl -E HOME=/run/alsa -E XDG_RUNTIME_DIR=/run/alsa/runtime restore
ExecStop=-/usr/sbin/alsactl -E HOME=/run/alsa -E XDG_RUNTIME_DIR=/run/alsa/runtime store

```
奇怪的是，-E用于设置环境变量，这样做应该会从/run/alsa目录下去找asound.state进行解析。而按照文档来说，asound.state文件应该保存在/var/lib/alsa/下

而alsa-state.service并没有启用

## 解决方法
修改服务的内容，使加载的路径指向/var/lib/alsa/asound.state，应该也可以解决，但如果进行软件包或者系统的升级，该服务文件可能会被覆盖，需要重新配置。

所以我选择在保存了/var/lib/alsa/asound.state后，在开机脚本中手动加载一次，覆盖错误的加载

在开机脚本中加入
```bash
sudo alsactl restore -f /var/lib/alsa/asound.state
```
