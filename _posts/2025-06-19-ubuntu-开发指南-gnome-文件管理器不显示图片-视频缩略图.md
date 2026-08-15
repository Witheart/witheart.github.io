---
title: "gnome 文件管理器不显示图片、视频缩略图"
date: 2025-06-19
last_modified_at: 2025-06-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gnome-文件管理器不显示图片-视频缩略图/
toc: true
---

## 问题分析
一般是五个问题：
1. 视图问题
2. 文件大小和位置问题
3. 缩略图缓存问题
4. 缩略图工具问题
5. 编解码器问题

文件管理器中的缩略图不显示时，将会是一个紫色的图标，如下
![alt text](<2025-06-19 11-16-13 的屏幕截图.png>)

**应用解决方式后记得重启！！！**

## 视图问题
如果是列表显示，那么缩略图都是不显示的，需要切换视图
![alt text](/assets/images/ubuntu-开发指南/gnome-文件管理器不显示图片-视频缩略图/PixPin_2025-06-19_11-21-26.png)


## 文件大小和位置问题
Gnome的文件管理器是Nautilus，Nautilus默认只显示10MB以内文件的缩略图，且只显示内置硬盘的缩略图，如果缩略图不显示，可能要调整此处的设置
- 打开首选项
![alt text](/assets/images/ubuntu-开发指南/gnome-文件管理器不显示图片-视频缩略图/PixPin_2025-06-19_11-27-27.png)

- 调整此处的内容
![alt text](/assets/images/ubuntu-开发指南/gnome-文件管理器不显示图片-视频缩略图/PixPin_2025-06-19_11-27-59.png)

## 缩略图缓存问题
如果之前的缩略图生成失败，可能会留下失败的缓存，需要清理
```sh
rm -rf ~/.cache/thumbnails/*  # 删除用户级缓存
sudo rm -rf /var/cache/thumbnails/*  # 删除系统级缓存 (可能需要)
rm ~/.cache/gdk-pixbuf-* ~/.cache/gnome-thumbnail-*  # 清除图形缓存
```

## 缩略图工具问题
```sh
sudo apt update
```

```sh
sudo apt install ffmpegthumbnailer gstreamer1.0-libav librsvg2-common
sudo apt install libgdk-pixbuf2.0-dev libjpeg-dev libpng-dev libtiff-dev
sudo apt install webp-pixbuf-loader libopenjp2-tools libheif-gdk-pixbuf
```

- 下面这个解决了我的问题
```sh
sudo apt install --reinstall libgdk-pixbuf2.0-0 libgdk-pixbuf2.0-bin
sudo gdk-pixbuf-query-loaders --update-cache
```

- ​​检查支持的图像格式
```sh
gdk-pixbuf-query-loaders | grep -E 'jpe?g|png|gif|webp|heif|svg'
```
正常应显示类似：
```sh
"jpeg" "jpe" "jpg" "image/jpeg"
"png" "image/png"
"svg" "image/svg+xml"
```

## 编解码器问题
