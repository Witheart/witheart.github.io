---
title: "RK3588 Ubuntu GNOME 设置-关于 卡顿问题 分析与优化"
date: 2026-07-20
last_modified_at: 2026-07-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-ubuntu-gnome-设置-关于-卡顿问题-分析与优化/
toc: true
---

## 1. 故障现象与定位

在基于 Rockchip RK3588 平台构建 Ubuntu 20.04 GNOME 桌面环境（rootfs）时，进入“设置 -> 关于”面板会出现 2~3 秒的明显卡顿（UI 线程假死）。

通过注入环境变量开启 GNOME 调试日志进行链路追踪：

```bash
env G_MESSAGES_DEBUG=all gnome-control-center info-overview

```

```bash
env G_MESSAGES_DEBUG=all gnome-control-center info-overview
(gnome-control-center:5462): GLib-GIO-DEBUG: 16:18:57.430: _g_io_module_get_default: Found default implementation gvfs (GDaemonVfs) for ‘gio-vfs’
arm_release_ver: g13p0-01eac0, rk_so_ver: 9

(gnome-control-center:5462): Clutter-WARNING **: 16:18:57.595: Whoever translated default:LTR did so wrongly.
(gnome-control-center:5462): cc-object-storage-DEBUG: 16:18:57.605: Initializing object storage
(gnome-control-center:5462): GLib-DEBUG: 16:18:57.607: unsetenv() is not thread-safe and should not be used after threads are created
(gnome-control-center:5462): Gtk-DEBUG: 16:18:57.607: Connecting to session manager
(gnome-control-center:5462): GLib-GIO-DEBUG: 16:18:57.668: _g_io_module_get_default: Found default implementation dconf (DConfSettingsBackend) for ‘gsettings-backend’
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.668: watch_fast: "/org/gnome/control-center/" (establishing: 0, active: 0)
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.670: watch_established: "/org/gnome/control-center/" (establishing: 1)
(gnome-control-center:5462): network-cc-panel-DEBUG: 16:18:57.677: Monitoring NetworkManager for Wi-Fi devices
(gnome-control-center:5462): cc-object-storage-DEBUG: 16:18:57.717: Adding object NMClient (CcObjectStorage::nm-client → 0x55713f6080) to the storage
(gnome-control-center:5462): network-cc-panel-DEBUG: 16:18:57.717: Wi-Fi panel visible: yes
(gnome-control-center:5462): wacom-cc-panel-DEBUG: 16:18:57.726: Wacom panel visible: no
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.734: change_fast
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.735: change_notify: /org/gnome/control-center/last-panel
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.874: watch_fast: "/org/gnome/desktop/interface/" (establishing: 0, active: 0)
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.874: watch_fast: "/org/gnome/shell/extensions/dash-to-dock/" (establishing: 0, active: 0)
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.875: change_fast
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.875: change_notify: /org/gnome/desktop/interface/gtk-theme
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.875: watch_established: "/org/gnome/desktop/interface/" (establishing: 1)
(gnome-control-center:5462): cc-object-storage-DEBUG: 16:18:57.875: Asynchronously creating D-Bus proxy for CcObjectStorage::dbus-proxy(org.gnome.Shell,/org/gnome/Shell,org.gnome.Shell)
(gnome-control-center:5462): dconf-DEBUG: 16:18:57.875: watch_established: "/org/gnome/shell/extensions/dash-to-dock/" (establishing: 1)
(gnome-control-center:5462): cc-window-DEBUG: 16:18:57.875: Time to open panel '外观': 0.140236s
(gnome-control-center:5462): GLib-DEBUG: 16:18:57.989: setenv()/putenv() are not thread-safe and should not be used after threads are created
** (gnome-control-center:5462): DEBUG: 16:18:58.037: No extra argument
(gnome-control-center:5462): dconf-DEBUG: 16:18:58.037: change_fast
(gnome-control-center:5462): dconf-DEBUG: 16:18:58.037: change_notify: /org/gnome/control-center/last-panel
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:58.191: Getting renderer from helper for GPU 'Unknown Graphics Controller'
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:58.191: About to launch '/usr/libexec/gnome-control-center-print-renderer'
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:58.191: With environment:
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:58.191:   DRI_PRIME = platform-display-subsystem
(gnome-control-center:5462): GLib-DEBUG: 16:18:58.191: posix_spawn avoided (fd close requested)
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:59.612: Getting renderer from helper for GPU 'Unknown Graphics Controller'
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:59.612: About to launch '/usr/libexec/gnome-control-center-print-renderer'
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:59.612: With environment:
(gnome-control-center:5462): info-overview-cc-panel-DEBUG: 16:18:59.612:   DRI_PRIME = platform-fdab0000_npu
(gnome-control-center:5462): GLib-DEBUG: 16:18:59.612: posix_spawn avoided (fd close requested)
libGL error: MESA-LOADER: failed to open rknpu: /usr/lib/dri/rknpu_dri.so: 无法打开共享对象文件: 没有那个文件或目录 (search paths /usr/lib/aarch64-linux-gnu/dri:\$${ORIGIN}/dri:/usr/lib/dri, suffix _dri)
libGL error: failed to load driver: rknpu
libGL error: failed to create dri screen
libGL error: failed to load driver: rockchip
(gnome-control-center:5462): cc-window-DEBUG: 16:19:00.481: Time to open panel '关于': 2.443688s
(gnome-control-center:5462): cc-window-DEBUG: 16:19:00.481: Added 'ubuntu' to the previous panels
(gnome-control-center:5462): dconf-DEBUG: 16:19:00.482: unwatch_fast: "/org/gnome/desktop/interface/" (active: 1, establishing: 0)
(gnome-control-center:5462): dconf-DEBUG: 16:19:00.486: unwatch_fast: "/org/gnome/shell/extensions/dash-to-dock/" (active: 1, establishing: 0)

(gnome-control-center:5462): GLib-GObject-CRITICAL **: 16:19:00.490: g_signal_connect_object: assertion 'G_IS_OBJECT (gobject)' failed
(gnome-control-center:5462): cc-object-storage-DEBUG: 16:19:00.490: Finished creating D-Bus proxy for CcObjectStorage::dbus-proxy(org.gnome.Shell,/org/gnome/Shell,org.gnome.Shell)
(gnome-control-center:5462): diagnostics-cc-panel-DEBUG: 16:19:00.498: ABRT vanished
(gnome-control-center:5462): dconf-DEBUG: 16:19:10.367: sync
(gnome-control-center:5462): dconf-DEBUG: 16:19:10.369: unwatch_fast: "/org/gnome/control-center/" (active: 1, establishing: 0)
(gnome-control-center:5462): cc-object-storage-DEBUG: 16:19:10.369: Destroying cached objects
```

