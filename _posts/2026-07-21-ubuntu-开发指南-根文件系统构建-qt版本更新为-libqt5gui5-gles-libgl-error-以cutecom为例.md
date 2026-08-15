---
title: "根文件系统构建 —— Qt版本更新为 libqt5gui5-gles（libGL error）（以cutecom为例）"
date: 2026-07-21
last_modified_at: 2026-07-21
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/根文件系统构建-qt版本更新为-libqt5gui5-gles-libgl-error-以cutecom为例/
toc: true
---

## 问题
使用命令行在桌面下启动cutecom时，有如下的报错：
```bash
setting current session to:  "Default"
MainWindow::MainWindow(QWidget*, const QString&) calculated height:  31
libGL error: MESA-LOADER: failed to open rockchip: /usr/lib/dri/rockchip_dri.so: cannot open shared object file: No such file or directory (search paths /usr/lib/aarch64-linux-gnu/dri:\$${ORIGIN}/dri:/usr/lib/dri, suffix _dri)
libGL error: failed to load driver: rockchip
libGL error: MESA-LOADER: failed to open rockchip: /usr/lib/dri/rockchip_dri.so: cannot open shared object file: No such file or directory (search paths /usr/lib/aarch64-linux-gnu/dri:\$${ORIGIN}/dri:/usr/lib/dri, suffix _dri)
libGL error: failed to load driver: rockchip
```

或者
```bash
setting current session to:  "Default"
MainWindow::MainWindow(QWidget*, const QString&) calculated height:  31
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip 
```

## 解决方式
- cutecom报上述错误的原因是，cutecom使用了Qt，从ubuntu-base构建的根文件系统默认的Qt GUI核心包是libqt5gui5，这个包默认会使用libGL.so.1、libGLX.so.0、libGLdispatch.so.0等库
- 对于RK3588来说，只支持OpenGL ES，如果使用libqt5gui5，找不到上述的库，自然就会报错，所以libqt5gui5需要替换为libqt5gui5-gles，libqt5gui5-gles只会调用libmali.so

```bash
sudo apt install libqt5gui5-gles
```

## 解决过程
报找不到/usr/lib/dri/rockchip_dri.so错误时，使用
```bash
sudo apt install --reinstall libgl1-mesa-dri
```
就会安装配置/usr/lib/dri/rockchip_dri.so，但随后报其他错误：
```bash
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
```

使用ldd /usr/bin/cutecom，与正常系统对比，如下

