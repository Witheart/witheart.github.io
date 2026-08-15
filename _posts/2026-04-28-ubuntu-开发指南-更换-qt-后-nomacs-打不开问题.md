---
title: "更换 Qt 后 nomacs 打不开问题"
date: 2026-04-28
last_modified_at: 2026-04-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/更换-qt-后-nomacs-打不开问题/
toc: true
---

- 新建脚本，替换环境变量
```bash
vim /home/KangHua/tool/nomacs-wrapper.sh
```

```bash
#!/bin/bash

# 1. 设置环境变量
export PATH="/opt/Qt5.15.2/bin:$PATH"
export QTDIR=/opt/Qt5.15.2
export LD_LIBRARY_PATH="/opt/Qt5.15.2/lib:/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/opt/Qt5.15.2/lib/pkgconfig:$PKG_CONFIG_PATH"

# 2. 启动程序并传递所有参数
# "$@" 会原封不动地把所有传入脚本的参数（即 %F 代表的文件路径）传给 nomacs
# 使用 exec 可以让 nomacs 进程替换当前的 shell 进程，更省资源
exec /usr/bin/nomacs "$@"
```

```bash
chmod +x /home/KangHua/tool/nomacs-wrapper.sh
```

- 替换启动方式为脚本启动
```bash
vim /usr/share/applications/nomacs.desktop
```

```bash
[Desktop Entry]
Name=nomacs
GenericName=Image Viewer
Comment=nomacs is a free, open source image viewer.
Exec=/home/KangHua/tool/nomacs-wrapper.sh %F
Terminal=false
Icon=nomacs
Type=Application
Categories=Graphics;RasterGraphics;Viewer;2DGraphics;
MimeType=image/gif;image/jpeg;image/png;image/bmp;image/tiff;image/x-eps;image/x-ico;image/x-portable-bitmap;image/x-portable-graymap;image/x-portable-pixmap;image/x-xbitmap;image/x-xpixmap;
GenericName[de]=Bildbetrachter
Comment[de]=Ressourcenschonender, plattformübergreifend verwendbarer Bildbetrachter mit Unterstützung für verschiedenste Formate
Name[pt]=nomacs
GenericName[pt]=Visualizador de imagens
Comment[pt]=Um visualizador de imagens desenvolvido em Qt
```
