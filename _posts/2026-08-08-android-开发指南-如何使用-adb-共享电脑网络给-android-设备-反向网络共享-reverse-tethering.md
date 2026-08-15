---
title: "如何使用 ADB 共享电脑网络给 Android 设备（反向网络共享 / Reverse Tethering）"
date: 2026-08-08
last_modified_at: 2026-08-08
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/如何使用-adb-共享电脑网络给-android-设备-反向网络共享-reverse-tethering/
toc: true
---

## 参考

- [gnirehtet GitHub 仓库](https://github.com/Genymobile/gnirehtet)
- [gnirehtet 原理说明 (Genymobile Blog)](https://medium.com/genymobile/gnirehtet-reverse-tethering-android-2afacdbdaec7)


## 一、什么是反向网络共享（Reverse Tethering）

通常情况下，"网络共享"是指**手机开热点给电脑用**。反向网络共享（Reverse Tethering）正好反过来——**电脑通过 USB 数据线把自己的网络共享给 Android 设备**。

---

## 二、方案对比

| 方案                      | 实现方式                | 需要 Root    | 复杂度      | 推荐度       |
| ------------------------- | ----------------------- | ------------ | ----------- | ------------ |
| **gnirehtet**             | ADB + VPN               | ❌ 不需要    | ⭐ 简单     | ✅ **推荐**  |
| `adb reverse` + HTTP 代理 | ADB 端口转发 + 代理软件 | ❌ 不需要    | ⭐⭐ 中等   | 部分应用可用 |
| USB Ethernet (RNDIS)      | 内核驱动模拟网卡        | 需要内核支持 | ⭐⭐⭐ 复杂 | 系统级支持   |
| iptables NAT (Root)       | Root 后 iptables 转发   | ✅ 需要      | ⭐⭐⭐ 复杂 | 功能最完整   |

> **gnirehtet** 是最简单、最通用的方案，不需要 Root，通过 ADB 隧道 + Android VPN API 实现。

---

## 三、gnirehtet 原理

```
┌─────────────┐        ADB 隧道          ┌──────────────┐
│   电脑端     │ ◄══════════════════════► │ Android 设备  │
│             │    USB / TCP 连接         │              │
│  gnirehtet  │                          │  gnirehtet   │
│  (服务端)   │                          │  (APK客户端)  │
│             │                          │       ↓      │
│  eth0 ← 互联网                         │  VPN 虚拟网卡 │
│             │                          │       ↓      │
│  中转所有    │                          │  所有 App 流量 │
│  网络请求    │                          │  通过此 VPN   │
└─────────────┘                          └──────────────┘
```

**工作流程**：

1. 电脑端 `gnirehtet` 启动后通过 `adb` 推送并启动 Android 端的 `gnirehtet.apk`
2. Android 端自动创建 VPN 接口，所有网络流量走这个 VPN
3. VPN 的流量通过 ADB 隧道转发到电脑端
4. 电脑端接管这些请求，通过自己的网卡（eth0/Wi-Fi）访问互联网，再把响应通过 ADB 隧道返回给 Android

> 本质上是电脑充当了一台 **NAT 网关**，Android 的所有外网请求都经电脑转发。

---

## 四、使用步骤

### 4.1 准备工作

| 步骤 | 操作                                       |
| ---- | ------------------------------------------ |
| ①    | 电脑安装 ADB（`adb` 命令可用）             |
| ②    | USB 数据线连接电脑和 Android 设备          |
| ③    | Android 开启 **开发者选项** → **USB 调试** |
| ④    | 电脑运行 `adb devices` 确认设备已连接      |

```bash
adb devices
# List of devices attached
# ABC123456789    device        ← 确认能看到设备
```

### 4.2 安装 gnirehtet

**下载地址**：<https://github.com/Genymobile/gnirehtet/releases>

**下载文件说明**：

| 平台    | 需要的文件                                     |
| ------- | ---------------------------------------------- |
| Windows | `gnirehtet-win64.zip` 或 `gnirehtet-win32.zip` |
| Linux   | `gnirehtet-linux64.zip`                        |
| macOS   | `gnirehtet-macos.zip`                          |

解压后得到：

```
gnirehtet/
├── gnirehtet.exe      (电脑端服务程序)
├── gnirehtet.apk      (Android 端 APK)
├── gnirehtet-run.cmd  (Windows 一键运行)
└── 其他依赖文件
```

### 4.3 一次性安装与使用

```bash
# 1. 安装 APK 到 Android 设备（只需一次）
adb install gnirehtet.apk

# 2. 在电脑cmd运行 gnirehtet（会自动启动 Android 端 VPN）
gnirehtet.exe run

# 输出示例：
# 2026-08-08 10:00:00 INFO Main: Starting gnirehtet v2.5...
# 2026-08-08 10:00:01 INFO Relay: Connected to device ABC123456789
```

### 4.4 Android 端操作

运行 `gnirehtet.exe run` 后，Android 设备会弹出 VPN 连接请求：

```
"gnirehtet 想要创建 VPN 连接"
       ↗  [取消]    [确定]  ← 点击确定
```

点击 **确定** 后，VPN 建立，网络共享即刻生效。Android 通知栏会出现钥匙/VPN 图标。

### 4.5 停止共享

```bash
# 方式一：按 Ctrl+C 终止电脑端程序

# 方式二：使用 stop 命令
gnirehtet.exe stop

# 方式三：Android 端下拉通知栏，断开 VPN
```