分析终端输出的时间戳，发现耗时集中在图形处理器（Graphics）信息的探测阶段。GNOME 依赖的硬件信息收集工具试图通过 Mesa 标准加载底层驱动：

1. 探测 `platform-display-subsystem` 时，尝试加载 `rockchip_dri.so` 失败并阻塞等待（耗时 ~1.4s）。
2. 探测 NPU 节点 `platform-fdab0000_npu` 时，尝试加载 `rknpu_dri.so` 失败并阻塞等待（耗时 ~0.9s）。

**根本原因**：RK3588 内核将 VOP 与 NPU 均注册为 DRM 设备，但系统实际运行的是闭源 Mali-G610 用户态驱动。Mesa Loader 在 `/usr/lib/aarch64-linux-gnu/dri/` 目录下遇到系统原装的无效空壳驱动（或缺失对应实现）时，会引发超时阻塞，最终信息展示回退至 `llvmpipe`（软件渲染）的信息。

## 2. 优化方案演进与底层逻辑分析

针对上述 Mesa 探测阻塞问题，结合闭源 Mali 驱动的特性，有以下两种优化方案。

### 方案一：基于符号加载失败的快速中断机制 (Fast-fail)

此方案通过重定向动态库，利用 Mesa Loader 的符号校验机制主动触发异常，从而阻断超时等待。

