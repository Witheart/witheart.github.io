---
title: "gnome-session libGL error failed to create dri screen"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/gnome-session-libgl-error-failed-to-create-dri-screen/
toc: true
---

## 问题
```bash
# journalctl -b 0 | grep -i "libGL"
8月 08 13:40:14 user gnome-session[999]: libGL error: failed to create dri screen
8月 08 13:40:14 user gnome-session[999]: libGL error: failed to load driver: rockchip

```

## 分析
```bash
有报错系统:
  libglx-mesa0 已安装 → Mesa libGL 可用 swrast 提供 GLX visual
  → glXChooseVisual 成功 → 进入 DRI hw 加速尝试
  → 加载 rockchip_dri.so → 失败（Mali 独占 GPU）
  → 输出 "libGL error: failed to create dri screen" + "failed to load driver: rockchip"

无报错系统:
  libgl-dummy → 阻断 libglx-mesa0 → Mesa libGL 无法使用 GLX
  → gl-helper 的 glXChooseVisual 立即失败
  → 输出 "No hardware 3D support." → exit 1
  → 从未进入 DRI 初始化流程 → 无 "failed to create dri screen" 错误

```
本质上两个板的硬件状态是一样的： AIGLX 都失败（Calling driver entry point failed），都回退到了 DRISWRAST swrast（软件 GLX）。区别是“有报错系统”上 swrast 仍能提供 GLX visual（所以就进入了 DRI init → 报错），而“无报错系统”上连 swrast visual 也不可用（所以直接失败，不碰 DRI）。

有报错系统上，有这几个库文件：
- /usr/lib/aarch64-linux-gnu/libGLX_mesa.so.0 + .0.0.0
- /usr/lib/aarch64-linux-gnu/libEGL_mesa.so.0 + .0.0.0
- /usr/share/glvnd/egl_vendor.d/50_mesa.json

删除则不会触发，因为现在GLES 走 Mali，Mesa GLX/EGL/DRI 被阻断，不会再触发 failed to create dri screen 错误。rockchip_dri.so 文件本身还在但不影响（Mesa 不会去加载它了）。
```bash
# 1. 删除 Mesa GLX 后端 — 阻断 Mesa 的 GLX 路径
#    这样 gl-helper 的 glXChooseVisual 直接失败，不会进入 DRI 初始化
rm /usr/lib/aarch64-linux-gnu/libGLX_mesa.so.0
rm /usr/lib/aarch64-linux-gnu/libGLX_mesa.so.0.0.0

# 2. 删除 Mesa EGL 后端 — 阻断 Mesa 的 EGL 路径
rm /usr/lib/aarch64-linux-gnu/libEGL_mesa.so.0
rm /usr/lib/aarch64-linux-gnu/libEGL_mesa.so.0.0.0

# 3. 删除 glvnd EGL vendor 注册文件 — 不让 glvnd 尝试加载 Mesa EGL
rm /usr/share/glvnd/egl_vendor.d/50_mesa.json

```
还有一个方式是安装个假包，方便后续维护，查看《RK3588 移除 Mesa GLX、EGL 后端 —— libgl-dummy》。
