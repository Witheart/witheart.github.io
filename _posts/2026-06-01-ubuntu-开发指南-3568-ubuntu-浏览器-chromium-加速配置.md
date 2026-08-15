---
title: "3568 Ubuntu 浏览器 chromium 加速配置"
date: 2026-06-01
last_modified_at: 2026-06-01
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3568-ubuntu-浏览器-chromium-加速配置/
toc: true
---

## 0 说明

该段加速配置来自于firefly的脚本

## 1 脚本原文

```bash
$ which chromium
/usr/bin/chromium

$ cat /usr/bin/chromium
#!/bin/bash
#
# Copyright 2011 The Chromium Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Let the wrapped binary know that it has been run through the wrapper.
export CHROME_WRAPPER="`readlink -f "$0"`"

HERE="`dirname "$CHROME_WRAPPER"`"

# We include some xdg utilities next to the binary, and we want to prefer them
# over the system versions when we know the system versions are very old. We
# detect whether the system xdg utilities are sufficiently new to be likely to
# work for us by looking for xdg-settings. If we find it, we leave $PATH alone,
# so that the system xdg utilities (including any distro patches) will be used.
if ! command -v xdg-settings &> /dev/null; then
  # Old xdg utilities. Prepend $HERE to $PATH to use ours instead.
  export PATH="$HERE:$PATH"
else
  # Use system xdg utilities. But first create mimeapps.list if it doesn't
  # exist; some systems have bugs in xdg-mime that make it fail without it.
  xdg_app_dir="${XDG_DATA_HOME:-$HOME/.local/share/applications}"
  mkdir -p "$xdg_app_dir"
  [ -f "$xdg_app_dir/mimeapps.list" ] || touch "$xdg_app_dir/mimeapps.list"
fi

# Always use our versions of ffmpeg libs.
# This also makes RPMs find the compatibly-named library symlinks.
if [[ -n "$LD_LIBRARY_PATH" ]]; then
  LD_LIBRARY_PATH="$HERE:$HERE/lib:$LD_LIBRARY_PATH"
else
  LD_LIBRARY_PATH="$HERE:$HERE/lib"
fi
export LD_LIBRARY_PATH

export CHROME_VERSION_EXTRA="stable"

# We don't want bug-buddy intercepting our crashes. http://crbug.com/24120
export GNOME_DISABLE_CRASH_DIALOG=SET_BY_GOOGLE_CHROME

# Sanitize std{in,out,err} because they'll be shared with untrusted child
# processes (http://crbug.com/376567).
exec < /dev/null
exec > >(exec cat)
exec 2> >(exec cat >&2)

CHROME_EXTRA_ARGS="         --use-gl=egl                    --no-sandbox --gpu-sandbox-start-early --ignore-gpu-blacklist --ignore-gpu-blocklist --enable-remote-extensions --no-default-browser-check --enable-webgpu-developer-features --enable-unsafe-webgpu --show-component-extension-options --enable-gpu-rasterization --no-default-browser-check --disable-pings --media-router=0 --enable-accelerated-video-decode --enable-features=VaapiVideoDecoder,VaapiVideoEncoder"

# Note: exec -a below is a bashism.
exec -a "$0" "$HERE/chromium-bin" ${CHROME_EXTRA_ARGS} "$@"
```

## 2 参数说明

### 2.1 **图形与 GPU 硬件加速类**

- **`--use-gl=egl`**: 指定使用 EGL 作为 OpenGL 接口。在 ARM/Linux 环境下（尤其是 Wayland 或 Mali GPU），EGL 是调用硬件渲染的标准方式。
- `--ignore-gpu-blacklist` / `--ignore-gpu-blocklist**`: 非常关键。强行忽略 Chromium 自带的 GPU 黑名单。因为 RK3568 的 GPU 驱动通常被 Chromium 默认禁用，这个参数强制让浏览器使用 GPU。
- **`--enable-gpu-rasterization`**: 开启 GPU 栅格化，让网页的绘制（比如滚动页面时的内容渲染）交由 GPU 处理，大幅提升网页流畅度。
- **`--enable-webgpu-developer-features --enable-unsafe-webgpu`**: 强制开启 WebGPU 支持（下一代 Web 图形 API），主要供开发者测试。

### 2.2 **视频硬件解码类**

- **`--enable-accelerated-video-decode`**: 允许使用 GPU/VPU 进行视频硬件解码。
- **`--enable-features=VaapiVideoDecoder,VaapiVideoEncoder`**: 强制开启 VA-API 视频硬解和硬编。在 RK3568 的 Linux 发行版中，通常会通过底层补丁将 VA-API 调用映射到瑞芯微自家的 MPP (Media Process Platform) 硬件解码器上，从而实现 B 站、YouTube 等网页视频的流畅播放。

### 2.3 **系统权限与功能调整类**

- **`--no-sandbox` / `--gpu-sandbox-start-early**`: 关闭 Chromium 的安全沙盒模式。**这是一个妥协**。在许多嵌入式 Linux 系统中，沙盒机制会阻止浏览器进程访问 GPU 或 VPU 的底层设备节点（如 `/dev/dri/renderD128`），为了让硬件加速生效，开发者只能牺牲一定的安全性关掉沙盒。
- **`--no-default-browser-check`**: 启动时不提示“是否设为默认浏览器”。
- **`--disable-pings`**: 禁用链接点击跟踪。
- **`--media-router=0`**: 禁用投屏组件（节省资源）。

### 2.4 其他参数

- **`--enable-remote-extensions`**
- **作用：** 允许 Chromium 加载远程扩展或通过特定策略配置的扩展。在某些嵌入式系统或定制系统中，厂商可能会通过云端或系统底层的策略文件来统一部署浏览器插件，开启这个参数可以确保这些非本地常规安装的插件能够正常运行。

- **`--show-component-extension-options`**
- **作用：** 显示“组件扩展”的选项。Chromium 内部自带了一些核心功能（比如某些登录模块、媒体路由等），它们在底层实际上是以“隐藏的官方扩展（Component Extensions）”形式存在的。默认情况下，这些组件扩展在 `chrome://extensions` 页面是不可见的。加上这个参数后，开发者可以在扩展页面看到它们并调整设置，主要用于系统厂家的抓虫和调试。
