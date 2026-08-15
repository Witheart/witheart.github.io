---
title: "RK3588 移除 Mesa GLX、EGL 后端 —— libgl-dummy"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-移除-mesa-glx-egl-后端-libgl-dummy/
toc: true
---

## 背景

RK3588 平台的 OpenGL/EGL 由 **libmali**（Mali GPU 用户态驱动）提供，不是 Mesa。
但 Debian/Ubuntu 系统默认安装了 `libglx-mesa0` 和 `libegl-mesa0`（Mesa 的 GLX/EGL 后端），直接用 `apt remove` 卸载这两个包会牵连大量软件（如 `libqt5qml5`、GNOME 组件等），不可行。

本文介绍如何安全、干净地移除它们。

## 原理

创建一个名为 `libgl-dummy` 的空包，声明 `Provides: libegl-mesa0, libglx-mesa0`。
依赖这两个包的软件（如 `libqt5qml5`）会认为依赖已满足，从而不再需要真正的 Mesa 后端。

这是 **Firefly 官方 RK3588 镜像** 的做法。

## 适用环境

- RK3588 平台，使用 libmali（Mali GPU 驱动）
- Debian / Ubuntu 系统
- `libglx-mesa0` 和 `libegl-mesa0` 已安装

## 操作步骤

### 1. 确认当前状态

```bash
dpkg -l libglx-mesa0 libegl-mesa0
```

预期输出两者均为 `ii`（已安装）。

### 2. 创建 libgl-dummy 空包

```bash
mkdir -p /tmp/libgl-dummy/DEBIAN

cat > /tmp/libgl-dummy/DEBIAN/control << 'EOF'
Package: libgl-dummy
Version: 1.0
Architecture: all
Maintainer: Witheart <witheart.yinjim@qq.com>
Homepage: https://github.com/Witheart
Priority: optional
Section: libs
Provides: libegl-mesa0, libglx-mesa0
Description: Dummy package to satisfy Mesa GLX/EGL deps on Mali GPU systems
  This empty package prevents the real libglx-mesa0 and libegl-mesa0
  from being installed, since Mesa GLX/EGL backends conflict with libmali.
EOF

dpkg-deb --build /tmp/libgl-dummy /tmp/libgl-dummy_1.0_all.deb
```

> `Provides` 字段声明本包满足 `libegl-mesa0` 和 `libglx-mesa0` 的依赖。
> 如果需要覆盖更多 Mesa 包（如 154 的做法），可扩展该列表。

### 3. 卸载真包 + 安装假包

```bash
# 强制卸载（忽略依赖警告，一步完成）
dpkg --force-depends --purge libglx-mesa0 libegl-mesa0

# 安装假包（瞬间修复依赖链）
dpkg -i /tmp/libgl-dummy_1.0_all.deb
```

> 两台之间间隔极短，卸载后立刻安装假包，依赖关系即刻恢复。

### 4. 验证

```bash
# 检查包状态
dpkg -l libglx-mesa0 libegl-mesa0 libgl-dummy
```

预期输出：

```
un  libegl-mesa0   <无>   (无描述)            ← 虚拟包
ii  libgl-dummy    1.0                         ← 假包已安装
un  libglx-mesa0   <无>   (无描述)            ← 虚拟包
```

- `ii` 表示 `libgl-dummy` 已安装
- `un` 表示 `libglx-mesa0` / `libegl-mesa0` 是虚拟包（由 `libgl-dummy` 提供）

```bash
# 检查依赖完整性
dpkg --audit
apt-get check
```

两者均应**无输出**或输出 `SUCCESS`，没有破损依赖。

```bash
# 确认文件已不存在
ls /usr/lib/aarch64-linux-gnu/libGLX_mesa*
ls /usr/lib/aarch64-linux-gnu/libEGL_mesa*
```

应报 `No such file or directory`。

### 5. （可选）确认 GLX 不再走 Mesa 路径

```bash
# 检查 glvnd 是否还注册 Mesa EGL vendor
ls /usr/share/glvnd/egl_vendor.d/50_mesa.json
```

如果该文件存在但已无对应的 `.so`，glvnd 尝试加载会静默失败，不影响使用。
如需彻底清理：

```bash
rm /usr/share/glvnd/egl_vendor.d/50_mesa.json
```

## 恢复方法

如果以后需要恢复 Mesa 后端：

```bash
# 卸载假包
dpkg --purge libgl-dummy

# 重新安装真包
apt install libglx-mesa0 libegl-mesa0
```

## 常见问题

**Q: 为什么不能用 `apt remove`？**

A: `libqt5qml5` 等包硬依赖 `libglx-mesa0`，`apt remove` 会连锁卸载大量软件。

**Q: 以后 `apt upgrade` 会不会把真包装回来？**

A: 不会。假包 `libgl-dummy` 的 `Provides` 声明了 `libglx-mesa0`，dpkg 认为依赖已满足，
不会尝试安装真包。

**Q: `dpkg --audit` 是什么意思？**

A: 检查所有已安装包的依赖是否满足。无输出表示一切正常。

**Q: 假包需要保留的 deb 文件吗？**

A: 不需要，`/tmp/libgl-dummy_1.0_all.deb` 安装后可以删除。
如果想在其他机器复用，可以保留。
