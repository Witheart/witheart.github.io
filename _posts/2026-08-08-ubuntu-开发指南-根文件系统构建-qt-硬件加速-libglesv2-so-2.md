---
title: "根文件系统构建 —— Qt 硬件加速 libGLESv2.so.2"
date: 2026-08-08
last_modified_at: 2026-08-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/根文件系统构建-qt-硬件加速-libglesv2-so-2/
toc: true
---

## 1 概述

系统从 Ubuntu base 构建，Qt 默认链接 OpenGL（libGL.so.1），而 RK3588 的 Mali G610 GPU 只提供 OpenGL ES（GLESv2）API。直接使用原生 Qt 会导致硬件加速失效，回退到 Mesa llvmpipe 软件渲染。

目前有两种方式使 Qt 走 Mali GPU 硬件加速：

1. **使用 gles 版本的 Qt**：Ubuntu 官方源提供 `libqt5gui5-gles` 包，NEEDED 为 `libGLESv2.so.2`，通过 Mali stub 路由到 `libmali.so`。参考《根文件系统构建 —— Qt版本更新为 libqt5gui5-gles（libGL error）（以cutecom为例）》
2. **从源码重新编译 Qt**：Firefly 镜像的做法，编译时将 NEEDED 改为直接链接 `libmali.so`（绝对路径），一个 so 同时导出 EGL + GLES + OpenCL 所有符号。

下面逐个分析每种方案的库链接链路。

## 2 libqt5gui5-gles（使用 Ubuntu 官方源中 gles 版本的 Qt）

### 2.1 查看 NEEDED

```bash
readelf -d /usr/lib/aarch64-linux-gnu/libQt5Gui.so.5 | grep -E 'libGL|libGLES'
```

输出：

```
0x0000000000000001 (NEEDED)  共享库：[libGLESv2.so.2]
```

关键：NEEDED 是 `libGLESv2.so.2`，而非标准包的 `libGL.so.1`。

### 2.2 最终链接库路径梳理

```
libQt5Gui.so (libqt5gui5-gles)
  └─ NEEDED: libGLESv2.so.2
       └─ ldconfig 查找 libGLESv2.so.2
            ├── [优先级 1] /usr/lib/aarch64-linux-gnu/mali/libGLESv2.so.2  ← 命中！
            │      (由 /etc/ld.so.conf.d/00-aarch64-mali.conf 提供搜索路径)
            │    └─ NEEDED: libmali-hook.so.1 → /lib/aarch64-linux-gnu/libmali-hook.so.1
            │    └─ NEEDED: libmali.so.1       → /lib/aarch64-linux-gnu/libmali.so.1  (41MB 真实驱动)
            │         └─ /dev/mali0  (Mali G610 GPU)
            │
            └── [优先级 2] /lib/aarch64-linux-gnu/libGLESv2.so.2  ← 不会被加载
                   (Mesa libgles2，作为备选)
```

验证命令：

```bash
# 确认运行时解析
ldd /usr/lib/aarch64-linux-gnu/libQt5Gui.so.5 | grep -iE 'GLES|mali'

# 确认 ldcache 优先级
ldconfig -p | grep libGLESv2.so.2
```

输出：

```
libGLESv2.so.2 => /usr/lib/aarch64-linux-gnu/mali/libGLESv2.so.2  (0x0000007fa99eb000)
        libmali-hook.so.1 => /lib/aarch64-linux-gnu/libmali-hook.so.1  (0x...)
        libmali.so.1 => /lib/aarch64-linux-gnu/libmali.so.1  (0x...)
```

> **结论**：gles 版 Qt 通过 ld.so.conf 优先级机制，将 GLES 调用路由到 Mali GPU，硬件加速正常工作。

---

## 3 libqt5gui5（使用 Ubuntu 官方源中普通版本的 Qt）

### 3.1 查看 NEEDED

从 Ubuntu 官方仓库下载原始 deb 包并提取：

```bash
apt-get download libqt5gui5=5.12.8+dfsg-0ubuntu2.1
dpkg-deb -x libqt5gui5_*_arm64.deb /tmp/qt5gui5_normal/
readelf -d /tmp/qt5gui5_normal/usr/lib/aarch64-linux-gnu/libQt5Gui.so.5.12.8 | grep -E 'libGL|libGLES'
```

输出：

```
0x0000000000000001 (NEEDED)  共享库：[libGL.so.1]
```

关键：NEEDED 是 `libGL.so.1`（标准 OpenGL），而不是 `libGLESv2.so.2`。

### 3.2 最终链接库路径梳理