### 正常系统
```bash
user@user:~$ ldd /usr/bin/cutecom
        linux-vdso.so.1 (0x0000007faed95000)
        libQt5Widgets.so.5 => /lib/aarch64-linux-gnu/libQt5Widgets.so.5 (0x0000007fae66b000)
        libQt5SerialPort.so.5 => /lib/aarch64-linux-gnu/libQt5SerialPort.so.5 (0x0000007fae642000)
        libQt5Gui.so.5 => /lib/aarch64-linux-gnu/libQt5Gui.so.5 (0x0000007fae0d6000)
        libQt5Core.so.5 => /lib/aarch64-linux-gnu/libQt5Core.so.5 (0x0000007fadba8000)
        libstdc++.so.6 => /lib/aarch64-linux-gnu/libstdc++.so.6 (0x0000007fad9c3000)
        libgcc_s.so.1 => /lib/aarch64-linux-gnu/libgcc_s.so.1 (0x0000007fad99f000)
        libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000007fad82c000)
        /lib/ld-linux-aarch64.so.1 (0x0000007faed65000)
        libm.so.6 => /lib/aarch64-linux-gnu/libm.so.6 (0x0000007fad781000)
        libpthread.so.0 => /lib/aarch64-linux-gnu/libpthread.so.0 (0x0000007fad750000)
        libudev.so.1 => /lib/aarch64-linux-gnu/libudev.so.1 (0x0000007fad716000)
        /lib/aarch64-linux-gnu/libmali.so (0x0000007fa6d93000)
        libpng16.so.16 => /lib/aarch64-linux-gnu/libpng16.so.16 (0x0000007fa6d4f000)
        libz.so.1 => /lib/aarch64-linux-gnu/libz.so.1 (0x0000007fa6d25000)
        libharfbuzz.so.0 => /lib/aarch64-linux-gnu/libharfbuzz.so.0 (0x0000007fa6c27000)
        libicui18n.so.66 => /lib/aarch64-linux-gnu/libicui18n.so.66 (0x0000007fa6937000)
        libicuuc.so.66 => /lib/aarch64-linux-gnu/libicuuc.so.66 (0x0000007fa674a000)
        libdl.so.2 => /lib/aarch64-linux-gnu/libdl.so.2 (0x0000007fa6736000)
        libpcre2-16.so.0 => /lib/aarch64-linux-gnu/libpcre2-16.so.0 (0x0000007fa66b2000)
        libdouble-conversion.so.3 => /lib/aarch64-linux-gnu/libdouble-conversion.so.3 (0x0000007fa668f000)
        libglib-2.0.so.0 => /lib/aarch64-linux-gnu/libglib-2.0.so.0 (0x0000007fa6554000)
        libX11.so.6 => /lib/aarch64-linux-gnu/libX11.so.6 (0x0000007fa640f000)
        libX11-xcb.so.1 => /lib/aarch64-linux-gnu/libX11-xcb.so.1 (0x0000007fa63fd000)
        libxcb.so.1 => /lib/aarch64-linux-gnu/libxcb.so.1 (0x0000007fa63c6000)
        libxcb-dri2.so.0 => /lib/aarch64-linux-gnu/libxcb-dri2.so.0 (0x0000007fa63b1000)
        libdrm.so.2 => /lib/aarch64-linux-gnu/libdrm.so.2 (0x0000007fa638f000)
        libfreetype.so.6 => /lib/aarch64-linux-gnu/libfreetype.so.6 (0x0000007fa62d0000)
        libgraphite2.so.3 => /lib/aarch64-linux-gnu/libgraphite2.so.3 (0x0000007fa629e000)
        libicudata.so.66 => /lib/aarch64-linux-gnu/libicudata.so.66 (0x0000007fa47cf000)
        libpcre.so.3 => /lib/aarch64-linux-gnu/libpcre.so.3 (0x0000007fa475d000)
        libXau.so.6 => /lib/aarch64-linux-gnu/libXau.so.6 (0x0000007fa4749000)
        libXdmcp.so.6 => /lib/aarch64-linux-gnu/libXdmcp.so.6 (0x0000007fa4733000)
        libbsd.so.0 => /lib/aarch64-linux-gnu/libbsd.so.0 (0x0000007fa470c000)
```

