---
title: "Gnome 壁纸配置为用户界面不可删除（解决自定义壁纸有叉x的问题）"
date: 2026-07-27
last_modified_at: 2026-07-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gnome-壁纸配置为用户界面不可删除-解决自定义壁纸有叉x的问题/
toc: true
---

## 问题描述

壁纸手动添加到系统中，权限为`-rw-r--r-- 1 root root`，但是在 Gnome 的壁纸设置中，该壁纸有一个×，点击就会消失，壁纸变为黑色，但是壁纸本身不会从目录中消失。

## 解决方式

那个“×”其实根本不是用来删除硬盘里的真实文件的，它只是在 GNOME 桌面的“配置记录”里把这张壁纸的**显示引用**给移除了。因为点掉之后，系统不知道该显示什么壁纸了，所以桌面直接变黑；但因为没有触发文件删除操作（普通用户也没有权限），所以文件本身还在那个目录里。

在 GNOME 桌面的逻辑里，壁纸分两种：

1. **系统自带壁纸**：注册在系统级的 XML 配置文件里，这种壁纸在设置里**没有“×”**，不能通过图形界面移除。
2. **用户自定义壁纸**：通过设置界面手动添加进去的，GNOME 会给它加上一个“×”，方便用户随时取消。

要想让的壁纸，以 `greybird.svg` 为例，彻底让那个“×”消失，谁都点不掉，只需要在系统里给它注册一下就行。

**第一步：创建一个壁纸配置文件**
GNOME 读取壁纸配置的路径在 `/usr/share/gnome-background-properties/`。可以直接在这个目录里建一个新的 XML 文件（比如叫 `custom-wallpaper.xml`）。

打开终端运行：

```bash
sudo vim /usr/share/gnome-background-properties/custom-wallpaper.xml

```

**第二步：填入壁纸信息**
把下面这段内容直接复制粘贴进去：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
<wallpapers>
  <wallpaper deleted="false">
    <name>My Greybird</name>
    <filename>/usr/share/backgrounds/greybird.svg</filename>
    <options>zoom</options>
    <pcolor>#000000</pcolor>
    <scolor>#000000</scolor>
    <shade_type>solid</shade_type>
  </wallpaper>
</wallpapers>

```

**第三步：重新打开设置**
搞定保存后，直接关掉并重新打开 GNOME 的“设置 -> 背景”。

这时候会发现，`greybird.svg` 这张壁纸已经堂堂正正地和 Ubuntu 默认的那堆壁纸排在一起了，那个“×”也彻底消失了！这样不管是桌面用户还是谁，在图形界面上都没法把它“点黑”了。
