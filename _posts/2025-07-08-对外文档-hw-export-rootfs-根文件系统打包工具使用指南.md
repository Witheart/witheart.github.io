---
title: "hw_export_rootfs 根文件系统打包工具使用指南"
date: 2025-07-08
last_modified_at: 2025-07-08
categories:
  - "对外文档"
tags:
  - "对外文档"
permalink: /对外文档/hw-export-rootfs-根文件系统打包工具使用指南/
toc: true
---

## 1 所需工具
- ext4格式U盘或SD卡（容量大于8GB）
- hw_export_rootfs工具
- ftp工具（如mobaxterm） / 另一个exfat格式的U盘

## 2 主要操作
### 2.1 步骤
- 配置好arm板的环境后，在系统下操作重启，或者系统下操作关机，再手动重启要打包根文件系统的主板（直接断电会导致有些配置项来不及写入）
- 开机状态下，主板接入ext4 U盘或SD卡
- 终端输入lsblk查看挂载位置
- 将hw_export_rootfs工具复制到ext4格式U盘或SD卡中（确保该位置没有其他内容，否则会一起打包进去）
- 进入挂载位置，执行
```bash
sudo ./hw_export_rootfs ./
```
- 输入commit信息（用于标识该版本更新的内容），比如“新安装了xx软件，更新了开机脚本”
- commit信息输入完成后，回车另起一行，输入英文下的句号`.`，然后回车，表示commit信息输入结束
- 提示是否清理snap缓存，输入y进行清理
- 等待打包完成（会提示Success），会在当前目录下生成一个.img文件，此即为打包出的根文件系统

### 2.2 打包过程示例
![alt text](/assets/images/对外文档/hw-export-rootfs-根文件系统打包工具使用指南/PixPin_2025-07-30_17-42-10.png)

## 2.3 ext4U盘或SD卡怎么制作
[https://blog.csdn.net/Beihai_Van/article/details/144788991](https://blog.csdn.net/Beihai_Van/article/details/144788991)

## 2.4 如何将img文件导出
由于ext4格式的U盘或SD卡Windows系统无法识别，故需要通过下面的方式导出：
- 方式一：接入另一个exfat格式的U盘，将打包出的根文件系统复制到该U盘中，便可通过该U盘复制到Windows主机中
- 方式二：使用ftp工具（如mobaxterm）将打包出的根文件系统直接传输到Windows主机中
- 方式三：使用DiskInternals Linux Reader，参考文章《DiskInternals Linux Reader》
- 注意：网络传输前请先在Windows主机上压缩以减少镜像大小
