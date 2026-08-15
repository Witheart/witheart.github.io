---
title: "Ubuntu Gnome 禁用自动更新"
date: 2026-07-13
last_modified_at: 2026-07-13
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-gnome-禁用自动更新/
toc: true
---

## 修改历史

| 时间   | 历史                                              |
| ------ | ------------------------------------------------- |
| 250625 | 创建了本文                                        |
| 260713 | 增加了禁止大版本升级提示，对3类更新内容进行了分类 |

## 一、 拦截“跨大版本升级”（如 20.04 升级 22.04）

此类方法仅针对操作系统大版本的迭代，从根本上杜绝图形界面弹出大版本升级提示，不影响系统日常的软件库更新。

### 1. 方法一：修改配置文件（最标准规范）

告诉系统的更新管理器，永远不要检查新发行版。

```bash
sudo sed -i 's/^Prompt=.*/Prompt=never/' /etc/update-manager/release-upgrades

```

### 2. 方法二：卸载版本升级器（暴力有效）

直接删除负责检测和执行跨版本升级的底层组件和图形化弹窗程序。

```bash
sudo apt remove ubuntu-release-upgrader-core ubuntu-release-upgrader-gtk

```

---

## 二、 冻结“日常自动更新”（冻结开发环境）

此类方法旨在彻底干掉系统在后台默默拉取包列表、下载更新或安装安全补丁的行为。这对于保持环境绝对稳定至关重要。

### **方法 1：通过图形界面禁用（推荐）**

1. 打开 **软件和更新**：

- 在应用菜单中搜索 `Software & Updates` 或 `软件和更新`。

2. 切换到 **更新** 选项卡：

- 将 **自动检查更新** 设置为 `从不`。（对应常规 APT 更新）
- 将 **当有安全更新时** 设置为 `不自动安装`。（对应安全补丁更新）

3. 点击 **关闭** 保存设置。

> **说明：** 这里的配置实际上就是修改了 `/etc/apt/apt.conf.d/20auto-upgrades`

### **方法 2：通过命令行禁用（适用于服务器/桌面）**

常规软件更新任务（APT）与无人值守安全补丁（unattended-upgrades）属于不同的系统服务，为了彻底冻结环境，需要分别将它们关闭，最后再统一修改 APT 配置文件。

#### **分类 1：禁用安全更新服务 (unattended-upgrades)**

该服务专门负责在后台自动下载并安装高危安全漏洞补丁。

```bash
# 停止并禁用 unattended-upgrades 服务
sudo systemctl stop unattended-upgrades
sudo systemctl disable unattended-upgrades

```

#### **分类 2：禁用 APT 定时更新任务 (apt-daily)**

这些定时器负责在后台定期执行 `apt update`（拉取软件列表）和下载可用更新。

```bash
# 禁用 APT 定时任务
sudo systemctl mask apt-daily.service apt-daily-upgrade.service
sudo systemctl mask apt-daily.timer apt-daily-upgrade.timer

```

#### **分类 3：修改 APT 配置**

从包管理底层彻底关闭自动化行为。编辑配置文件：

```bash
sudo nano /etc/apt/apt.conf.d/20auto-upgrades

```

修改为以下内容（确保值为 `"0"`）：

```conf
APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Unattended-Upgrade "0";
APT::Periodic::Download-Upgradeable-Packages "0";

```

---

## 三、 关闭“其他特定更新与提示”

针对 APT 包管理器之外的独立更新机制或终端文字提示。

### 1. 禁用 Snap 自动更新（如使用 Snap 包）

Snap 有自己独立的强制更新机制，不受 APT 配置影响。

```bash
sudo snap set system refresh.hold="2030-01-01T00:00:00Z"  # 设置一个未来的更新时间

```

### 2. 关闭终端 (SSH/TTY) 登录时的欢迎提示（可选）

关闭每次通过终端登录系统时打印的 "New release available" 或系统新闻提示：

```bash
# 禁用动态新闻 (motd-news)
sudo sed -i 's/ENABLED=1/ENABLED=0/' /etc/default/motd-news

# 取消新版本提示脚本的执行权限
sudo chmod -x /etc/update-motd.d/91-release-upgrade

```
