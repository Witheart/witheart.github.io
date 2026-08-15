---
title: "XFCE 开机后一直自动打开软件或者目录的问题 —— 自动保存会话"
date: 2026-06-16
last_modified_at: 2026-06-16
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-开机后一直自动打开软件或者目录的问题-自动保存会话/
toc: true
---

## 1 问题描述
XFCE开机后，会自动打开某个目录，关闭该目录后，重启，仍然会打开相同的目录。

## 2 解决方式
Xfce 环境下开机自动打开 Thunar 的某个特定目录，大概率是由于 **Xfce 的会话管理机制（Session Management）** 导致的。

Xfce 默认具有“记住上次注销时打开的应用程序”的功能。如果你在某次关机或重启时，正好打开着那个 Thunar 目录，Xfce 就会把这个状态保存下来，并在下次开机时强行恢复它。

1. 打开 Xfce 的 **设置管理器（Settings Manager）**。
2. 找到并点击 **会话和启动（Session and Startup）**。
3. 切换到 **已保存的会话（Saved Sessions）** 选项卡。
4. 点击底部的 **清除已保存的会话（Clear Saved Sessions）** 按钮。

---

## 3 预防措施
### 3.1 关闭“自动保存会话”功能

为了防止以后再次发生类似的情况，建议关闭 Xfce 的自动保存会话功能，让系统每次开机都保持干净的初始状态。

1. 同样进入 **会话和启动（Session and Startup）**。
2. 切换到 **常规（General）** 选项卡。
3. 找到 **注销时自动保存会话（Automatically save session on logout）**，确保将其 **取消勾选**。

---

### 3.2 注销时，取消勾选保存会话
![alt text](dfe4f4cf961318fb5accff258de06750_origin(1).jpg)
