---
title: "为什么构建根文件系统时，需要挂载proc、sysfs、dev、pts等目录"
date: 2026-06-19
last_modified_at: 2026-06-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/为什么构建根文件系统时-需要挂载proc-sysfs-dev-pts等目录/
toc: true
---

```bash
# 挂载宿主机的设备节点和系统目录
sudo mount -t proc /proc ubuntu-rootfs/proc
sudo mount -t sysfs /sys ubuntu-rootfs/sys
sudo mount -o bind /dev ubuntu-rootfs/dev
sudo mount -o bind /dev/pts ubuntu-rootfs/dev/pts

# 切换进入 ubuntu-rootfs
sudo chroot ubuntu-rootfs

```

如果没有前面这四行 `mount` 命令，直接执行 `chroot`，进入的只是一个“死”的文件仓库，很多基础命令（如 `apt`、`ps`、`ping`）都会直接报错崩溃。

## 1. 整体作用：为什么需要挂载（Mount）？

解压出来的 `ubuntu-rootfs` 目录目前仅仅是硬盘上的一堆静态文件。但是，一个正常的 Linux 系统在运行时，不仅需要硬盘上的文件，还需要和系统内核（Kernel）**以及**硬件设备（Devices）进行交互。

由于在模拟环境（x86 主机）中并没有真正启动一个 ARM64 的 Linux 内核，我们需要**把 x86 宿主机的内核接口和设备节点“借”给这个模拟系统使用**。

---

## 2. 逐行命令深度解析

### 伪文件系统挂载 (Pseudo-filesystems)

这两个目录里存放的不是硬盘上的真实文件，而是**内存中内核状态的映射**。

- `sudo mount -t proc /proc ubuntu-rootfs/proc`
- **解释：** 挂载 `proc` 文件系统。`-t proc` 指定了挂载类型。
- **作用：** `/proc` 目录包含了系统当前运行的进程信息和内核参数。在 `chroot` 后，如果运行 `ps` 查看进程，或者 `apt` 安装软件时需要检查系统锁，底层都需要读取 `/proc`。如果不挂载它，很多命令会报 "System error" 或无法获知系统状态。

- `sudo mount -t sysfs /sys ubuntu-rootfs/sys`
- **解释：** 挂载 `sysfs` 文件系统。
- **作用：** `/sys` 目录导出了内核的设备模型信息（如块设备、网络接口等硬件状态）。很多底层配置工具（比如网络配置或驱动相关工具）严重依赖它。

### 绑定挂载 (Bind Mounts)

`bind` 挂载相当于创建了一个高级的“双向同步快捷方式”，把宿主机上已经存在的目录直接映射到目标目录里。

- `sudo mount -o bind /dev ubuntu-rootfs/dev`
- **解释：** 把宿主机的 `/dev` 目录“镜像”到 `ubuntu-rootfs/dev` 中。
- **作用：** `/dev` 包含所有的设备节点。比如 `/dev/null`（黑洞设备，程序常把不需要的输出丢进这里）、`/dev/urandom`（生成随机数，加密或生成密钥时需要）、`/dev/sda`（磁盘）。如果不挂载，在 `chroot` 环境下执行任何需要写日志或生成配置的命令都可能因为找不到设备节点而卡死。

- `sudo mount -o bind /dev/pts ubuntu-rootfs/dev/pts`
- **解释：** 挂载伪终端（Pseudo-terminals）目录。
- **作用：** 当 `chroot` 进去后，需要一个交互式的 Bash 终端界面。`/dev/pts` 负责管理这些终端会话。如果在 `chroot` 里使用需要复杂终端输出的程序（比如 `nano` 编辑器，或者 `apt` 的进度条），缺少它会导致终端显示异常或程序拒绝工作。

---

## 3 警告

既然通过 `bind` 把宿主机的 `/dev` 等关键目录映射到了 `ubuntu-rootfs` 里，这意味着**在目标目录对这些文件的操作，会直接影响的 x86 主机！**

当完成系统的定制准备打包时，**退出 `chroot`（输入 `exit`）后，必须第一时间卸载这些目录**：

```bash
sudo umount ubuntu-rootfs/dev/pts
sudo umount ubuntu-rootfs/dev
sudo umount ubuntu-rootfs/sys
sudo umount ubuntu-rootfs/proc

```

**千万不要在未卸载的情况下直接 `rm -rf ubuntu-rootfs`！** 否则，会顺着 `bind` 映射，把宿主机的 `/dev`（所有硬件设备节点）给删掉，这会导致 x86 主机瞬间崩溃并无法开机（俗称“删库跑路”式的惨剧）。

## 4 把 x86 的 /dev、/proc 和 /sys 映射给 ARM64 的根文件系统不会出问题吗？

直接把 x86 的 `/dev`、`/proc` 和 `/sys` 映射给 ARM64 的根文件系统，**在绝大多数构建场景下是没有问题的，而且是必须这么做的。**

要理解为什么“没问题”，我们需要区分“真实的磁盘文件”和“内核虚拟接口”。

### 1. 我们并没有映射“真实文件”

在 `chroot` 的过程中，我们**并没有**把 x86 宿主机上的 `/bin`、`/lib`、`/usr` 这些存放真实程序和动态链接库的目录映射过去。ARM64 系统使用的依然是它自己目录下的 ARM64 库。

我们映射的 `/dev`、`/proc`、`/sys` 被称为**伪文件系统（Pseudo-filesystems）**。它们根本不在硬盘上，而是 Linux 内核在内存中实时生成的“虚拟接口”。

### 2. 内核接口是“跨架构统一”的（重点）

Linux 内核的设计非常优雅。虽然底层硬件架构（ARM vs x86）不同，但内核向上层用户空间（User Space）提供的标准接口是高度统一的。

当把 x86 宿主机的伪文件系统映射给 ARM64 模拟环境时，实际发生的事情是：

- **标准设备访问：** 当 ARM64 的 `apt` 程序需要生成随机数时，它会去读取 `/dev/urandom`。通过映射，它实际上请求了 x86 宿主机的内核。宿主机的内核不管是谁，只要收到读取 `/dev/urandom` 的标准系统调用，就会吐出一段随机数据。
- **统一的数据格式：** 无论是 x86 还是 ARM64，向 `/dev/null` 丢弃数据的逻辑是一样的，内核对 `/proc/PID/` 下进程状态的文本描述格式也是一样的。

因为最终干活的是宿主机的 Linux 内核，而内核通过 `qemu-user-static` 完美接收了这些标准化的请求。对于纯软件环境的构建（如安装软件包、修改配置文件、配置网络等），这些通用的内核接口完全够用。

---

### 3. “没问题”中的“小问题”

虽然在构建文件系统时没问题，但这种跨架构的映射并不完美。如果在 `chroot` 里面进行一些特定的查看，会发现这种“借用”带来的**视觉错乱**：

- **CPU 信息错位：** 如果在 ARM64 的 `chroot` 环境里执行 `cat /proc/cpuinfo`，终端打印出来的会是宿主机的 Intel 或 AMD CPU 信息，而不是 RK3568 的 Cortex-A55。因为 `/proc` 是宿主机内核映射过来的。
- **内核版本错位：** 执行 `uname -r`，显示的是宿主机的内核版本，而不是 RK3568 实际将要运行的内核版本。
- **无法操作特定硬件：** 不能在这个模拟环境里测试 RK3568 专属的硬件代码（比如控制 GPIO 引脚或读取 I2C 传感器）。因为宿主机的 `/sys/class/gpio` 里根本没有 RK3568 的设备树节点。
