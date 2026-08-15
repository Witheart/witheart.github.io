---
title: "根文件系统打包脚本原理解析 —— hw_export_rootfs"
date: 2026-05-22
last_modified_at: 2026-05-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/根文件系统打包脚本原理解析-hw-export-rootfs/
toc: true
---

## 一、 核心原理

脚本采用的是 **文件级复制（File-level）**。
核心逻辑：创建一个合适大小的空白镜像文件 $\rightarrow$ 格式化 $\rightarrow$ 挂载为虚拟目录 $\rightarrow$ 使用 rsync 纯文件同步 $\rightarrow$ 剔除机器特定标识 $\rightarrow$ 卸载并极限压缩。

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  1. 计算大小     │────▶│  2. 创建空镜像    │────▶│  3. 格式化成ext4 │
│  du -s -k -x /  │     │  truncate/mkfs   │     │  mkfs.ext4      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  6. 卸载+优化    │◀────│  5. 清理目标系统  │◀────│  4. rsync 同步  │
│  umount         │     │  删日志/缓存/文档 │     │  拷贝所有文件    │
│  resize2fs -M   │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘

```

---

## 二、 核心工作流程与代码映射

### 第一阶段：准备与检查 (Pre-checks & Prep)

在正式打包前，脚本会进行环境校验，并尽可能压缩**当前运行系统**的体积，避免把无用的缓存打包进去。

- **权限与依赖校验**：必须是 root 权限，且依赖 rsync 工具。

```bash
[[ $UID -ne 0 ]] && echo -e "\033[31m should run as root \033[0m" && showhelp
[[ -n "$(which rsync)" ]] || { echo -e " rsync not found\n\033[31m apt install rsync \033[0m"; exit -1; }

```

- **交互式获取版本信息**：通过循环读取用户输入，支持多行 Commit Message，作为构建记录。

```bash
while IFS= read -r line; do
    [[ "$line" == "." ]] && break
    [[ -n "$line" ]] && commit_message+="${line}"$'\n'
done
```

- **源系统“瘦身”与防抱死检测**：清理 APT/Snap 缓存，并专门检测远程控制软件（如 ToDesk）创建的死锁文件。

```bash
# 清理APT
apt-get clean -y
# 检测 fuse 文件，防止打包在读取该文件时卡死
local fuse_path="/tmp/fuse"
if [[ "$err_msg" =~ "权限不够" || "$err_msg" =~ "Permission denied" ]]; then
    # 抛出警告并退出，要求用户关闭远程软件
    exit 1
fi
```

### 第二阶段：镜像空间计算与创建 (Allocation)

计算当前系统的实际大小，申请一个略大于该容量的空白镜像文件。

- **容量评估与预留**：计算源目录大小（KB转MB），并额外增加 **10% + 300MB** 的安全余量。

```bash
ROOTFS_SIZE=`du -s -k $ROOTFS_MOUNTPOINT | awk '{print $1}'`
IMAGE_SIZE=$((ROOTFS_SIZE>>10))
IMAGE_SIZE=$((IMAGE_SIZE+IMAGE_SIZE/10+300))
```

- **创建虚拟盘并格式化（以 ext4 为例）**：根据文件数量（Inode）分配块大小，并挂载到临时目录。

```bash
# 创建临时挂载目录
TEMP_MOUNT_POINT=`mktemp -d -p $DEST_PATH`

# 根据公式计算 Inode 和 Block 数量，并格式化镜像文件
mkfs.ext4 -Fq -L rootfs -b 1024 -I 128 -N $INODE_COUNT $IMAGE_FILE $BLOCK_COUNT

# 将镜像文件作为“磁盘”挂载到临时目录
mount $IMAGE_FILE $TEMP_MOUNT_POINT
```

### 第三阶段：核心同步 (Synchronization)

这是整个脚本的灵魂所在，使用 rsync 进行文件系统层面的完整克隆。

- **执行 rsync 同步**：
  - -x 参数确保只复制当前文件系统，不越界复制虚拟内存（如 /proc）或外接 U 盘。
  - --exclude 巧妙地排除了正在生成的镜像文件和挂载点，防止无限套娃。

```bash
rsync -aqx --delete --exclude={"$IMAGE_FILE","$TEMP_MOUNT_POINT"} ${ROOTFS_MOUNTPOINT}/ ${TEMP_MOUNT_POINT}/
```

### 第四阶段：镜像内数据“脱敏”与清理 (Target Scrubbing)

由于克隆的是本机系统，脚本必须清理挂载点（目标镜像）内的特征数据，使其变成一个通用的初始镜像。

- **抹除机器特征与重置状态**：

```bash
# 重置开机初始化标记
rm -f "${ROOT_DIR}/etc/firstboot_done"
# 删除 ToDesk 注册文件，防止多台机器烧录后识别码冲突（顶号）
rm -f "${ROOT_DIR}/etc/todesk/reg.conf"
```

- **深度清理运行时日志**：清理生成的巨大日志文件，进一步缩小镜像。

```bash
# 清空普通日志和打包过程产生的 tmp
find ${ROOT_DIR}/var/log/ -type f -exec truncate -s 0 {} \;
rm -rf ${ROOT_DIR}/tmp/*
# 清理 systemd journal 日志
rm -rf ${ROOT_DIR}/var/log/journal/*
```

- **打上版本烙印**：将第一阶段填写的 Commit 信息写入镜像内部。

```bash
{
    echo "# 系统构建信息 - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "COMMIT_MESSAGE=\"${commit_message}\""
    echo "KERNEL_VERSION=\"$(uname -r)\""
} | tee -a "$BUILD_INFO" >/dev/null
```

### 第五阶段：封包与极限压缩 (Sealing & Shrinking)

打包结束后的收尾工作，利用 ext4 的特性将文件系统压缩。

- **卸载与异常捕获**：使用 trap 确保即使中途报错退出，也会执行 finish 函数卸载虚拟盘。

```bash
set -e
trap finish ERR INT  # 绑定中断信号
...
# 正常结束时取消捕获并卸载
set +e
trap - ERR
umount_img
```

- **压缩 (resize2fs)**：因为第二阶段多预留了 10%+300M 的空间，这里将它压榨干，让输出的 .img 文件最小化。

```bash
if [[ "${STORE_FS_TYPE}" == "ext4" ]]; then
# 检查并修复文件系统
e2fsck -fy ${IMAGE_FILE}
# -M 参数：将文件系统缩小到其容纳文件所需的最小尺寸
resize2fs -M ${IMAGE_FILE}
# 设置遇到错误时以只读方式挂载，增加系统鲁棒性
tune2fs -C 1 -c 0 -i 0 -e "remount-ro" ${IMAGE_FILE}
fi
```
