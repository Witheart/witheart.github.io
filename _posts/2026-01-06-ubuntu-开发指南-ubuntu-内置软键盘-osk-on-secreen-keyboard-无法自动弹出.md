---
title: "Ubuntu 内置软键盘 OSK(on-secreen keyboard)无法自动弹出"
date: 2026-01-06
last_modified_at: 2026-01-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-内置软键盘-osk-on-secreen-keyboard-无法自动弹出/
toc: true
---

## 参考链接

- bug 报告
  [New On-screen keyboard does not appear automatically when selecting some text fields](https://bugs.launchpad.net/ubuntu/+source/gnome-shell/+bug/1760399)
  [[Focal regression] On-screen keyboard (OSK) does not appear on touch under Xorg on convertible laptops in tablet mode when physical keyboard disabled](https://bugs.launchpad.net/ubuntu/+source/mutter/+bug/1880596)

- 提到了 ibus 解决
  https://forum.garudalinux.org/t/gnome-on-screen-keyboard/21805

## 问题描述

Ubuntu 内置软键盘 OSK(on-secreen keyboard)，只在搜索框，或者 Alt+F2 时可以自动弹出，但是在类似于终端、firefox 等其他软件的输入框中无法弹出。且在搜索框弹出时，输入卡顿。

## 解决方式

- 安装 ibus 相关

```bash
sudo apt install ibus ibus-data ibus-gtk ibus-gtk3
```

- 配置环境变量

```bash
sudo vim /etc/environment
```

添加

```bash
GTK_IM_MODULE=ibus
QT_IM_MODULE=ibus
XMODIFIERS=@im=ibus
```

- 重启

```bash
sudo reboot
```

- 重启后 echo 下设置的这几个变量看看是否正确加载了

```bash
echo $GTK_IM_MODULE
echo $QT_IM_MODULE
echo $XMODIFIERS
```

现在应该可以正常弹出了。

- 直接发送D-bus消息弹出键盘的方式：（没试过，控制的是Caribou软键盘，Ubuntu后来的版本好像不用这个键盘了）
https://stackoverflow.com/questions/51434141/centos-on-screen-keyboard-not-showing-for-java-swing-text-entry-fields/51476903#51476903
```bash
// Source - https://stackoverflow.com/a/51476903
// Posted by Socrates, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-07, License - CC BY-SA 4.0

dbus-send --type=method_call --dest=org.gnome.Caribou.Keyboard /org/gnome/Caribou/Keyboard org.gnome.Caribou.Keyboard.Show uint32:0
dbus-send --type=method_call --dest=org.gnome.Caribou.Keyboard /org/gnome/Caribou/Keyboard org.gnome.Caribou.Keyboard.Hide uint32:0
```

## 原理分析

### GNOME 屏幕键盘“自动弹出”关键原理

在 **GNOME Shell 3.36（Ubuntu 20.04）** 中：

> **屏幕键盘是否自动弹出，不是由应用决定，而是由 GNOME Shell + Mutter 判断当前输入焦点是否是“触摸输入场景”**

### 自动弹出依赖 4 个核心条件

| 条件                                        | 说明                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| 1️⃣ GNOME Shell 自己的 OSK                   | `org.gnome.desktop.a11y.applications screen-keyboard-enabled` |
| 2️⃣ 输入法框架                               | IBus + GTK IM module                                          |
| 3️⃣ 应用是否是 **Wayland / GTK**             | X11/Qt/Electron 很多场景不触发                                |
| 4️⃣ GNOME 是否检测到 **Touch / Tablet 设备** |                                                               |

---

### 只有部分应用能弹出键盘原因

> ✅ Alt+F2 / 应用搜索 → 能弹
> ❌ 终端 / Firefox → 不弹

这是 **GNOME Shell 内部输入框 vs 普通应用窗口** 的典型差异。

> **A 系统中，GNOME 没有把普通应用输入框识别为“触摸输入场景”**

- 但为什么 Shell 自己的搜索框可以？

因为：

| 输入框类型         | 是否经过 GNOME Shell     |
| ------------------ | ------------------------ |
| Alt+F2 搜索        | ✅ GNOME Shell 内部      |
| 应用程序搜索       | ✅ GNOME Shell 内部      |
| Terminal / Firefox | ❌ 普通 Wayland/X11 应用 |

**Shell 内部输入框绕过了触摸判断逻辑，强制弹 OSK**

### 重点排查

1. 是否识别到 Touchscreen / Tablet 设备（最重要）

GNOME **只有检测到触摸设备**，才会在应用输入框弹 OSK。

```bash
ls /dev/input/event*
```

```bash
cat /proc/bus/input/devices
```

重点看有没有类似：

```
N: Name="Goodix Capacitive TouchScreen"
H: Handlers=event3
```

或者：

```
Touchscreen
Tablet
```

2. Mutter 是否认为是“tablet mode”

GNOME 有内部判断：

```bash
gsettings get org.gnome.desktop.peripherals.touchscreen send-events
```

```bash
gsettings get org.gnome.desktop.interface toolkit-accessibility
```

正确值应是：

```bash
'enabled'
true
```

如果 A 系统是 `disabled / false`，OSK 只会在 Shell 内部弹。（第一个值实测为别的内容）

3. 输入法模块是否完整（IBus + GTK）

检查：

```bash
echo $GTK_IM_MODULE
echo $QT_IM_MODULE
echo $XMODIFIERS
```

正常应至少有：

```bash
GTK_IM_MODULE=ibus
XMODIFIERS=@im=ibus
```

检查 ibus 进程是否在运行，正常的输出如下：

```bash
ps -ef | grep ibus

signway     1241    1198  0 Jan05 ?        00:00:13 ibus-daemon --panel disable --xim
signway     1245    1241  0 Jan05 ?        00:00:00 /usr/libexec/ibus-memconf
signway     1246    1241  0 Jan05 ?        00:00:03 /usr/libexec/ibus-extension-gtk3
signway     1248     875  0 Jan05 ?        00:00:00 /usr/libexec/ibus-x11 --kill-daemon
signway     1252     875  0 Jan05 ?        00:00:00 /usr/libexec/ibus-portal
signway     1489    1241  0 Jan05 ?        00:00:04 /usr/libexec/ibus-engine-simple
signway    13222    3996  0 11:46 pts/4    00:00:00 grep --color=auto ibus
```
