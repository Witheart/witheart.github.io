---
title: "Ubuntu 部署firefox"
date: 2026-05-26
last_modified_at: 2026-05-26
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-部署firefox/
toc: true
---

Firefox 官网 **"Download for Linux ARM64"** 会下载 **`firefox-*.tar.bz2`** 预编译 tarball，不需要编译，解包就能用。
https://www.firefox.com/en-US/download/linux/


## 1 解压 + 安装到 `/opt`

```bash
cd ~

# 解压（这会解出一个名为 firefox 的文件夹）
tar xvf firefox-151.0.1.tar.xz

# 移到系统应用目录
sudo mv firefox /opt/firefox

# 建软链接，让命令行直接敲 firefox 就能启动
sudo ln -sf /opt/firefox/firefox /usr/local/bin/firefox
```

验证一下：

```bash
firefox --version
```

看到版本号就说明二进制本身能跑。


## 2 加个桌面启动图标

```bash
sudo vim /usr/local/share/applications/firefox.desktop
```

填进去：

```ini
[Desktop Entry]
Version=1.0
Name=Firefox
GenericName=Web Browser
Exec=/opt/firefox/firefox %u
Icon=/opt/firefox/browser/chrome/icons/default/default128.png
Terminal=false
Type=Application
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;
```

保存后：

```bash
sudo update-desktop-database
```
