---
title: "如何查找 Ubuntu 桌面上图形界面程序对应的进程"
date: 2026-01-10
last_modified_at: 2026-01-10
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/如何查找-ubuntu-桌面上图形界面程序对应的进程/
toc: true
---

在 Ubuntu 桌面环境中，有时我们需要查找某个图形界面程序对应的进程 ID（PID），以便进行进程监控、资源分析、强制结束进程等操作。本文将介绍几种常用的命令行工具和方法，帮助您快速定位窗口对应的进程。


## 方法一：使用 `wmctrl` 查看窗口列表

`wmctrl` 是一个命令行工具，用于与窗口管理器交互，可以列出当前桌面上的所有窗口。

### 安装与基本命令

```bash
# 安装 wmctrl
sudo apt install wmctrl

# 列出所有窗口
wmctrl -l
```

### 输出示例

```
0x01e0000a  0 RK3588 signway@RK3588: ~/hcg/apps
0x02400017  0 RKKM8 CabinetInsideLowerMechine.Shell
0x02400021  0 RK3588 DialogMianWindow
0x02400024  0 RK3588 DialogMianWindow
0x01e016f4  0 RK3588 signway@RK3588: ~
0x01e02431  0 RK3588 signway@RK3588: ~
```

**输出列说明**：

- 第一列：窗口 ID（十六进制）
- 第二列：桌面编号
- 第三列及之后：窗口标题（某些窗口可能无标题）

### 扩展用法

```bash
# 显示更多窗口详细信息
wmctrl -lp
```

这会同时显示每个窗口对应的进程 ID（PID）。

## 方法二：使用 `xprop` 获取指定窗口的 PID

`xprop` 是一个 X Window 系统属性显示工具，可以交互式地获取窗口属性。

### 基本使用

```bash
# 运行命令后，鼠标点击目标窗口
xprop _NET_WM_PID
```

### 输出示例

```
_NET_WM_PID(CARDINAL) = 1234
```

其中 `1234` 即为该窗口对应的进程 ID。

### 一步获取（非交互式）

如果您知道窗口 ID，可以直接查询：

```bash
xprop -id 0x01e0000a _NET_WM_PID
```

## 方法三：使用 `xdotool` 获取活动窗口 PID

`xdotool` 是一个自动化 X 窗口操作的工具，可以模拟键盘输入、鼠标移动等操作。

### 安装与使用

```bash
# 安装 xdotool
sudo apt install xdotool

# 获取当前活动窗口的PID
xdotool getwindowfocus getwindowpid
```

### 输出示例

```
1234
```

### 更多实用命令

```bash
# 获取当前活动窗口的窗口ID
xdotool getwindowfocus

# 根据窗口标题查找窗口并获取PID
xdotool search --name "Firefox" getwindowpid
```

## 方法四：使用 `xwininfo` 获取窗口信息

`xwininfo` 可以显示关于 X 窗口的信息，包括窗口 ID。

### 基本使用

```bash
# 运行后点击目标窗口
xwininfo | grep "Window id"
```

### 输出示例

```
xwininfo: Window id: 0x4a (has no name)
```

### 结合其他工具使用

```bash
# 获取窗口ID后查询PID
WIN_ID=$(xwininfo | grep "Window id:" | awk '{print $4}')
xprop -id $WIN_ID _NET_WM_PID
```

## 方法五：使用 `pgrep` 和 `pstree` 辅助查找

### 通过进程名查找

```bash
# 查找所有Firefox进程
pgrep -l firefox

# 显示进程树，查看父子进程关系
pstree -p | grep -A 5 -B 5 firefox
```

## 工具对比与选择建议

| 工具       | 优点               | 缺点                  | 适用场景               |
| ---------- | ------------------ | --------------------- | ---------------------- |
| `wmctrl`   | 一次性查看所有窗口 | 某些窗口可能无标题    | 浏览所有窗口           |
| `xprop`    | 精确获取窗口属性   | 需要交互或已知窗口 ID | 获取特定窗口 PID       |
| `xdotool`  | 功能强大，可自动化 | 需要额外安装          | 获取活动窗口或脚本操作 |
| `xwininfo` | 交互简单           | 信息有限              | 快速获取窗口 ID        |
