---
title: "Qt 中无法使用ibus-rime中文输入"
date: 2025-10-31
last_modified_at: 2025-10-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/qt-中无法使用ibus-rime中文输入/
toc: true
---

## 问题背景
客诉Qt 程序中无法使用ibus-rime中文输入，而在其他位置（例如终端、xfce搜索框）中，中文输入是正常的。

## 解决方式
启动qt程序之前，应该加载下列环境变量：
```bash
# ibus-rime
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus
```

## 解决过程
写一个只含文本框的验证demo，发现该demo中的中文输入正常。说明问题和程序本身，或者环境变量有关。

异常的程序为使用systemd开机自启，如果在命令行手动启动，则输入法正常，那应该和环境变量有关。

输入法的ibus相关变量位于.profile中，经验证，可能是由于systemd加载比较早，没有加载到ibus变量，在启动前手动加载即可解决问题。

## 验证程序
下面是一个用于验证的程序
```bash
# 创建测试目录并进入
mkdir qt_ibus_test && cd qt_ibus_test

# 创建包含输入框的测试程序
cat << 'EOF' > main.cpp
#include <QApplication>
#include <QLineEdit>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    
    QLineEdit edit;
    edit.setWindowTitle("输入法测试");
    edit.setPlaceholderText("请在此处测试输入法...");
    edit.resize(300, 30);
    edit.show();
    
    return app.exec();
}
EOF

# 生成项目文件
qmake -project
echo "QT += core gui widgets" >> qt_ibus_test.pro
echo "CONFIG += c++11" >> qt_ibus_test.pro
echo "TARGET = qt_ibus_test" >> qt_ibus_test.pro

# 生成 Makefile 并编译
qmake
make

# 运行测试程序
./qt_ibus_test

```
