---
title: "hp-setup hplip 报错 QtGui.cpython-38-aarch64-linux-gnu.so"
date: 2025-07-19
last_modified_at: 2025-07-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/hp-setup-hplip-报错-qtgui-cpython-38-aarch64-linux-gnu-so/
toc: true
---

## 问题背景
运行hp-setup时，报错
```bash
error: /usr/lib/python3/dist-packages/PyQt5/QtGui.cpython-38-aarch64-linux-gnu.so: undefined symbol: _ZTI18QOpenGLTimeMonitor, version Qt_5
```
也就是`QtGui.cpython-38-aarch64-linux-gnu.so`加载时，试图调用Qt库中的符号`_ZTI18QOpenGLTimeMonitor`，但是没有找到这个符号。

系统下没有安装qt库，安装后在其目录下寻找符号，应该能找到。
如果qt库安装在/usr/lib/qt5/，则在该位置寻找
```bash
sudo grep -r "_ZTI18QOpenGLTimeMonitor" /usr/lib/qt5
```

我的qt库安装在/opt/Qt5.15.2，于是
```bash
KangHua@user:~$ sudo grep -r "_ZTI18QOpenGLTimeMonitor" /opt
匹配到二进制文件 /opt/Qt5.15.2/lib/libQt5Gui.so.5.15.2
```

尝试导出到变量
```bash
export LD_LIBRARY_PATH=/opt/Qt5.15.2/lib:$LD_LIBRARY_PATH
```
报错消失，产生了新的报错
```bash
arm_release_ver:g13p0-01eac0, rk_so_ver: 10
Cannot find EGLConfig, returning null config
Unable to find an Xil visual which matches EGL config 0
segment fault
```

这个报错一般是动态链接库找不到`/usr/lib/aarch64-linux-gnu`导致的，尝试导出
```bash
export LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH
```

结果报错又变成了
```bash
error: /usr/lib/python3/dist-packages/PyQt5/QtGui.cpython-38-aarch64-linux-gnu.so: undefined symbol: _ZTI18QOpenGLTimeMonitor, version Qt_5
```

查看LD_LIBRARY_PATH的值，发现是对的
```bash
KangHua@user:~$ echo $LD_LIBRARY_PATH 
/usr/lib/aarch64-linux-gnu:/opt/Qt5.15.2/lib:
```

可能和加载顺序有关，于是清除LD_LIBRARY_PATH
```bash
unset LD_LIBRARY_PATH
```

然后先执行
```bash
export LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH
```
再执行
```bash
export LD_LIBRARY_PATH=/opt/Qt5.15.2/lib:$LD_LIBRARY_PATH
```
程序成功运行！查看此时的LD_LIBRARY_PATH
```bash
echo $LD_LIBRARY_PATH 
/opt/Qt5.15.2/lib:/usr/lib/aarch64-linux-gnu:
```
确认问题和加载的顺序有关系。

## 尝试解决
其实最简单的解决方式就是在.bashrc中手动去加载两个路径到LD_LIBRARY_PATH
```bash
export LD_LIBRARY_PATH=/opt/Qt5.15.2/lib:/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH
```

但是为了同一管理，动态链接库路径最好是放在/etc/ld.so.conf.d/这个目录的文件下，不过我在这个这些文件下尝试了去控制加载顺序，比如修改文件名等等，没有生效，hp-setup的运行会报错，最终还是直接在.bashrc中增加环境变量。
