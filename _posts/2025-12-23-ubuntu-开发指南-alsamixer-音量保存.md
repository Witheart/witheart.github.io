---
title: "alsamixer 音量保存"
date: 2025-12-23
last_modified_at: 2025-12-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/alsamixer-音量保存/
toc: true
---

## 修改历史

| 时间   | 历史                                |
| ------ | ----------------------------------- |
| 250708 | 创建了本文                          |
| 251223 | 加入重启 alsamixer 音量被重置的说明 |

## 音量保存与开机加载方式

- Ubuntu 下，音量设置保存验证成功

- 打开 alsamixer 并设置音量

```sh
alsamixer
```

- 调整后 ESC 退出，然后保存当前设置

```sh
sudo alsactl store -f /var/lib/alsa/asound.state
```

- 尝试加载配置

```sh
sudo alsactl restore -f /var/lib/alsa/asound.state
```

- 如果配置加载没有报错，在开机脚本中加入（如果找不到 ucm.conf，加入-U 选项即可）

```sh
sudo alsactl restore -f /var/lib/alsa/asound.state
```

## 音量开机被重置的思考
- 系统中其实自带一个服务，用于在开机时自动加载/var/lib/alsa/asound.state。查看服务状态
```bash
root@rk3588:~# sudo systemctl status alsa-restore.service
● alsa-restore.service - Save/Restore Sound Card State
     Loaded: loaded (/lib/systemd/system/alsa-restore.service; static)
     Active: active (exited) since Tue 2025-12-23 07:35:22 UTC; 2min 27s ago
       Docs: man:alsactl(1)
    Process: 407 ExecStartPre=/bin/mkdir -p /run/alsa (code=exited, status=0/SUCCESS)
    Process: 442 ExecStart=/usr/sbin/alsactl -E HOME=/run/alsa -E XDG_RUNTIME_DIR=/run/alsa/runtime restore (code=exited, status=0/SUCCESS)
   Main PID: 442 (code=exited, status=0/SUCCESS)
        CPU: 9ms

12月 23 07:35:22 rk3588 systemd[1]: Starting Save/Restore Sound Card State...
12月 23 07:35:22 rk3588 alsactl[442]: alsa-lib parser.c:2373:(load_toplevel_config) Unable to find the top-level configuration file '/usr/share/alsa/ucm2/ucm.conf'.
12月 23 07:35:22 rk3588 alsactl[442]: alsa-lib main.c:1412:(snd_use_case_mgr_open) error: failed to import hw:0 use case configuration -2
12月 23 07:35:22 rk3588 alsactl[442]: alsa-lib parser.c:2373:(load_toplevel_config) Unable to find the top-level configuration file '/usr/share/alsa/ucm2/ucm.conf'.
12月 23 07:35:22 rk3588 alsactl[442]: alsa-lib main.c:1412:(snd_use_case_mgr_open) error: failed to import hw:1 use case configuration -2
12月 23 07:35:22 rk3588 systemd[1]: Finished Save/Restore Sound Card State.

```

- 但是自动加载的这个音量，应该是会被pulseaudio重置，所以需要在开机脚本中显式加载asound.state
