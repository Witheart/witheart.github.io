---
title: "overlayroot 根文件系统移植到普通分区注意事项"
date: 2026-08-08
last_modified_at: 2026-08-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-根文件系统移植到普通分区注意事项/
toc: true
---

## 一、场景描述

```
源系统（overlayroot）                       目标系统（普通分区）
┌──────────────────────┐                  ┌──────────────────────┐
│ / = overlay merged    │    打包移植      │ / = 直接 ext4 挂载   │
│ /media/root-ro = 底包 │ ──────────────→ │ 无 overlayroot       │
│ /media/root-rw = 表层 │                 │ 无 initrd 覆盖层     │
│ overlayroot=tmpfs     │                 │ 无 userdata 分区     │
└──────────────────────┘                  └──────────────────────┘
```

核心问题：overlayroot 系统在多个层面（内核参数、initrd、启动脚本）做了特殊配置，打包移植到普通分区时这些配置会**导致系统无法正常启动**。

---

## 二、注意事项总览

| 序号 | 注意点 | 风险等级 | 说明 |
|---|---|---|---|
| 1 | 打包来源必须是 `/media/root-ro` | 🔴 致命 | 从 `/` 打包会混入 whiteout 文件 |
| 2 | 内核 bootargs 中的 `overlayroot=` | 🔴 致命 | 必须删除，否则内核尝试启动 overlayroot |
| 3 | `/etc/rc.local` 中的 overlayroot 逻辑 | 🔴 致命 | 格式化 userdata、remount ro 导致挂载异常 |
| 4 | initrd.img 中嵌入的 overlayroot 脚本 | 🟡 重要 | 如果 boot.its 不载入 initrd 则无影响 |
| 5 | overlayroot 包本身 | 🟢 安全 | 无害，只是闲置不生效 |
| 6 | userdata 挂载点残留 | 🟡 重要 | /etc/fstab 可能残留 userdata 挂载项 |

---

## 三、逐项详解

### 3.1 打包来源：必须从 `/media/root-ro` 打包

这是**最关键的一步**。overlayroot 系统运行时的 `/` 是合并后的视图：

```
/ (merged) = /media/root-ro (lower, 只读底包) + /media/root-rw/overlay/ (upper, 表层修改)
```

如果从 `/` 直接打包（例如 `rsync -a / ./output/`），会混入：

- **Whiteout 文件**：覆盖层中用于"遮盖"底层文件删除操作的特殊字符设备，在普通 ext4 中表现为损坏的文件
- **上层覆盖的旧版本文件**：Copy-up 复制上去的修改副本

**正确做法**：打包 `/media/root-ro`（底层底包），这是纯净的物理文件系统。

你的 `hw_export_rootfs` 脚本（overlayroot 分支）已经自动处理了这一点——检测到 overlayroot 时将 `SOURCE_PATH` 自动设为 `/media/root-ro`（脚本第 223 行）：

```bash
if [ -d "/media/root-ro" ] && mountpoint -q /media/root-ro; then
    SOURCE_PATH="/media/root-ro"
```

但如果底层也有需要保留的修改（通过 `overlayroot-chroot` 或手动改底包的变更），确保这些修改已经落在 `/media/root-ro` 中再打包。如果修改只存在于表层（`/media/root-rw/overlay/`），需要先执行"顶层同步到底层"。

---

### 3.2 内核 bootargs：删除 `overlayroot=` 参数 🔴

overlayroot 系统在内核设备树（`.dts`）的 `chosen` 节点中硬编码了 `overlayroot=`：

```dts
// overlayroot 系统的 bootargs（源码）
bootargs = "... root=PARTLABEL=rootfs rw rootwait overlayroot=tmpfs net.ifnames=0";

// overlayroot + userdata 版本
bootargs = "... root=PARTLABEL=rootfs rw rootwait overlayroot=device:dev=/dev/disk/by-partlabel/userdata,fstype=ext4,mkfs=1 net.ifnames=0";
```

**如果不删除 `overlayroot=...`**，内核启动后会尝试：
1. 执行 initramfs 中嵌入的 overlayroot 脚本
2. 如果 initramfs 中没有 overlayroot 逻辑（普通系统的 initrd），boot 流程会报错或行为异常
3. 即使 initrd 里有 overlayroot 脚本，没有 userdata 分区或 tmpfs 配置也会失败

**改为普通系统的 bootargs**：

```dts
chosen: chosen {
    bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTLABEL=rootfs rw rootwait net.ifnames=0";
};
```