```
libQt5Gui.so (libqt5gui5)
  └─ NEEDED: libGL.so.1
       └─ /usr/lib/aarch64-linux-gnu/libGL.so.1 → libGL.so.1.7.0
            └─ 属于包: libgl1:arm64 (Mesa libgl)
                 └─ libGLdispatch.so.0  (Mesa GL 分发层)
                 └─ libGLX.so.0         (GLX 协议)
                      └─ 最终走 Mesa llvmpipe 软件渲染
                          ❌ 不经过 /dev/mali0，GPU 未参与
```

验证 libGL.so.1 的身份：

```bash
dpkg -S libGL.so.1
# 输出: libgl1:arm64

ldd /tmp/qt5gui5_normal/usr/lib/aarch64-linux-gnu/libQt5Gui.so.5.12.8 | grep -iE 'GL|mali'
```

输出：

```
libGL.so.1 => /lib/aarch64-linux-gnu/libGL.so.1
        libGLdispatch.so.0 => /lib/aarch64-linux-gnu/libGLdispatch.so.0
        libGLX.so.0 => /lib/aarch64-linux-gnu/libGLX.so.0
```

> **结论**：标准 Ubuntu 包的 `libQt5Gui.so` 链接 `libGL.so.1`（Mesa），走 GLX 协议，最终是 CPU 软件渲染。即使系统安装了 libmali，也不会被标准 Qt 包加载，因为 ldconfig 只在匹配 NEEDED 的 soname 时才参与路由 —— 标准包 NEEDED 的是 `libGL.so.1`，没有 `libGLESv2.so.2`，所以不会经过 `00-aarch64-mali.conf` 的优先级机制。

---

## 4 libqt5gui5（使用 Firefly 镜像上预置的 Qt）

### 4.1 查看 NEEDED

```bash
readelf -d /usr/lib/aarch64-linux-gnu/libQt5Gui.so.5 | grep -E 'libGL|libGLES|libmali'
```

输出：

```
0x0000000000000001 (NEEDED)  共享库：[/lib/aarch64-linux-gnu/libmali.so]
```

关键：NEEDED 是 **绝对路径** `/lib/aarch64-linux-gnu/libmali.so`，这在标准 Debian/Ubuntu 包中永远不会出现。

### 4.2 最终链接库路径梳理

```
libQt5Gui.so (Firefly 自编译)
  └─ NEEDED: /lib/aarch64-linux-gnu/libmali.so  ← 编译时写入的绝对路径
       └─ /lib/aarch64-linux-gnu/libmali.so → libmali.so.1 → libmali.so.1.9.0  (41MB 真实驱动)
            └─ /dev/mali0  (Mali G610 GPU)
```

> 注意：这个 so 同时导出 EGL、GLESv1_CM、GLESv2、OpenCL 所有符号，因此只需要链一个 `libmali.so` 即可覆盖所有 API。这是 Firefly 在 `firefly-rk3588-repo` 中重新编译 Qt 做到的。

**Firefly 方案 vs 标准 gles 包的关键差异**：

| 对比项           | Firefly 自编译 Qt                      | Ubuntu 官方 gles 包                   |
| ---------------- | -------------------------------------- | ------------------------------------- |
| 包名             | `libqt5gui5`（伪装为普通包）           | `libqt5gui5-gles`                     |
| NEEDED           | `/lib/.../libmali.so`（绝对路径）      | `libGLESv2.so.2`                      |
| 来源仓库         | `firefly-rk3588-repo`                  | `ubuntu-ports focal-updates/universe` |
| 包大小           | 11161 KB                               | 11412 KB                              |
| libQt5Gui.so md5 | `3180e48...`                           | `e2b62ea45...`                        |
| 优点             | 不需要额外包，一个 libmali.so 覆盖所有 | 标准 apt install，维护简单            |
| 缺点             | 包与上游不同步，需自己维护             | 必须额外安装 gles 变体包              |

---

## 5 总结

| 方案                        | NEEDED                            | 最终走 GPU？ |    维护难度    |
| --------------------------- | --------------------------------- | :----------: | :------------: |
| Ubuntu 标准 `libqt5gui5`    | `libGL.so.1` (Mesa)               | ❌ 软件渲染  |       —        |
| Ubuntu `libqt5gui5-gles`    | `libGLESv2.so.2`                  | ✅ Mali GPU  | 低（apt 即可） |
| Firefly 自编译 `libqt5gui5` | `/lib/.../libmali.so`（绝对路径） | ✅ Mali GPU  | 高（需自维护） |