**操作方法**：

1. 将系统原有的开源空壳驱动备份或删除。
2. 将 Rockchip 官方的闭源 `libmali.so` 软链接至目标路径，伪装成 DRI 驱动：

```bash
ln -sf /usr/lib/aarch64-linux-gnu/libmali.so /usr/lib/aarch64-linux-gnu/dri/rockchip_dri.so

```

3. 通过 `/etc/ld.so.preload` 注入 `libmali-hook.so`，劫持图形 API 调用至 Mali 硬件。

**底层逻辑**：
当 Mesa Loader 通过 `dlopen` 加载我们伪装的闭源库时，会去查找其预期的扩展符号表 `__driDriverExtensions`。由于闭源 `libmali.so` 并未实现该 Mesa 标准扩展，加载器会立刻抛出 `undefined symbol` 错误并立即放弃加载。
这种基于符号缺失的“快速失败（Fast-fail）”，成功绕过了原有的阻塞等待流程，将面板加载时间从 2.44s 压缩至 0.84s。

### 方案二：移除冗余 DRI 驱动与底层图形库直连 (推荐实践)

对系统进行极致精简，绕过 Mesa 的动态加载尝试，通过系统级软链接直接将图形栈对接至 Mali 闭源驱动。

**操作方法**：

1. **清理冗余探针目标**：直接删除 `/usr/lib/aarch64-linux-gnu/dri/` 目录下的 `rockchip_dri.so`、`rknpu_dri.so` 等不必要的开源驱动文件。

**底层逻辑**：
清理 DRI 目录后，当 GNOME 探测工具底层调用 `open()` 系统调用寻找驱动文件时，文件系统直接返回 `ENOENT` (No such file or directory) 错误。系统无需将其映射进内存，也无需进行任何符号解析，探测请求被瞬间终结。
同时，底层标准 EGL/GLES 库已直接链接至硬件驱动，确保了 Wayland/X11 环境下 GPU 硬件加速的正常运行。此方案将面板加载时间进一步缩短至 0.67s，彻底解决了卡顿问题，且保证了文件系统的纯净度。

## 3. 进一步优化
进一步对比速度更快的参考系统，发现其系统内有`/usr/lib/aarch64-linux-gnu/dri/rockchip_dri.so`，且经过md5sum，该库和我们装的mesa库一模一样，但是其设置->关于的启动时间达到了0.3s左右，但是其显卡位置显示的不是llvm的软解，而是“未知”。且参考系统中，打开设置的时候，没有libGL的报错，而我们的系统有。

为什么一样有rockchip_dri.so库，但是一个启动速度慢，一个快呢？显卡型号显示的也不一样，底层报错也不一样？
经过对比发现，我的系统中有如下的两个库的软链接
```bash
/usr/lib/aarch64-linux-gnu/libGLX_mesa.so.0
/usr/lib/aarch64-linux-gnu/libEGL_mesa.so.0
```
将其都unlink掉后，表现就和参考系统一致了。

推测路径如下：
我的系统之前是这样的：
libepoxy 尝试 EGL -> 顺着系统里的 _mesa.so.0 找到了 Mesa -> Mesa 加载 rockchip_dri.so 失败抛出报错 -> Mesa 启动兜底方案：加载 swrast_dri.so (也就是 llvmpipe 纯 CPU 软件渲染) -> 在 ARM 芯片上初始化 llvmpipe 需要花掉整整 1 秒多钟 -> 软解建屏成功，吐出 llvmpipe 名字

参考系统：libepoxy 尝试 EGL -> 发现底层既没有 libGLX_mesa.so.0，也没有 libEGL_mesa.so.0 -> Mesa 的路彻底断了，连软解兜底的机会都不给 -> 瞬间建屏失败（Fast-Fail） -> 耗时 0.3 秒，抛出“未知”。 
