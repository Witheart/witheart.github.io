---
title: "update 分区计算"
date: 2025-04-01
last_modified_at: 2025-04-01
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/update-分区计算/
toc: true
---

概要：本文介绍了 RK356x 平台中 update 分区的配置与计算方法，解析 mtdparts 的语法结构、分区大小计算方式，并说明固件打包及系统识别方式。


## 1. 分区配置与语法说明  

### 1.1 mtdparts 配置语法  

配置文件路径：  
```
device/rockchip/rk356x/parameter-buildroot-fit.txt
```

内容示例：  
```
mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),
0x00020000@0x0000a000(boot),0x00020000@0x0002a000(recovery),0x00010000@0x0004a000(baseparameter),
0x00020000@0x0005a000(resource),-@0x0007a000(rootfs:grow)
```

语法格式：  
```
分区所占块数目@分区起始位置(分区名称)
```
- 每个块的大小为 512 字节（0x200）

---

## 2. 分区大小计算示例  

以 `0x00002000@0x00004000(uboot)` 为例：

- **块数量**：0x2000 = 8192 块
- **单块大小**：512 字节 = 0x200
- **总大小**：  
  0x2000 × 0x200 = 0x400000 Byte = 4096 KB = 4 MB  

详细计算过程：  
```
0x400000 Byte = (0x400000 / 0x400) KB= 0x1000 KB= 4096 KB = 4 MB
```

常用容量换算：
- 512 Byte = 0x200 Byte
- 1024 Byte = 1 KB = 0x400 Byte

---

## 3. 系统识别分区（lsblk 输出示例）  

固件烧录完成后，可通过 `lsblk` 命令查看分区：

```
mmcblk2      179:0    0  29.1G  0 disk
├─mmcblk2p1  179:1    0     4M  0 part
├─mmcblk2p2  179:2    0     4M  0 part
├─mmcblk2p3  179:3    0     4M  0 part
├─mmcblk2p4  179:4    0    64M  0 part
├─mmcblk2p5  179:5    0    64M  0 part
├─mmcblk2p6  179:6    0    32M  0 part
├─mmcblk2p7  179:7    0    64M  0 part
└─mmcblk2p8  179:8    0  28.9G  0 part /
```

说明：
- 分区大小和顺序与 `mtdparts` 中定义保持一致

---

## 4. 固件打包配置  

配置文件路径：  
```
tools/linux/Linux_Pack_Firmware/rockdev/rk356x-package-file
```

定义要打包到完整镜像中的内容：

```
# NAME             Relative path
package-file       package-file
bootloader         Image/MiniLoaderAll.bin
parameter          Image/parameter.txt
uboot              Image/uboot.img
#misc              Image/misc.img
resource           Image/resource.img
#kernel            Image/kernel.img
boot               Image/boot.img
recovery           Image/recovery.img
rootfs             Image/rootfs.ext4
#oem               Image/oem.img
#userdata          Image/userdata.img
#backup            RESERVED
#update-script     update-script
#recover-script    recover-script
baseparameter      Image/baseparameter
```

说明：
- 以 `#` 开头的行为注释，表示该项未打包
- 其他项为实际打包进镜像的文件路径和名称对应关系
