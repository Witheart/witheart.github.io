---
title: "overlayroot 顶层同步到底层指南"
date: 2026-05-25
last_modified_at: 2026-05-25
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/overlayroot-顶层同步到底层指南/
toc: true
---

如果改动要打包出来，就得使用本方式进行操作，否则改动不会影响到底层文件系统，无法打包出来。


## 注意事项
**千万不要直接把 /media/root-rw/overlay/ 里的文件拷贝到 /media/root-ro/！**

假设在系统里删除了一个底包原有的文件（比如 /etc/fstab）。
OverlayFS 并不能真的去修改只读的底包。它会在 userdata（表层）里生成一个同名的**特殊字符设备文件（性质类似于 0 字节的占位符）**，这个东西在内核术语里叫 **Whiteout（涂改液）**。
如果直接把表层的内容 cp 到底层，不但没有删掉底层的文件，反而会把一堆系统无法识别的“涂改液文件”硬塞进底包。

---

## 正确的方案：“合并层”全量同步法

既然不能拷贝表层，那我们该怎么做？
答案是：**不要去管复杂的上层和下层，我们直接把系统当前正在运行的“合并视角（/）”，反向镜像同步给底层。**

### **第一步：解锁底包分区:** 解除物理只读锁定.
   默认情况下，/media/root-ro 是被内核强制只读挂载的。我们需要先把它临时解锁为可读写：

```bash
sudo mount -o remount,rw /media/root-ro
```

### **第二步：反向同步:** 利用 rsync 的边界限制功能.
   这是最核心的一条命令。我们要把根目录 / 的内容完全克隆给底层，但必须避开所有虚拟文件系统和外置挂载点。

执行以下命令（注意参数里的 -x 极其关键）：

```bash
sudo rsync -ax --delete --exclude='/media/*' --exclude='/mnt/*' --exclude='/tmp/*' --exclude='/var/tmp/*' / /media/root-ro/
```

**参数说明：**

- -a：归档模式，保留权限、软链接和时间戳。
- **-x (one-file-system)**：它告诉 rsync 绝对不能跨越挂载点。所以它只会在 overlay 这个文件系统里游走，绝对不会钻进 /dev、/sys 甚至 /media/root-ro 导致无限循环套娃。
- --delete：如果在表层（当前系统）删除了某个文件，它会把 /media/root-ro 里对应的旧文件也物理删除。

### **第三步：清空表层数据:** 
   现在，底包已经拥有了当前系统的所有状态，我们需要把userdata格式化：

```bash
sudo rm -rf /media/root-rw/overlay/*
```

### **第四步：强制同步并重启:** 落盘与重启
   确保所有数据真实写入闪存，然后重启系统：

```bash
sync
sudo reboot
```