> **改了内核源码后必须重新编译内核**，不能只换 rootfs 镜像。bootargs 是编译进内核镜像的。

---

### 3.3 `/etc/rc.local` 中的 overlayroot 逻辑 🔴

overlayroot 的 `/etc/rc.local` 中有专门的初始化逻辑（格式化 userdata、remount rootfs 为 ro 等）。移植到普通分区时必须**删除或注释掉**：

```bash
# 以下代码在普通分区系统中会导致问题，必须删除：

# USERDATA_DEV="/dev/disk/by-partlabel/userdata"  ← 普通分区没有 userdata
# mount -t ext4 -o remount,ro /dev/disk/by-partlabel/rootfs /media/root-ro  ← 会把根文件系统挂载为只读！
```

**具体影响**：
- `remount,ro` 会把根文件系统重新挂载为只读，导致系统桌面崩溃、无法写操作
- 找不到 userdata 分区产生的错误日志不是致命问题，但 `remount,ro` 是致命的

**检查命令**：

```bash
# 在打包前检查
grep -n "remount,ro\|overlayroot\|userdata" /etc/rc.local
```

---

### 3.4 initrd 中的 overlayroot 脚本 🟡

overlayroot 系统通过 `update-initramfs` 生成了包含 overlayroot 脚本的特殊 initrd（`my_initrd.img` 或 `initrd.img-xxx`）。

- **如果新系统不使用这个 initrd**（boot.its 中的 `configurations` 不包含 `ramdisk = "initrd"`），则无影响
- **如果新系统仍然使用这个 initrd**，但没有 `overlayroot=` 内核参数，initrd 中的 overlayroot 脚本也不会触发，理论上是安全的

**保险做法**：确认新系统的 boot.its 或 U-Boot 环境变量没有加载 overlayroot 专用的 initrd。

---

### 3.5 overlayroot 包本身 🟢

`apt install overlayroot` 安装的只是工具脚本（`overlayroot-chroot` 等），它们本身不影响系统启动。没有内核参数触发，这些脚本只是闲置在磁盘上，不构成任何问题。**无需卸载**。

---

### 3.6 残留的挂载配置 🟡

检查 `/etc/fstab` 是否残留 overlayroot 相关的挂载项：

```bash
grep -E "root-ro|root-rw|userdata" /etc/fstab
```

如果有类似以下条目，需要删除：

```
/dev/disk/by-partlabel/userdata /media/data ext4 defaults 0 0
```

---

## 四、完整操作清单

| 步骤 | 操作 | 位置 |
|---|---|---|
| ✅ 1 | 确认打包源路径为 `/media/root-ro` | 打包脚本自动处理 |
| ✅ 2 | **删除内核 DTS 中 bootargs 的 `overlayroot=`** | 内核源码 → 重新编译 |
| ✅ 3 | **删除 `/etc/rc.local` 中 overlayroot 初始化代码** | overlayroot-chroot 或直接改底包 |
| ✅ 4 | 检查并清理 `/etc/fstab` 中的 root-ro/userdata 挂载项 | overlayroot-chroot 或直接改底包 |
| ✅ 5 | 确认新系统 boot.its 不加载 overlayroot initrd | SDK 配置文件 |
| ✅ 6 | 定期检查 `/etc/initramfs-tools/` 无 overlayroot 钩子 | 可选，不影响启动 |
| ✅ 7 | 执行打包 | `hw_export_rootfs` |

---

## 五、简易验证方法

打包完成后，在新系统上验证：

```bash
# 1. 确认没有 overlayroot 相关的内核参数
cat /proc/cmdline
# 不应包含 overlayroot=

# 2. 确认根文件系统是直接挂载的 ext4，而非 overlay
mount | grep " / "
# /dev/mmcblk0p7 on / type ext4 (rw,relatime)  ← 正常
# 不应出现 overlay, lowerdir=, upperdir=

# 3. 确认根文件系统是可读写的
touch /test_write && rm /test_write && echo "OK: writable"
```

---

## 六、参考

- [overlayroot 修改底层根文件系统并打包指南](/ubuntu-开发指南/overlayroot-修改底层根文件系统并打包指南/)
- [overlayroot 顶层同步到底层指南](/ubuntu-开发指南/overlayroot-顶层同步到底层指南/)
- [3588 只读根文件系统配置 overlayroot（防掉电损坏）](/ubuntu-开发指南/3588-只读根文件系统配置-overlayroot-防掉电损坏/)
- [hw_export_rootfs 打包脚本 (overlayroot 分支)](https://github.com/Witheart/hw_export_rootfs/tree/overlayroot)
