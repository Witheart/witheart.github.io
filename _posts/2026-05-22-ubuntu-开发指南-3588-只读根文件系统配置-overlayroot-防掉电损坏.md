---
title: "3588 只读根文件系统配置 overlayroot（防掉电损坏）"
date: 2026-05-22
last_modified_at: 2026-05-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-只读根文件系统配置-overlayroot-防掉电损坏/
toc: true
---

参考链接：
https://blog.csdn.net/Yongheng6/article/details/145373026

## 0 overlayfs原理

### 0.1 原理解析

OverlayFS 是 Linux 内核原生支持的一种联合文件系统（Union Mount File System）。它的核心运作机制可以生动地比喻为“在原画上盖了一层透明玻璃”。

在 OverlayFS 的架构中，根目录（/）不再是一个单一的物理硬盘分区，而是由几个独立的层“叠”在一起合并而成的幻象：

| 核心层（术语）      | 在我们系统中的物理形态                  | 核心作用                                                                                                     |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Lowerdir** (下层) | 烧录了 16GB 底包的 rootfs 物理分区      | **绝对只读**（Read-Only）。提供所有基础的系统文件和二进制库。一旦挂载，任何程序都无法向其写入哪怕 1 个字节。 |
| **Upperdir** (上层) | 内存 (tmpfs) 或物理磁盘的 userdata 分区 | **完全可读写**（Read-Write）。它是那层“透明玻璃”，专门用来拦截并拦截所有对文件系统的修改。                   |
| **Merged** (合并层) | 操作系统最终看到的 / 根目录             | **合并幻象**。把下层的文件和上层的修改无缝拼接到一起，呈现给上层的 DBus、桌面环境和所有用户进程。            |

**它的三种核心拦截动作：**

1. **读（Read）**：如果读取一个未修改过的原厂文件，视线会穿透玻璃（Upperdir），直接读取底层（Lowerdir）的物理文件。
2. **写/改（Copy-up）**：当系统试图修改底包里的某个文件时，OverlayFS 会触发 **Copy-up（向上复制）** 机制。它会先把这个文件从底层静默拷贝到上层（玻璃上），然后所有的修改都只发生在玻璃上的这个副本里。底层文件原封不动。
3. **删（Whiteout）**：当系统试图删除一个基础文件时，OverlayFS 不会（也不能）去删底层文件。它会在上层（玻璃上）创建一个同名的特殊隐藏文件，叫做 **Whiteout（涂改液）**。系统看到这个涂改液，就会认为该文件已被删除。

### 0.2 两种模式

1. 内存只读测试模式（重启即清空），将读写层建立在物理内存（RAM）上，不依赖任何多余的硬盘分区，适合前期验证或绝对的 Kiosk 广告机模式：**rootfs(overlayroot)**
2. 只读根文件系统+可读数据分区，将底层系统锁死为只读，并将所有的写入操作全部重定向到一个独立的大分区（名字叫 userdata）。断电不坏系统，且用户数据不丢：**rootfs(overlayroot) + userdata(ext4, 可读)**

## 1 获取并准备包含 Overlay 驱动的 initrd 镜像

### 1.1 为什么需要initrd镜像

疑问：既然 Linux 内核自带 OverlayFS，为什么我不能直接进系统后再用 mount 命令把它挂载上？

答案是：**根目录 (/) 是系统的基石，在系统启动后，你无法把正在运行的根目录“凭空抽走”换成一个 Overlay 幻象。**

因此，我们必须借助 initramfs。

1. 内核启动后，首先挂载并运行这个纯内存里的微型系统（initramfs）。
2. 内存系统里的 overlayroot 脚本在内存里先把 rootfs 分区只读挂载好（作为 Lower），再把 tmpfs 或 userdata 挂载好（作为 Upper），并调用内核的 OverlayFS 把它们拼在一起。
3. **关键一步（switch_root）**：拼装完成后，内存系统将系统的控制权彻底移交给这层拼装好的“幻象根目录”。

### 1.2 initrd 镜像的获取方式

5. 在开发板当前的 Ubuntu 系统中，通过 apt install overlayroot 安装底层包。
6. 运行 update-initramfs -c -k $(uname -r)，在板子的 /boot/ 目录下生成带有 overlayroot 拦截脚本的内存盘镜像（例如 initrd.img-5.10.160+）。
7. 将该文件拷贝到 PC 宿主机 RK3588 SDK 的**根目录**下，并重命名为 **my_initrd.img**。
   _(注意：需要放在根目录且避开 ramdisk 关键字，是为了防止触发 RK 构建系统的自动注入冲突，如果名称改为ramdisk.img放在kernel下，直接改boot.its会报错，不改时显示打包了但是实际上又没有正确打包。)_

---

## 2 修改 FIT 镜像打包配方 (boot.its)

RK3588 采用了高级的 Flattened Image Tree (FIT) 启动架构。我们需要通过修改原厂的 .its 文件，合法地将 my_initrd.img 打包进去。

使用如下代码添加打印，验证使用了FIT启动架构

