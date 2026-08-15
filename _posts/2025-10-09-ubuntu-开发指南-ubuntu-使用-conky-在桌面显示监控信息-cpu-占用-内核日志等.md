---
title: "Ubuntu 使用 Conky 在桌面显示监控信息（CPU 占用、内核日志等）"
date: 2025-10-09
last_modified_at: 2025-10-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-使用-conky-在桌面显示监控信息-cpu-占用-内核日志等/
toc: true
---

概要：本文介绍了如何在 Ubuntu 系统中使用 Conky 工具，在桌面显示系统监控信息，包括 top 进程、dmesg 内核日志以及 journalctl 系统日志的配置与展示方法。同时还说明了如何设置 Conky 开机自启动以及多配置文件的使用方式。


## 1. Conky 简介

Conky 是一个轻量级、高度可定制的系统监视软件，它能够将你关心的各种系统信息直接显示在桌面上。它可以从系统内核读取大量数据，并以文本或图形的方式实时展示出来。通过调用外部脚本或程序，Conky 的能力还可以无限扩展，显示更多与系统无关的信息。

---

## 2. 使用示例：显示 top、dmesg 和 journalctl 信息

### 2.1 安装所需软件包

```bash
sudo apt update
sudo apt install conky conky-all lm-sensors htop stress -y
```

### 2.2 编辑配置文件

编辑桌面用户路径下的配置文件：

```bash
vim ~/.conkyrc
```

### 2.3 示例配置内容

```lua
conky.config = {
    alignment = 'top_left',
    background = true,
    border_width = 1,
    cpu_avg_samples = 2,
    default_color = 'black',
    default_outline_color = 'black',
    default_shade_color = 'black',
    draw_borders = false,
    draw_graph_borders = true,
    draw_outline = false,
    draw_shades = false,
    use_xft = true,
    font = 'DejaVu Sans Mono:size=12',
    gap_x = 20,
    gap_y = 40,
    minimum_height = 5,
    minimum_width = 450,
    net_avg_samples = 2,
    no_buffers = true,
    out_to_console = false,
    out_to_stderr = false,
    extra_newline = false,
    own_window = true,
    own_window_class = 'Conky',
    own_window_type = 'desktop',
    own_window_transparent = true,
    own_window_argb_visual = true,
    own_window_argb_value = 0,
    own_window_hints = 'undecorated,below,sticky,skip_taskbar,skip_pager',
    double_buffer = true,
    stippled_borders = 0,
    update_interval = 1.0,
    uppercase = false,
    use_spacer = 'none',
    show_graph_scale = false,
    show_graph_range = false
}

conky.text = [[
${color black}${font :bold:size=12}TOP (进程监控)${font}${color}
${execi 5 top -b -n 1 -o \%CPU | head -n 20}

${color black}${font :bold:size=12}DMESG (内核日志)${font}${color}
${execi 5 dmesg --time-format=iso | tail -n 15}

${color black}${font :bold:size=12}JOURNALCTL (系统日志)${font}${color}
${execi 5 journalctl -n 15 --no-pager -o short-iso}
]]

```

### 2.4 启动 Conky 显示

保存后，在桌面终端下运行以下命令即可展示：

```bash
conky
```

---

## 3. 设置 Conky 开机自启动

在系统的“会话与启动”设置中，添加一个启动程序，命令填写为：

```bash
conky
```

这样每次开机后 Conky 会自动运行。

---

## 4. 多内容显示配置

可以创建多个 Conky 配置文件，分别用于显示不同的内容。比如，可以在右上角显示系统相关信息。

```bash
vim ~/.conky_right.conf
```

配置文件示例如下

