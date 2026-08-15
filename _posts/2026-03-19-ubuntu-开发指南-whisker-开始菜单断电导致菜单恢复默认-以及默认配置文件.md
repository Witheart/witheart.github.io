---
title: "Whisker 开始菜单断电导致菜单恢复默认 以及默认配置文件"
date: 2026-03-19
last_modified_at: 2026-03-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/whisker-开始菜单断电导致菜单恢复默认-以及默认配置文件/
toc: true
---

## 问题背景
客诉特定操作后，Whisker菜单自定义的图标会恢复成默认，同时下面一排的关机按键消失。

特定操作如下：
开机 -> 点击Whisker菜单 -> 点击帮助应用 -> 弹出未选中默认程序的提示，关闭 -> 直接断电 -> 重新上电


## 问题分析
推测直接断电损坏了Whisker的配置文件，Whisker以默认模板自动重建了配置文件。

## 解决方式
- `/etc/xdg/xdg-xubuntu/xfce4/whiskermenu/defaults.rc`
`/etc/xdg/xdg-xubuntu/xfce4/panel/whiskermenu-1.rc`
配置为`~/.config/xfce4/panel/whiskermenu-1.rc`内容，其中注意，图标需要改为绝对路径

- 编辑`/etc/xdg/xdg-xubuntu/xfce4/xfconf/xfce-perchannel-xml/xfce4-panel.xml`，修改图标路径为`/usr/share/pixmaps/xubuntu-logo.svg`

## 原理分析
- ~/.config/xfce4/panel/whiskermenu-1.rc是用户自定义的Whisker菜单配置文件，这里的1表示第一个Whisker菜单，可以有多个菜单。这个配置文件会覆盖全局的/etc/xdg/xdg-xubuntu/xfce4/panel/whiskermenu-1.rc配置。

- 如果直接删除 ~/.config/xfce4/panel/whiskermenu-1.rc，将会使用/etc/xdg/xdg-xubuntu/xfce4/panel/whiskermenu-1.rc作为代替
- 如果只是因为断电损坏了 ~/.config/xfce4/panel/whiskermenu-1.rc，那么将会自动重建该文件，重建的模板与/etc/xdg/xdg-xubuntu/xfce4/whiskermenu/defaults.rc 和 /etc/xdg/xdg-xubuntu/xfce4/panel/whiskermenu-1.rc 有关系（但具体和哪一个有关不得而知）