```diff
diff --git a/device/rockchip/common/build.sh b/device/rockchip/common/build.sh
index c85f18cbe..3da4f28be 100755
--- a/device/rockchip/common/build.sh
+++ b/device/rockchip/common/build.sh
@@ -650,6 +650,7 @@ function build_kernel(){
 	echo "TARGET_KERNEL_CONFIG =$RK_KERNEL_DEFCONFIG"
 	echo "TARGET_KERNEL_DTS    =$RK_KERNEL_DTS"
 	echo "TARGET_KERNEL_CONFIG_FRAGMENT =$RK_KERNEL_DEFCONFIG_FRAGMENT"
+	echo "[Witheart] RK_KERNEL_FIT_ITS				=$RK_KERNEL_FIT_ITS"
 	echo "=========================================="

 	build_check_cross_compile
@@ -658,6 +659,7 @@ function build_kernel(){
 	make ARCH=$RK_ARCH $RK_KERNEL_DEFCONFIG $RK_KERNEL_DEFCONFIG_FRAGMENT
 	make ARCH=$RK_ARCH $RK_KERNEL_DTS.img -j$RK_JOBS
 	if [ -f "$TOP_DIR/device/rockchip/$RK_TARGET_PRODUCT/$RK_KERNEL_FIT_ITS" ]; then
+		echo "[Witheart] Rebuild fitImage with $RK_KERNEL_FIT_ITS"
 		$COMMON_DIR/mk-fitimage.sh $TOP_DIR/kernel/$RK_BOOT_IMG \
 			$TOP_DIR/device/rockchip/$RK_TARGET_PRODUCT/$RK_KERNEL_FIT_ITS
 	fi

```

找到你板子对应的 .its 文件（如 device/rockchip/RK_TARGET_PRODUCT/boot.its），进行以下修改：

**1. 在 images { ... } 块的末尾，追加 initrd 节点：**

```diff
diff --git a/device/rockchip/rk3588/boot.its b/device/rockchip/rk3588/boot.its
index d24396401..6f8d19bee 100644
--- a/device/rockchip/rk3588/boot.its
+++ b/device/rockchip/rk3588/boot.its
@@ -45,6 +45,19 @@
                 algo = "sha256";
             };
         };
+
+        initrd {
+            description = "Ubuntu overlayroot ramdisk";
+            data = /incbin/("../my_initrd.img");
+            type = "ramdisk";
+            arch = "arm64";
+            os = "linux";
+            compression = "none";
+            load = <0xffffff02>;
+            hash {
+                algo = "sha256";
+            };
+        };
     };

     configurations {
@@ -55,12 +68,13 @@
             fdt = "fdt";
             kernel = "kernel";
             multi = "resource";
+            ramdisk = "initrd";

             signature {
                 algo = "sha256,rsa2048";
                 padding = "pss";
                 key-name-hint = "dev";
-                sign-images = "fdt", "kernel", "multi";
+                sign-images = "fdt", "kernel", "multi", "initrd";
             };
         };
     };

```

---

## 3 在内核设备树 (.dts) 中硬编码启动参数

**避坑指南：** 3588会使用设备树中的 chosen 节点硬编码的 bootargs

打开内核设备树源文件（如 kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A.dts），找到 chosen 节点，修改 bootargs。

这里分为“内存验证模式”**和**“量产数据持久化模式”两种写法，**切记必须保留 rw 参数，否则 systemd 会把覆盖层重新锁死为只读，导致桌面崩溃。**

### 选项 A：内存只读测试模式（重启即清空）

将读写层建立在物理内存（RAM）上，不依赖任何多余的硬盘分区。适合前期验证或绝对的 Kiosk 广告机模式：

```diff
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
index b1ec42e12..aa85e0554 100755
--- a/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK-6A13_V0A_linux.dtsi
@@ -12,7 +12,7 @@
    };

    chosen: chosen {
-		bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTUUID=614e0000-0000 rw rootwait  net.ifnames=0";
+		bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTLABEL=rootfs rootfstype=ext4 rw rootwait overlayroot=tmpfs net.ifnames=0";
    };

    cspmu: cspmu@fd10c000 {
```

### 选项 B：只读根文件系统+可读数据分区

将底层系统锁死为只读，并将所有的写入操作全部重定向到一个独立的大分区（名字叫 userdata）。断电不坏系统，且用户数据不丢：

```dts
	chosen: chosen {
		bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTLABEL=rootfs rootfstype=ext4 rw rootwait overlayroot=device:dev=/dev/disk/by-partlabel/userdata,fstype=ext4,mkfs=1 net.ifnames=0";
	};

```

_(注：使用选项 B 前，需确保 parameter.txt 中已实际划分出 userdata 分区，mkfs=1 会在第一次开机时自动帮你格式化它。)_

---

## 4 parameter.txt 修改

### 4.1 无userdata情况

