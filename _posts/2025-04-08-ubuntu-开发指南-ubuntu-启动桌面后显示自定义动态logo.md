---
title: "Ubuntu 启动桌面后显示自定义动态logo"
date: 2025-04-08
last_modified_at: 2025-04-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-启动桌面后显示自定义动态logo/
toc: true
---

概要：本文介绍了在Ubuntu 20.04系统中，使用LXDE桌面环境时，如何在系统启动后显示自定义动态GIF logo，并在加载完成后自动关闭动态logo并启动指定软件的解决方案。


## 1. 环境信息  

### 1.1 系统版本  
- Ubuntu 20.04  

### 1.2 桌面环境  
- LXDE  
- lxpanel 0.10.0  

---

## 2. 背景描述  

### 2.1 问题  
- 禁用了 `pcmanfm` 和 `lxpanel`，开机后直接打开用户指定的软件。  
- 在内核Logo到软件打开的过程中，存在12秒的黑屏时间。  

### 2.2 客户需求  
- 在黑屏时加入GIF格式的动态加载图片，以改善用户体验。

---

## 3. 解决方案思路  

### 3.1 使用播放器全屏播放动态Logo  
- 使用 `mpv` 播放器全屏播放动态GIF logo。  
- 启动指定软件，并在一段时间后关闭播放器。

---

## 4. 开机启动项配置  

### 4.1 配置文件路径  
- `.config/autostart/chromium.desktop`

### 4.2 配置文件内容  
```sh
[Desktop Entry]
Type=Application
Name=Chromium
Exec=/opt/loading/loading.sh
Icon=chromium
Comment=Auto-start Chromium Browser
```

---

## 5. 脚本实现  

### 5.1 脚本路径  
- `/opt/loading/loading.sh`

### 5.2 原始脚本  
```sh
#!/bin/bash

# 输出日志文件用于调试
#exec > /opt/loading/1.log 2>&1
#echo "脚本开始于 $(date)"

# 设置环境变量
export DISPLAY=:0
export XAUTHORITY=/root/.Xauthority

# 使用mpv播放动态GIF
mpv --loop=inf --fs --no-audio --ontop --profile=sw-fast \
--video-unscaled=yes \
/opt/loading/app-loading.gif &
ANIMATION_PID=$!

# 启动指定软件
chromium-browser --start-maximized --no-sandbox --kiosk &

# 等待40秒后关闭动画
sleep 40

# 关闭mpv播放器
kill $ANIMATION_PID
```

### 5.3 改进脚本
浏览器窗口一旦启动，则直接关闭动画

需要xdotool工具的支持
sudo apt-get install xdotool

```sh
#!/bin/bash

export DISPLAY=:0
export XAUTHORITY=/root/.Xauthority

# 启动动画并创建新的进程组
setsid mpv --loop=inf --fs --no-audio --ontop --profile=sw-fast \
    --video-unscaled=yes \
    /opt/loading/app-loading.gif &
ANIMATION_PID=$!

# 启动浏览器
chromium-browser "https://www.baidu.com" --start-maximized --no-sandbox --kiosk &

# 等待浏览器窗口出现，最多等待40秒防止无限循环
TIMEOUT=40
while (( TIMEOUT-- > 0 )); do
    if xdotool search --onlyvisible --class "chromium" >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 终止动画进程组
if kill -TERM -- -$ANIMATION_PID 2>/dev/null; then
    wait $ANIMATION_PID 2>/dev/null  # 等待进程结束
else
    kill -9 -- -$ANIMATION_PID 2>/dev/null  # 强制终止
fi

exit 0
```

---

## 6. 备注 

### 6.1 透明通道问题  
- 使用 `mpv` 播放GIF时，透明通道可能会被填充为白色，导致与黑色背景不搭配。  
- 下面这个命令可以显示透明通道，但是实际效果上，透明通道会显示为白灰网格
```sh
mpv --loop=inf --fs --no-audio --ontop --profile=sw-fast \
--vo=opengl --opengl-backend=x11 --background=0.0 \
--video-unscaled=yes \
./app-loading.gif &
```

- 通过图像编辑工具（如Photoshop）将GIF的透明背景替换为黑色背景：  
  1. 选择GIF的第一个图层。  
  2. 上方工具栏，图层-新建图层，新建一个图层并置于第一个图层
  3. 上方工具栏，图层-背景图层，将新建图层设置为背景图层。  
  4. 导出时选择“存储为Web所用格式(旧版)”，弹出的菜单中选择存储。

## 7. 效果
实测动态logo可以覆盖一段时间的黑屏，但是不能完全覆盖，原因是刚开始桌面相关内容还未启动，脚本在较后的位置启动。
