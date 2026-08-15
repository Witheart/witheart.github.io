---
title: "overlayroot 直接修改底层文件指南 —— 仅限命令行"
date: 2026-06-11
last_modified_at: 2026-06-11
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-直接修改底层文件指南-仅限命令行/
toc: true
---

## 1 注意事项

overlayroot 将真正的根文件系统保护成了只读状态，如果你需要进行永久性的系统维护（比如使用 apt 更新软件包、修改网络配置或更新内核），普通的写入操作只会作用于覆盖层。可以使用overlayroot-chroot 命令穿透覆盖层，修改底层的根文件系统。

- 如果要修改根文件系统并且重新打包，这种做法是必不可少的
- 但是该方法只在当前命令行生效，如果使用mobaxterm的sftp，则无法生效
- 如果一些修改难以在命令行实现，推荐手动在桌面修改后，参考《overlayroot 顶层同步到底层指南》同步到底层的根文件系统

## 2 使用方式

### 2.1 第一步：穿透防护层，进入底包

在你当前正常使用的系统终端中，输入以下命令：

```bash
sudo overlayroot-chroot

```

**底层发生了什么：** 系统会在后台自动把物理底层（`/dev/mmcblk0p7`）临时解锁为可读写（`rw`），并把你切换到一个完全纯净的底包隔离环境中。此时，你平时在桌面上产生的那些垃圾文件、缓存，在这里统统“看不见”。

### 2.2 第二步：修改文件

在这个环境中，你拥有最高权限，且所有的修改都会直接刻录在底层的物理闪存上。
你可以像平时使用 Ubuntu 一样进行修改。比如：

```bash
# 假设你要修改这两个文件
nano /etc/systemd/system/my-custom.service
nano /usr/local/bin/my-script.sh

# 如果你需要修改权限，也直接在这里做
chmod +x /usr/local/bin/my-script.sh

```

### 2.3 第三步：退出穿透环境并落盘

文件修改完毕、保存后，**必须**退出这个环境，让系统重新把底包安全锁死。

```bash
# 退出底包环境
exit

# 强制将内存中的数据同步到物理磁盘，确保万无一失
sync

```

**底层发生了什么：**
当你敲下 `exit` 时，脚本会自动把底包重新挂载回只读（`ro`）状态，恢复防断电的终极形态。

## 3 原理解析

实际上，overlayroot-chroot是一个脚本，位于/usr/sbin/overlayroot-chroot。让我们解析下这个脚本：

### 3.1 寻找真正的底层文件系统 (`get_lowerdir` 函数)

```bash
get_lowerdir() {
        local overlay=""
        overlay=$(awk \
                '$1 == "overlayroot" && $2 == "/" { print $0 }' /proc/mounts)
        if [ -n "${overlay}" ]; then
                lowerdir=${overlay##*lowerdir=}
                lowerdir=${lowerdir%%,*}
                # ... 省略部分代码 ...
}

```

- **原理解析：** 脚本首先需要知道真正的物理根目录藏在哪。它通过读取内核提供的 `/proc/mounts` 挂载信息，寻找挂载点为 `/` 且类型为 `overlayroot` 的那一行。
- **提取路径：** 找到后，利用 Bash 的字符串截取功能（`${overlay##*lowerdir=}` 和 `${lowerdir%%,*}`），把 `lowerdir=` 后面的具体路径（比如 `/media/root-ro`）提取出来，并赋值给全局变量 `lowerdir`。

### 3.2 准备虚拟文件系统与安全机制 (Bind Mounts & Trap)

```bash
mounts=
for d in proc run sys; do
        if ! mountpoint "${lowerdir}/${d}" >/dev/null; then
                mount -o bind "/${d}" "${lowerdir}/${d}" || fail "Unable to bind /${d}"
                mounts="$mounts $lowerdir/$d"
                trap "clean_exit \"${mounts}\" || true" EXIT HUP INT QUIT TERM
        fi
done

```

- **挂载核心目录：** 找到底层目录后，脚本使用 `for` 循环，把当前运行系统中的 `/proc`、`/run`、`/sys` 目录，通过 `mount -o bind` “映射”到底层对应的目录中去。这确保了等会儿切换环境后，那些需要依赖内核信息的命令（如 `apt`、`dpkg`）能正常运行。_(注：脚本中没有单独挂载 `/dev`，因为有些系统的 overlayroot 配置中 dev 是共享的或者在外部处理了)_。
- **安全捕获 (Trap)：** `trap` 这一行非常关键。它告诉系统：“不管我是正常退出 (`EXIT`)，还是被人强行中断 (`INT` / `Ctrl+C`)，你都必须去执行 `clean_exit` 帮我擦屁股”。这防止了意外中断导致底层文件系统暴露或挂载残留。

### 3.3 解除写保护 (`Remount rw`)

```bash
# Remount with read/write
for mp in "$lowerdir" $recurse_mps; do
        mount -o remount,rw "${mp}" &&
                REMOUNTS="$mp $REMOUNTS" ||
                fail "Unable to remount [$mp] writable"
done

```

- **原理解析：** 此时底层的物理分区还是只读 (`ro`) 的。脚本通过 `mount -o remount,rw` 将其重新挂载为读写模式。
- 它还会把所有成功改为读写状态的挂载点记录在 `REMOUNTS` 变量中，方便退出时挨个恢复。

### 3.4 切换根目录 (The Chroot)

```bash
info "Chrooting into [${lowerdir}]"
chroot ${lowerdir} "$@"

```

- **原理解析：** 这是整个脚本的高潮。调用系统的 `chroot` 命令，将当前的 Shell 环境“沉浸”到刚才准备好的 `lowerdir` 中。
- **参数传递：** 注意末尾的 `"$@"`。这意味着你可以直接带参数运行，比如执行 `overlayroot-chroot apt update`，脚本会自动把 `apt update` 传递进 chroot 环境中执行，执行完就退出，非常适合自动化脚本调用。如果什么参数都不带，默认就会给你打开一个交互式的 shell。

### 3.5 清理与恢复 (`clean_exit` 函数)

```bash
clean_exit() {
        local mounts="$1" rc=0 d="" lowerdir="" mp=""
        for d in ${mounts}; do
                if mountpoint ${d} >/dev/null; then
                        umount ${d} || rc=1
                fi
        done
        for mp in $REMOUNTS; do
                mount -o remount,ro "${mp}" ||
                        error "Note that [${mp}] is still mounted read/write"
        done
        # ...
}

```

- **原理解析：** 当你输入 `exit` 离开 chroot，或者执行的命令结束时，触发退出流程。
- `clean_exit` 会把前面绑定的 `/proc`、`/run`、`/sys` 全部 `umount` 卸载掉。
- 最重要的是，它会遍历 `REMOUNTS` 变量，通过 `mount -o remount,ro` 将物理分区**重新锁死为只读状态**，恢复 `overlayroot` 的保护伞。
