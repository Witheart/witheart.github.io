---
title: "Qt库 deb包构建指南"
date: 2025-03-24
last_modified_at: 2025-03-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/qt库-deb包构建指南/
toc: true
---

### 步骤1：准备基础环境
```bash
# 创建打包工作目录
mkdir -p qt5142-deb/DEBIAN qt5142-deb/opt
```

目录结构说明：
```
qt5142-deb/
├── DEBIAN/          # 控制文件和脚本
│   ├── control      # 包元数据
│   ├── postinst     # 安装后脚本
│   └── ...         
└── opt/             # 安装文件
    └── Qt5.14.2.tar.gz
```

---

### 步骤2：准备安装文件
```bash
# 将你的Qt安装包放入指定位置
cp /path/to/your/Qt5.14.2.tar.gz qt5142-deb/opt/
```

验证文件权限：
```bash
chmod 644 qt5142-deb/opt/Qt5.14.2.tar.gz  # 确保可读权限
```

---

### 步骤3：编写控制文件 `DEBIAN/control`
```text
Package: qt5142-custom
Version: 5.14.2-1
Section: devel
Priority: optional
Architecture:all
Maintainer: Witheart <witheart.yinjim@qq.com>
Depends: build-essential,
         libgl1-mesa-dev,
         libxkbcommon-dev,
         libxkbcommon-x11-dev,
         libxcb-xinerama0-dev,
         libxcb-xinerama0,
         libxcb-icccm4-dev,
         libxcb-image0-dev,
         libxcb-keysyms1-dev,
         libxcb-render-util0-dev,
         libxcb-shape0-dev,
         libxcb-sync-dev,
         libxcb-xfixes0-dev,
         libxcb-xkb-dev,
         libxcb1-dev,
         libxcb1,
         libxrender-dev,
         libx11-dev,
         libx11-xcb-dev,
         libxi-dev,
         libxext-dev,
         libfontconfig1-dev,
         libfreetype6-dev,
         libpng-dev,
         libjpeg-dev,
         libssl-dev,
         libdbus-1-dev,
         libicu-dev,
         libpulse-dev,
         libasound2-dev,
         libgstreamer1.0-dev,
         libgstreamer-plugins-base1.0-dev,
         python,
         libwayland-dev
Description: Custom Qt 5.14.2 Development Environment (Complete Dependencies)
 This package provides Qt 5.14.2 with full dependency coverage.
 Includes both Python 2 support.
```

关键参数说明：
• `Depends`：必须包含所有依赖包名称（每个依赖单独一行或逗号分隔）
• `Architecture`：根据实际情况选择 amd64/arm64 等
• `Version`：格式推荐为 [主版本]-[修订号]

---

### 步骤4：编写安装后脚本 `DEBIAN/postinst`
```bash
#!/bin/bash
# 解压Qt到目标位置
echo "正在解压Qt安装包..."
tar -xzf /opt/Qt5.14.2.tar.gz -C /opt

# 配置qmake
echo "配置qmake..."
update-alternatives --install /usr/bin/qmake qmake /opt/Qt5.14.2/bin/qmake 100
update-alternatives --install /usr/bin/qmake qmake /usr/lib/qt5/bin/qmake 50

# 清理安装包（可选）
rm -f /opt/Qt5.14.2.tar.gz

echo "安装完成！使用以下命令切换qmake版本："
echo "  sudo update-alternatives --config qmake"
```

设置脚本权限：
```bash
chmod 755 qt5142-deb/DEBIAN/postinst
```

---

### 步骤5：构建DEB包
```bash
# 使用dpkg-deb打包
dpkg-deb --build qt5142-deb qt5142-custom_5.14.2-1_amd64.deb
```

成功输出示例：
```
dpkg-deb: 正在 'qt5142-custom_5.14.2-1_amd64.deb' 中构建软件包 'qt5142-custom'。
```

---

### 步骤6：安装验证
```bash
# 安装DEB包
sudo apt install ./qt5142-custom_5.14.2-1_amd64.deb

# 验证安装
qmake -v
# 应显示 Qt version 5.14.2

ls /opt/Qt5.14.2
# 应显示解压后的目录
```