```diff
diff --git a/device/rockchip/rk3588/parameter.txt b/device/rockchip/rk3588/parameter.txt
index 923da7bad..5d370c883 100644
--- a/device/rockchip/rk3588/parameter.txt
+++ b/device/rockchip/rk3588/parameter.txt
@@ -8,6 +8,5 @@ MACHINE: 0xffffffff
 CHECK_MASK: 0x80
 PWR_HLD: 0,0,A,0,1
 TYPE: GPT
-CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00040000@0x0002a000(recovery),0x00010000@0x0006a000(baseparameter),-@0x0007a000(rootfs:grow)
-uuid:rootfs=614e0000-0000-4b53-8000-1d28000054a9
-uuid:boot=7A3F0000-0000-446A-8000-702F00006273
+CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00040000@0x0002a000(recovery),0x00010000@0x0006a000(baseparameter),-@0x0007a000(rootfs:grow) ro rootwait root=PARTLABEL=rootfs rootfstype=ext4 overlayroot=tmpfs net.ifnames=0
+uuid:boot=7A3F0000-0000-446A-8000-702F00006273
\ No newline at end of file
```

### 4.2 使用userdata的情况

```diff
diff --git a/device/rockchip/rk3588/parameter.txt b/device/rockchip/rk3588/parameter.txt
index 923da7bad..68a7f8daf 100644
--- a/device/rockchip/rk3588/parameter.txt
+++ b/device/rockchip/rk3588/parameter.txt
@@ -8,6 +8,5 @@ MACHINE: 0xffffffff
 CHECK_MASK: 0x80
 PWR_HLD: 0,0,A,0,1
 TYPE: GPT
-CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00040000@0x0002a000(recovery),0x00010000@0x0006a000(baseparameter),-@0x0007a000(rootfs:grow)
-uuid:rootfs=614e0000-0000-4b53-8000-1d28000054a9
-uuid:boot=7A3F0000-0000-446A-8000-702F00006273
+CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00040000@0x0002a000(recovery),0x00010000@0x0006a000(baseparameter),0x1400000@0x0007a000(rootfs),-@0x0147a000(userdata:grow)
+uuid:boot=7A3F0000-0000-446A-8000-702F00006273
\ No newline at end of file
```

## 5 内核编译选项

```diff
diff --git a/kernel/arch/arm/configs/rockchip_linux_defconfig b/kernel/arch/arm/configs/rockchip_linux_defconfig
index 23ab6955b..fdf947ff4 100644
--- a/kernel/arch/arm/configs/rockchip_linux_defconfig
+++ b/kernel/arch/arm/configs/rockchip_linux_defconfig
@@ -523,3 +523,5 @@ CONFIG_FUNCTION_TRACER=y
 CONFIG_BLK_DEV_IO_TRACE=y
 CONFIG_STRICT_DEVMEM=y
 # CONFIG_RUNTIME_TESTING_MENU is not set
+
+CONFIG_OVERLAY_FS=y

```

## 6 开机脚本的修改
/etc/rc.local中，增加格式化userdata分区以及挂载根文件系统为ro

放在开机脚本的最前面：
```bash
#overlayfs
USERDATA_DEV="/dev/disk/by-partlabel/userdata"

# 定义一个标志，决定后续是否执行 overlayfs 的挂载逻辑
OVERLAY_ENABLED=0

# 1. 检查分区设备节点是否存在
if [ -b "$USERDATA_DEV" ]; then
    # 2. 设备存在时，检查是否已经格式化为 ext4
    if ! blkid "$USERDATA_DEV" | grep -q 'TYPE="ext4"'; then
        echo "[witheart] First boot detected: Formatting userdata partition..." > /dev/kmsg

        # 3. 尝试格式化
        if mkfs.ext4 -F -L userdata "$USERDATA_DEV"; then
            echo "[witheart] Format complete. Rebooting system to apply overlayfs..." > /dev/kmsg
            reboot
            exit 0
        else
            # 格式化失败：不能使用 overlay，维持标志为 0
            echo "[witheart] ERROR: Failed to format $USERDATA_DEV. Bypassing overlayroot..." > /dev/kmsg
        fi
    else
        # 设备存在且已经是 ext4，满足构建 overlay 的条件
        OVERLAY_ENABLED=1
    fi
else
    # 设备不存在：不能使用 overlay，维持标志为 0
    echo "[witheart] WARNING: Partition $USERDATA_DEV not found. Bypassing overlayroot..." > /dev/kmsg
fi

# OverlayRoot 核心挂载逻辑
if [ "$OVERLAY_ENABLED" -eq 1 ]; then
    echo "[witheart] Userdata ready. Preparing overlayfs environment..." > /dev/kmsg
    
    # 满足条件，将 rootfs 挂载为只读 (lowerdir)
    mount -t ext4 -o remount,ro /dev/disk/by-partlabel/rootfs /media/root-ro
else
    # 不满足 overlay 条件，直接跳过只读挂载，进入普通模式
    echo "[witheart] System will boot in standard RW mode (No overlayroot)." > /dev/kmsg
    # 此时 rootfs 会保持开机默认的状态（通常是可读写的）继续启动
fi
```

参考《使用overlayroot时root-ro被挂载为ro的bug》、《overlayroot userdata分区，首次启动没有格式化导致无法挂载的问题》