### 异常系统
```bash
user@user:~$ ldd /usr/bin/cutecom
        linux-vdso.so.1 (0x0000007fae364000)
        libQt5Widgets.so.5 => /lib/aarch64-linux-gnu/libQt5Widgets.so.5 (0x0000007fadc45000)
        libQt5SerialPort.so.5 => /lib/aarch64-linux-gnu/libQt5SerialPort.so.5 (0x0000007fadc1c000)
        libQt5Gui.so.5 => /lib/aarch64-linux-gnu/libQt5Gui.so.5 (0x0000007fad68e000)
        libQt5Core.so.5 => /lib/aarch64-linux-gnu/libQt5Core.so.5 (0x0000007fad15f000)
        libstdc++.so.6 => /lib/aarch64-linux-gnu/libstdc++.so.6 (0x0000007facf7a000)
        libgcc_s.so.1 => /lib/aarch64-linux-gnu/libgcc_s.so.1 (0x0000007facf56000)
        libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000007facde3000)
        /lib/ld-linux-aarch64.so.1 (0x0000007fae334000)
        libm.so.6 => /lib/aarch64-linux-gnu/libm.so.6 (0x0000007facd38000)
        libpthread.so.0 => /lib/aarch64-linux-gnu/libpthread.so.0 (0x0000007facd07000)
        libudev.so.1 => /lib/aarch64-linux-gnu/libudev.so.1 (0x0000007facccd000)
        libGL.so.1 => /lib/aarch64-linux-gnu/libGL.so.1 (0x0000007facbd6000)
        libpng16.so.16 => /lib/aarch64-linux-gnu/libpng16.so.16 (0x0000007facb92000)
        libz.so.1 => /lib/aarch64-linux-gnu/libz.so.1 (0x0000007facb68000)
        libharfbuzz.so.0 => /lib/aarch64-linux-gnu/libharfbuzz.so.0 (0x0000007faca6a000)
        libicui18n.so.66 => /lib/aarch64-linux-gnu/libicui18n.so.66 (0x0000007fac77a000)
        libicuuc.so.66 => /lib/aarch64-linux-gnu/libicuuc.so.66 (0x0000007fac58d000)
        libdl.so.2 => /lib/aarch64-linux-gnu/libdl.so.2 (0x0000007fac579000)
        libpcre2-16.so.0 => /lib/aarch64-linux-gnu/libpcre2-16.so.0 (0x0000007fac4f5000)
        libdouble-conversion.so.3 => /lib/aarch64-linux-gnu/libdouble-conversion.so.3 (0x0000007fac4d2000)
        libglib-2.0.so.0 => /lib/aarch64-linux-gnu/libglib-2.0.so.0 (0x0000007fac397000)
        libGLdispatch.so.0 => /lib/aarch64-linux-gnu/libGLdispatch.so.0 (0x0000007fac20c000)
        libGLX.so.0 => /lib/aarch64-linux-gnu/libGLX.so.0 (0x0000007fac1ca000)
        libfreetype.so.6 => /lib/aarch64-linux-gnu/libfreetype.so.6 (0x0000007fac10b000)
        libgraphite2.so.3 => /lib/aarch64-linux-gnu/libgraphite2.so.3 (0x0000007fac0d9000)
        libicudata.so.66 => /lib/aarch64-linux-gnu/libicudata.so.66 (0x0000007faa60a000)
        libpcre.so.3 => /lib/aarch64-linux-gnu/libpcre.so.3 (0x0000007faa598000)
        libX11.so.6 => /lib/aarch64-linux-gnu/libX11.so.6 (0x0000007faa453000)
        libxcb.so.1 => /lib/aarch64-linux-gnu/libxcb.so.1 (0x0000007faa41c000)
        libXau.so.6 => /lib/aarch64-linux-gnu/libXau.so.6 (0x0000007faa408000)
        libXdmcp.so.6 => /lib/aarch64-linux-gnu/libXdmcp.so.6 (0x0000007faa3f2000)
        libbsd.so.0 => /lib/aarch64-linux-gnu/libbsd.so.0 (0x0000007faa3cb000)
```

### 分析
正常系统直接加载了 /lib/aarch64-linux-gnu/libmali.so，而异常系统加载了 libGL.so.1、libGLX.so.0、libGLdispatch.so.0。这是标准 Linux 桌面级的 OpenGL 和 GLVND 调度器。一旦拉起这条线，就会去唤醒 Mesa，进而触发加载 rockchip_dri.so 失败的报错。

Ubuntu 官方的 ARM 仓库里，Qt 的 GUI 核心包其实有两个截然不同的分支版本：
- libqt5gui5(异常系统)：默认版本，基于纯正的桌面 GLX/OpenGL 编译。它只要一运行，就一定会去调用 libGL.so.1 探路。
- libqt5gui5-gles (正常系统)：专门为嵌入式 ARM 开发板准备的分支版本，基于纯正的 OpenGL ES (EGL/GLES) 编译。它从基因里就砍掉了对 libGL.so.1 和 GLX 的依赖，图形请求直接通过 EGL 交给底层的 Mali 闭源硬件加速库。
