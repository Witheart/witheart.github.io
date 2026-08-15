---
title: "使用dd命令填满EMMC硬盘空间指南"
date: 2026-08-11
last_modified_at: 2026-08-11
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/使用dd命令填满emmc硬盘空间指南/
toc: true
---

```bash
sudo dd if=/dev/urandom of=/mount/point/fillfile bs=1G status=progress
```

- dd：Linux/Unix 下的块级数据复制工具，按输入流逐块写到输出目标。
- if=/dev/urandom：指定输入源为 /dev/urandom，即读取系统生成的伪随机数据作为写入内容。
- of=/mount/point/fillfile：指定输出目标为一个普通文件 fillfile，位于 /mount/point 挂载点下；这里填的是文件系统路径，不是 /dev/sdX，所以不会直接覆盖整块硬盘的分区表。
- bs=1G：设置每次读写块大小为 1GiB，块越大通常顺序写入速度越快、CPU 占用越低，但剩余空间不足 1GiB 时最后一次可能会提前结束或报错。
- status=progress：让 dd 实时打印已写入字节数、速率和耗时，方便观察“把硬盘慢慢写满”的过程。
