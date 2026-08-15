---
title: "XFCE设置默认壁纸——解决新插入显示器壁纸被替换的问题"
date: 2025-07-10
last_modified_at: 2025-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce设置默认壁纸-解决新插入显示器壁纸被替换的问题/
toc: true
---

传统壁纸设置仅作用于当前显示器，新插入的显示器会使用系统默认壁纸。本教程指导如何在XFCE中设置默认壁纸，使新增显示器自动应用指定壁纸。


## xubuntu版本
如果希望修改所有用户的默认壁纸（需管理员权限）：
1. **备份原壁纸**（可选）：
   ```bash
   sudo cp /usr/share/xfce4/backdrops/xubuntu-wallpaper.png /usr/share/xfce4/backdrops/xubuntu-wallpaper.png.bak
   ```
2. **替换文件**：
   - 将你的壁纸文件命名为 `xubuntu-wallpaper.png`（推荐分辨率：1920x1080）。
   - 执行命令替换：
     ```bash
     sudo cp /路径/你的壁纸.png /usr/share/xfce4/backdrops/xubuntu-wallpaper.png
     ```
3. **刷新桌面**：
   - 重启系统或注销重新登录生效。

## xfce版本(非xubuntu发行版)
- 具体的默认壁纸位置没有找到，找到了用户下的配置文件：
```bash
$ cat ~/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml
<?xml version="1.0" encoding="UTF-8"?>

<channel name="xfce4-desktop" version="1.0">
  <property name="backdrop" type="empty">
    <property name="screen0" type="empty">
      <property name="monitorHDMI-1" type="empty">
        <property name="workspace0" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/wallpaper_ch.png"/>
        </property>
        <property name="workspace1" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
        <property name="workspace2" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
        <property name="workspace3" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
      </property>
      <property name="monitorDSI-1" type="empty">
        <property name="workspace0" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
        <property name="workspace1" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
        <property name="workspace2" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
        <property name="workspace3" type="empty">
          <property name="color-style" type="int" value="0"/>
          <property name="image-style" type="int" value="5"/>
          <property name="last-image" type="string" value="/usr/share/backgrounds/xfce/xfce-stripes.png"/>
        </property>
      </property>
    </property>
  </property>
  <property name="last" type="empty">
    <property name="window-width" type="int" value="600"/>
    <property name="window-height" type="int" value="608"/>
  </property>
</channel>

```

- 直接替换掉这个文件`/usr/share/backgrounds/xfce/xfce-stripes.png`
```bash
cp /usr/share/backgrounds/xfce/xfce-stripes.png /usr/share/backgrounds/xfce/xfce-stripes.png.bak

cp <要设置的壁纸路径> /usr/share/backgrounds/xfce/xfce-stripes.png
```
