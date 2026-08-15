---
title: "Linux 上的免费VNC客户端推荐"
date: 2025-02-25
last_modified_at: 2025-02-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-上的免费vnc客户端推荐/
toc: true
---

以下是几个 **免费、开源、兼容性好** 的 VNC 客户端推荐：


### **1. TigerVNC Viewer（推荐 ✅）**（实测可用）
**TigerVNC** 是一个高性能的 VNC 客户端，兼容性极佳，支持多种 VNC 服务器（包括 x11vnc）。  
它支持 **TLS 加密**，并提供较好的图像渲染和流畅度。

#### **安装方法**
- **Ubuntu/Debian**
  ```bash
  sudo apt update
  sudo apt install tigervnc-viewer
  ```

#### **使用方法**
运行：
```bash
vncviewer <远程主机IP>:5900
```
例如：
```bash
vncviewer 192.168.1.100:5900
```
如果 x11vnc 设置了密码，系统会提示你输入。

---

### **2. RealVNC Viewer**
**RealVNC Viewer** 是 **RealVNC** 官方的 VNC 客户端，免费版本可以用于基本的 VNC 连接。  
它支持 **自动检测 VNC 服务器**，并且兼容 x11vnc，但部分高级加密功能可能需要付费版本。

#### **安装方法**
- **下载官方 Linux 版本**（AppImage 免安装）
  ```bash
  wget https://www.realvnc.com/download/file/viewer.files/VNC-Viewer-*.AppImage
  chmod +x VNC-Viewer-*.AppImage
  ./VNC-Viewer-*.AppImage
  ```

#### **使用方法**
启动 GUI 界面后，输入：
```
192.168.1.100:5900
```
然后点击 **连接**。

---

### **3. Remmina（适用于 GNOME，支持多协议）**
**Remmina** 是一款支持 **VNC、RDP、SSH** 等多种远程连接协议的客户端，适用于 GNOME 桌面环境。  
如果同时需要远程 Windows（RDP）和 Linux（VNC），Remmina 是一个不错的选择。

#### **安装方法**
- **Ubuntu/Debian**
  ```bash
  sudo apt update
  sudo apt install remmina remmina-plugin-vnc
  ```
- **Arch Linux**
  ```bash
  sudo pacman -S remmina
  ```

#### **使用方法**
1. 运行 `remmina`
2. 添加一个新连接，选择 **VNC** 作为协议
3. 输入远程主机 IP（如 `192.168.1.100:5900`）
4. 点击 **连接**

---

### **4. TightVNC Viewer**
**TightVNC** 也是一个轻量级的 VNC 客户端，适用于低带宽环境。  
不过，它的 Linux 版本较老，推荐优先使用 **TigerVNC** 或 **RealVNC Viewer**。

#### **安装方法**
- **Ubuntu/Debian**
  ```bash
  sudo apt update
  sudo apt install xtightvncviewer
  ```
- **使用命令**
  ```bash
  xtightvncviewer 192.168.1.100:5900
  ```

---

### **推荐选择**
| 客户端 | 兼容性 | 性能 | 适用场景 |
|--------|--------|--------|--------|
| **TigerVNC Viewer** ✅ | **优秀** | **高** | **推荐，最佳选择** |
| **RealVNC Viewer** ✅ | **优秀** | **高** | 需要 GUI 界面，支持自动检测 |
| **Remmina** ✅ | **优秀** | **中等** | 适合 GNOME，支持多协议（RDP/VNC/SSH） |
| **TightVNC Viewer** ❌ | **一般** | **较低** | 老旧，优先考虑 TigerVNC |
