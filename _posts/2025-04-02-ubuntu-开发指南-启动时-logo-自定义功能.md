---
title: "启动时 logo 自定义功能"
date: 2025-04-02
last_modified_at: 2025-04-02
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/启动时-logo-自定义功能/
toc: true
---

概要：本文介绍了在系统启动时自定义 Logo 的实现原理和操作方法。通过在 update.img 中添加一个格式化为 ext4 的 resource.img 分区，实现开机自动加载 Logo 的功能，并支持用户后续自行更换 Logo 图片。  


## 1. 实现原理  

update.img 中增加一个格式化为 ext4 的 resource.img 分区，用于存放 logo。系统启动时会从该分区加载 logo。由于该分区包含文件系统，会被自动挂载，用户可自行更换其中的图片。

---

## 2. 注意事项  

- resource.img 的大小和位置需依据 parameter-buildroot-fit.txt 中定义的 mtdparts 填写。  
  - 示例：`0x00020000@0x0005a000(resource)` 表示大小为 0x20000 块（每块 512 字节，共 64MB），分区从 0x0005a000 块开始。  

- 在 `rk356x-package-file` 中需指定将 resource.img 分区打包进 update.img。

---

## 3. resource.img 的生成方式  

### 3.1 自动生成  

执行 `./build.sh kernel` 时，会在 `kernel/` 目录下生成 `resource.img`，该文件自动包含了 `kernel/` 目录下的 `logo.bmp` 和 `logo_kernel.bmp`。  
- `rockdev/` 目录下创建 `resource.img` 的软链接，指向 `kernel/resource.img`。

### 3.2 手动生成  

1. 进入 `rockdev/` 目录  
2. 创建空文件：  
   ```bash
   dd if=/dev/zero of=./resource.img bs=1M count=20
   ```
3. 格式化为 ext4 文件系统：  
   ```bash
   mkfs.ext4 ./resource.img
   ```
4. 挂载该文件：  
   ```bash
   sudo mount -o loop ./resource.img ./mnt_roofs/
   ```
5. 添加 logo 图片  
6. 取消挂载：  
   ```bash
   sudo umount ./mnt_roofs
   ```
7. 打包 update.img 即可

> 说明：该方式下，resource.img 已为 ext4 文件系统。烧录完成后，系统开机会自动挂载该分区，用户可自行更换其中的 logo。

---

## 4. 示例：以 3568 Ubuntu 为例  

- Git 提交 ID：`ea921dec39a3840b647ee88373566ec20077367b`

---
```sh
commit ea921dec39a3840b647ee88373566ec20077367b
Author: Witheart <witheart.yinjim@qq.com>
Date:   Fri Mar 28 13:42:03 2025 +0800

    logo
    1. 添加了resource分区，用于存放自定义logo
    2. 添加了从分区中加载自定义logo的逻辑

diff --git a/device/rockchip/rk356x/parameter-buildroot-fit.txt b/device/rockchip/rk356x/parameter-buildroot-fit.txt
index 6fbf7cfda..25fdc0248 100644
--- a/device/rockchip/rk356x/parameter-buildroot-fit.txt
+++ b/device/rockchip/rk356x/parameter-buildroot-fit.txt
@@ -8,5 +8,5 @@ MACHINE: 0xffffffff
 CHECK_MASK: 0x80
 PWR_HLD: 0,0,A,0,1
 TYPE: GPT
-CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00020000@0x0002a000(recovery),0x00010000@0x0004a000(base
parameter),-@0x005a000(rootfs:grow))
+CMDLINE: mtdparts=rk29xxnand:0x00002000@0x00004000(uboot),0x00002000@0x00006000(trust),0x00002000@0x00008000(misc),0x00020000@0x0000a000(boot),0x00020000@0x0002a000(recovery),0x00010000@0x0004a000(base
parameter),0x00020000@0x0005a000(resource),-@0x0007a000(rootfs:grow)
 uuid:rootfs=614e0000-0000-4b53-8000-1d28000054a9
diff --git a/tools/linux/Linux_Pack_Firmware/rockdev/rk356x-package-file b/tools/linux/Linux_Pack_Firmware/rockdev/rk356x-package-file
index 96e69e8e0..b5bc81296 100644
--- a/tools/linux/Linux_Pack_Firmware/rockdev/rk356x-package-file
+++ b/tools/linux/Linux_Pack_Firmware/rockdev/rk356x-package-file
@@ -4,7 +4,7 @@ bootloader    Image/MiniLoaderAll.bin
 parameter    Image/parameter.txt
 uboot        Image/uboot.img
 #misc        Image/misc.img
-#resource    Image/resource.img
+resource    Image/resource.img
 #kernel        Image/kernel.img
 boot        Image/boot.img
 recovery    Image/recovery.img
diff --git a/u-boot/drivers/video/drm/rockchip_display.c b/u-boot/drivers/video/drm/rockchip_display.c
index 96ef65e83..b81d53c10 100644
--- a/u-boot/drivers/video/drm/rockchip_display.c
+++ b/u-boot/drivers/video/drm/rockchip_display.c
@@ -1151,6 +1151,7 @@ static int load_bmp_logo(struct logo_info *logo, const char *bmp_name)
        int ret = 0;
        int reserved = 0;
        int dst_size;
+       char cmd[128] = {"0"};
 
        if (!logo || !bmp_name)
                return -EINVAL;
@@ -1167,10 +1168,15 @@ static int load_bmp_logo(struct logo_info *logo, const char *bmp_name)
        if (!header)
                return -ENOMEM;
 
-       len = rockchip_read_resource_file(header, bmp_name, 0, RK_BLK_SIZE);
-       if (len != RK_BLK_SIZE) {
-               ret = -EINVAL;
-               goto free_header;
+       memset(cmd, 0, 128);
+       sprintf(cmd, "ext4load mmc 0:7 0x%p logo.bmp %x", header, RK_BLK_SIZE);
+       if(run_command(cmd, 0)){
+                       len = rockchip_read_resource_file(header,bmp_name, 0, RK_BLK_SIZE);
+                       printf("troy test %d\n",ret);
+                       if (len != RK_BLK_SIZE) {
+                       ret = -EINVAL;
+                       goto free_header;
+               }
        }
 
        logo->bpp = get_unaligned_le16(&header->bit_count);
@@ -1194,11 +1200,14 @@ static int load_bmp_logo(struct logo_info *logo, const char *bmp_name)
                dst = pdst;
        }
 
-       len = rockchip_read_resource_file(pdst, bmp_name, 0, size);
-       if (len != size) {
-               printf("failed to load bmp %s\n", bmp_name);
-               ret = -ENOENT;
-               goto free_header;
+       sprintf(cmd, "ext4load mmc 0:7 0x%p logo.bmp %x", pdst, size);
+       if(run_command(cmd, 0)){
+               len = rockchip_read_resource_file(pdst, bmp_name, 0, size);
+               if (len != size) {
+                       printf("failed to load bmp %s\n", bmp_name);
+                       ret = -ENOENT;
+                       goto free_header;
+               }
        }
 
        if (!can_direct_logo(logo->bpp)) {
```