```bash
conky.config = {
    alignment = 'top_right',
    background = true,
    border_width = 1,
    cpu_avg_samples = 2,
    default_color = '000000',
    default_outline_color = 'black',
    default_shade_color = 'black',
    draw_borders = false,
    draw_graph_borders = true,
    draw_outline = false,
    draw_shades = false,
    use_xft = true,
    font = 'DejaVu Sans Mono:size=10, Noto Sans CJK SC:size=10',
    gap_x = 20,
    gap_y = 60,  -- 增加底部间距防止内容被截断
    minimum_height = 0,  -- 自动高度适配内容
    minimum_width = 300,
    net_avg_samples = 2,
    no_buffers = true,
    out_to_console = false,
    out_to_stderr = false,
    extra_newline = false,
    own_window = true,
    own_window_class = 'Conky',
    own_window_type = 'desktop',
    own_window_transparent = true,
    own_window_argb_visual = true,
    own_window_argb_value = 0,
    own_window_hints = 'undecorated,below,sticky,skip_taskbar,skip_pager',
    double_buffer = true,
    stippled_borders = 0,
    update_interval = 1.0,
    uppercase = false,
    use_spacer = 'right',
    show_graph_scale = false,
    show_graph_range = false
}

conky.text = [[
# ======================
# 系统信息
# ======================
${font Noto Sans CJK SC:bold:size=12}${color 000000}系统信息${font}
${font Noto Sans CJK SC:size=10}${color 000000}主机名:${alignr}${nodename}
${color 000000}操作系统:${alignr}${sysname} ${execi 1000 lsb_release -ds | cut -d ' ' -f1-}
${color 000000}内核版本:${alignr}${kernel}
${color 000000}运行时间:${alignr}${uptime}
${color 000000}处理器:${alignr}${machine} (${exec grep -c ^processor /proc/cpuinfo}核心)

# ======================
# CPU监控
# ======================
${font Noto Sans CJK SC:bold:size=12}${color 000000}CPU 监控${font}
${font Noto Sans CJK SC:size=10}${color 000000}使用率:${alignr}${cpu}%
${color 000000}温度:${alignr}${hwmon 0 temp 1}°C
${color 000000}频率:${alignr}${freq_g} GHz
# 显示全部核心
${color 000000}核心1:${alignr}${cpu cpu1}%
${color 000000}核心2:${alignr}${cpu cpu2}%
${color 000000}核心3:${alignr}${cpu cpu3}%
${color 000000}核心4:${alignr}${cpu cpu4}%
${color 000000}核心5:${alignr}${cpu cpu5}%
${color 000000}核心6:${alignr}${cpu cpu6}%
${color 000000}核心7:${alignr}${cpu cpu7}%
${color 000000}核心8:${alignr}${cpu cpu8}%

# ======================
# 内存监控
# ======================
${font Noto Sans CJK SC:bold:size=12}${color 000000}内存监控${font}
${font Noto Sans CJK SC:size=10}${color 000000}物理内存:${alignr}${mem} / ${memmax}
${color 000000}使用率:${alignr}${memperc}%
${color 000000}交换空间:${alignr}${swap} / ${swapmax}
${color 000000}缓存:${alignr}${cached}
${color 000000}缓冲区:${alignr}${buffers}

# ======================
# 硬盘监控
# ======================
${font Noto Sans CJK SC:bold:size=12}${color 000000}硬盘监控${font}
${font Noto Sans CJK SC:size=10}${color 000000}根目录(/):${alignr}${fs_used /} / ${fs_size /}
${color 000000}使用率:${alignr}${fs_used_perc /}%
${color 000000}Home目录(/home):${alignr}${fs_used /home} / ${fs_size /home}
${color 000000}使用率:${alignr}${fs_used_perc /home}%
${color 000000}IO读取:${alignr}${diskio_read}
${color 000000}IO写入:${alignr}${diskio_write}

# ======================
# 网络监控
# ======================
${font Noto Sans CJK SC:bold:size=12}${color 000000}网络监控${font}
${font Noto Sans CJK SC:size=10}${color 000000}eth0:${alignr}${addr eth0}
${color 000000}↑ ${upspeed eth0}${alignr}↓ ${downspeed eth0}

# eth1监控
${color 000000}eth1:${alignr}${addr eth1}
${color 000000}↑ ${upspeed eth1}${alignr}↓ ${downspeed eth1}
# wlan0监控（添加接口存在检测）
${if_existing /sys/class/net/wlan0}
${color 000000}wlan0:${alignr}${addr wlan0}
${color 000000}↑ ${upspeed wlan0}${alignr}↓ ${downspeed wlan0}
${endif}

# 确保最后有空行防止内容被截断
${font}
]]

```

- 使用下面的方式加载
```bash
conky -c ~/.conky_right.conf
```
会话与启动中不识别~环境变量，可考虑使用绝对路径。

## 5. 效果展示
![alt text](/assets/images/ubuntu-开发指南/ubuntu-使用-conky-在桌面显示监控信息-cpu-占用-内核日志等/截图_2025-10-09_06-57-54.png)
