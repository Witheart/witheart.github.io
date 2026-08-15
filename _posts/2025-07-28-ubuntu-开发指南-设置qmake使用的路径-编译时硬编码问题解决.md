---
title: "设置qmake使用的路径（编译时硬编码问题解决）"
date: 2025-07-28
last_modified_at: 2025-07-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/设置qmake使用的路径-编译时硬编码问题解决/
toc: true
---

## 问题背景
交叉编译qt后，运行qmake --version，发现使用了一个绝对路径的库。
```bash
hw@hw-Default-string:~$ /mnt/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host/bin/qmake --version
QMake version 3.1
Using Qt version 5.12.9 in /home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/lib
```
移植到其他主机后，需要设置使用的库的路径。

## 参考链接
[https://doc.qt.io/archives/qt-5.12/qmake-environment-reference.html](https://doc.qt.io/archives/qt-5.12/qmake-environment-reference.html)
[https://stackoverflow.com/questions/913642/qmake-and-qt-install-prefix-how-can-i-select-a-new-location-for-qt-library](https://stackoverflow.com/questions/913642/qmake-and-qt-install-prefix-how-can-i-select-a-new-location-for-qt-library)
[https://doc.qt.io/archives/qt-5.15/qlibraryinfo.html](https://doc.qt.io/archives/qt-5.15/qlibraryinfo.html)
[https://stackoverflow.com/questions/4699311/how-to-install-qt-on-windows-after-building](https://stackoverflow.com/questions/4699311/how-to-install-qt-on-windows-after-building)
[https://stackoverflow.com/questions/19726473/qt5-build-has-absolute-paths](https://stackoverflow.com/questions/19726473/qt5-build-has-absolute-paths)
[https://blog.csdn.net/u010445505/article/details/47132263](https://blog.csdn.net/u010445505/article/details/47132263)
[https://blog.csdn.net/startarsyx/article/details/12926617](https://blog.csdn.net/startarsyx/article/details/12926617)
[https://www.cnblogs.com/xiaohuidi/p/16422478.html](https://www.cnblogs.com/xiaohuidi/p/16422478.html)

## 验证方式
路径可使用如下的命令查看
```bash
./qmake -query
```

默认的示例输出如下
```bash

hw@hw-Default-string:/mnt/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host/bin$ ./qmake -query
QT_SYSROOT:/home/hw/hdd/rk3568_qt_5129/sysroot
QT_INSTALL_PREFIX:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext
QT_INSTALL_PREFIX/dev:/usr/local/Qt-5.12.9
QT_INSTALL_ARCHDATA:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext
QT_INSTALL_ARCHDATA/dev:/usr/local/Qt-5.12.9
QT_INSTALL_DATA:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext
QT_INSTALL_DATA/dev:/usr/local/Qt-5.12.9
QT_INSTALL_DOCS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/doc
QT_INSTALL_DOCS/dev:/usr/local/Qt-5.12.9/doc
QT_INSTALL_HEADERS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/include
QT_INSTALL_HEADERS/dev:/usr/local/Qt-5.12.9/include
QT_INSTALL_LIBS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/lib
QT_INSTALL_LIBS/dev:/usr/local/Qt-5.12.9/lib
QT_INSTALL_LIBEXECS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/libexec
QT_INSTALL_LIBEXECS/dev:/usr/local/Qt-5.12.9/libexec
QT_INSTALL_BINS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/bin
QT_INSTALL_BINS/dev:/usr/local/Qt-5.12.9/bin
QT_INSTALL_TESTS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/tests
QT_INSTALL_TESTS/dev:/usr/local/Qt-5.12.9/tests
QT_INSTALL_PLUGINS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/plugins
QT_INSTALL_PLUGINS/dev:/usr/local/Qt-5.12.9/plugins
QT_INSTALL_IMPORTS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/imports
QT_INSTALL_IMPORTS/dev:/usr/local/Qt-5.12.9/imports
QT_INSTALL_QML:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/qml
QT_INSTALL_QML/dev:/usr/local/Qt-5.12.9/qml
QT_INSTALL_TRANSLATIONS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/translations
QT_INSTALL_TRANSLATIONS/dev:/usr/local/Qt-5.12.9/translations
QT_INSTALL_CONFIGURATION:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/etc/xdg
QT_INSTALL_CONFIGURATION/dev:/usr/local/Qt-5.12.9/etc/xdg
QT_INSTALL_EXAMPLES:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/examples
QT_INSTALL_EXAMPLES/dev:/usr/local/Qt-5.12.9/examples
QT_INSTALL_DEMOS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext/examples
QT_INSTALL_DEMOS/dev:/usr/local/Qt-5.12.9/examples
QT_HOST_PREFIX:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host
QT_HOST_DATA:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host
QT_HOST_BINS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host/bin
QT_HOST_LIBS:/home/hw/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host/lib
QMAKE_SPEC:linux-g++
QMAKE_XSPEC:devices/linux-rk3568-g++
QMAKE_VERSION:3.1

```
修改后，再执行同样的命令，查看修改是否生效。

总结了两种修改方式，如下
## 方式一：使用qt.conf
- 进入qmake所在目录host/bin/，创建qt.conf文件
- 进行如下配置：
```bash
[Paths]
Prefix = /mnt/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/ext
HostPrefix = /mnt/hdd/rk3568_qt_5129/qt-everywhere-src-5.12.9/host
Sysroot = /tmp
```
根据实际路径更改

- qt.conf可接受的其他参数参考：
[https://doc.qt.io/archives/qt-5.12/qt-conf.html](https://doc.qt.io/archives/qt-5.12/qt-conf.html)

| Entry 条目                      | Default Value 默认值               |
|---------------------------------|----------------------------------|
| Prefix 前缀                     | QCoreApplication::applicationDirPath() |
| Documentation 文档              | doc                              |
| Headers 头文件                  | include                          |
| Libraries 库                    | lib                              |
| LibraryExecutables 库可执行文件 | libexec                          |
| Binaries 二进制文件             | bin                              |
| Plugins 插件                    | plugins                          |
| Imports 导入                    | imports                          |
| Qml2Imports qml                 | qml                              |
| ArchData 架构数据               | .                                |
| Data 数据                       | .                                |
| Translations 译文               | translations                     |
| Examples 示例                   | examples                         |
| Tests 测试                      | tests                            |
| Settings 设置                   | .                                |

## 方式二：使用属性
- 参考：
[https://doc.qt.io/archives/qt-5.12/qmake-environment-reference.html](https://doc.qt.io/archives/qt-5.12/qmake-environment-reference.html)

- 用法：
```bash
qmake -set PROPERTY VALUE
```

- 可设置的属性参考（不完整）：
```bash
QMAKE_SPEC - the shortname of the host mkspec that is resolved and stored in the QMAKESPEC variable during a host build
QMAKE_SPEC - 主机 mkspec 的简称，在主机构建期间被解析并存储在 QMAKESPEC 变量中
QMAKE_VERSION - the current version of qmake
QMAKE_VERSION - qmake 的当前版本
QMAKE_XSPEC - the shortname of the target mkspec that is resolved and stored in the QMAKESPEC variable during a target build
QMAKE_XSPEC - 在构建目标时，解析并存储在 QMAKESPEC 变量中的目标 mkspec 的简称
QT_HOST_BINS - location of host executables
QT_HOST_BINS - 主机可执行文件的位置
QT_HOST_DATA - location of data for host executables used by qmake
QT_HOST_DATA - qmake 使用的主机可执行文件的数据位置
QT_HOST_PREFIX - default prefix for all host paths
QT_HOST_PREFIX - 所有宿主路径的默认前缀
QT_INSTALL_ARCHDATA - location of general architecture-dependent Qt data
QT_INSTALL_ARCHDATA - 通用架构相关 Qt 数据的存放位置
QT_INSTALL_BINS - location of Qt binaries (tools and applications)
QT_INSTALL_BINS - Qt 二进制文件（工具和应用程序）的存放位置
QT_INSTALL_CONFIGURATION - location for Qt settings. Not applicable on Windows
QT_INSTALL_CONFIGURATION - Qt 设置的存放位置。Windows 系统不适用
QT_INSTALL_DATA - location of general architecture-independent Qt data
QT_INSTALL_DATA - 通用架构无关 Qt 数据的存放位置
QT_INSTALL_DOCS - location of documentation
QT_INSTALL_DOCS - 文档的位置
QT_INSTALL_EXAMPLES - location of examples
QT_INSTALL_EXAMPLES - 示例的存放位置
QT_INSTALL_HEADERS - location for all header files
QT_INSTALL_HEADERS - 所有头文件的位置
QT_INSTALL_IMPORTS - location of QML 1.x extensions
QT_INSTALL_IMPORTS - QML 1.x 扩展的位置
QT_INSTALL_LIBEXECS - location of executables required by libraries at runtime
QT_INSTALL_LIBEXECS - 运行时库所需的可执行文件的位置
QT_INSTALL_LIBS - location of libraries
QT_INSTALL_LIBS - 库的位置
QT_INSTALL_PLUGINS - location of Qt plugins
QT_INSTALL_PLUGINS - Qt 插件的位置
QT_INSTALL_PREFIX - default prefix for all paths
QT_INSTALL_PREFIX - 所有路径的默认前缀
QT_INSTALL_QML - location of QML 2.x extensions
QT_INSTALL_QML - QML 2.x 扩展的位置
QT_INSTALL_TESTS - location of Qt test cases
QT_INSTALL_TESTS - Qt 测试用例的位置
QT_INSTALL_TRANSLATIONS - location of translation information for Qt strings
QT_INSTALL_TRANSLATIONS - Qt 字符串的翻译信息位置
QT_SYSROOT - the sysroot used by the target build environment
QT_SYSROOT - 目标构建环境使用的 sysroot
QT_VERSION - the Qt version. We recommend that you query Qt module specific version numbers by using $$QT.<module>.version variables instead.
QT_VERSION - Qt 版本。我们建议您使用$$QT.<module>.version 变量来查询 Qt 模块的特定版本号。
```
