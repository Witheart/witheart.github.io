---
title: "chromium 安装时 snap报错：error system does not fully support snapd cannot mount squashfs image using squashfs"
date: 2025-08-15
last_modified_at: 2025-08-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/chromium-安装时-snap报错-error-system-does-not-fully-support-snapd-cannot-mount-squashfs-image-using-squashfs/
toc: true
---

## 环境
rk3588 arm64 Ubuntu20.04

## 问题描述
安装chromium-browser时，使用下面的命令
```bash
sudo apt install chromium-browser
```

会默认安装Snap版本的chromium

报错如下
```bash
firefly@firefly:~/software$ sudo apt install chromium-browser
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following NEW packages will be installed:
  chromium-browser
0 upgraded, 1 newly installed, 0 to remove and 122 not upgraded.
Need to get 0 B/48.5 kB of archives.
After this operation, 165 kB of additional disk space will be used.
Preconfiguring packages ...
(Reading database ... 118680 files and directories currently installed.)
Preparing to unpack .../chromium-browser_1%3a85.0.4183.83-0ubuntu0.20.04.3_arm64.deb ...
=> Installing the chromium snap
==> Checking connectivity with the snap store
==> Installing the chromium snap
error: system does not fully support snapd: cannot mount squashfs image using "squashfs": mount:
       /tmp/syscheck-mountpoint-3522076023: wrong fs type, bad option, bad superblock on
       /dev/loop1, missing codepage or helper program, or other error.
dpkg: error processing archive /var/cache/apt/archives/chromium-browser_1%3a85.0.4183.83-0ubuntu0.20.04.3_arm64.deb (--unpack):
 new chromium-browser package pre-installation script subprocess returned error exit status 1
Errors were encountered while processing:
 /var/cache/apt/archives/chromium-browser_1%3a85.0.4183.83-0ubuntu0.20.04.3_arm64.deb
E: Sub-process /usr/bin/dpkg returned an error code (1)

```

主要报错为
```bash
error: system does not fully support snapd: cannot mount squashfs image using "squashfs"
```

## 解决方法
内核编译选型中，确保以下的选项开启
```ini
CONFIG_SQUASHFS=y
CONFIG_SQUASHFS_FILE_CACHE=y
CONFIG_SQUASHFS_DECOMP_SINGLE=y
CONFIG_SQUASHFS_ZLIB=y
CONFIG_SQUASHFS_LZO=y
CONFIG_SQUASHFS_XZ=y
CONFIG_SQUASHFS_FRAGMENT_CACHE_SIZE=3
```

重新编译内核即可

## 原理
原来失败的内核选项中，下面的选项已经开启了
```ini
CONFIG_SQUASHFS=y
CONFIG_SQUASHFS_FILE_CACHE=y
CONFIG_SQUASHFS_DECOMP_SINGLE=y
CONFIG_SQUASHFS_ZLIB=y
CONFIG_SQUASHFS_FRAGMENT_CACHE_SIZE=3
```

更改主要是新增了
```ini
CONFIG_SQUASHFS_LZO=y
CONFIG_SQUASHFS_XZ=y
```

- 选项说明
| 配置选项 | 功能说明 |
|---------|----------|
| **`CONFIG_SQUASHFS_LZO`** | 支持 LZO 压缩算法的 SquashFS 映像 |
| **`CONFIG_SQUASHFS_XZ`** | 支持 XZ/LZMA 压缩算法的 SquashFS 映像（通常提供更好的压缩率） |
| `CONFIG_SQUASHFS` | 基础 SquashFS 支持（您原来已启用） |
| `CONFIG_SQUASHFS_ZLIB` | 支持经典 gzip 压缩（您原来已启用） |
| `CONFIG_SQUASHFS_FRAGMENT_CACHE_SIZE` | 优化碎片访问性能（默认为 3） |

### 📌 为什么需要所有压缩格式支持？

- **Snap 包使用混合压缩**  
   不同软件的 Snap 包可能使用不同的压缩算法：
   - 有些使用高效的 XZ 压缩
   - 有些使用较快的 LZO 压缩
   - Chromium 的 Snap 包很可能使用了 XZ 或 LZO
