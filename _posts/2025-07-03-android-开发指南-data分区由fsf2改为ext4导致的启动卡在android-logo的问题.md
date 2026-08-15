---
title: "data分区由fsf2改为ext4导致的启动卡在Android logo的问题"
date: 2025-07-03
last_modified_at: 2025-07-03
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/data分区由fsf2改为ext4导致的启动卡在android-logo的问题/
toc: true
---

概要：本文记录了在 Android 11（RK3568）平台上，由于 data 分区文件系统从 f2fs 修改为 ext4，导致系统启动卡在 Android logo 的问题。通过分析 logcat 报错信息和对比 fstab 配置文件的修改，最终定位并解决问题的方法是修改当前编译版型对应的 recovery.fstab 文件。  


## 1. 环境  

- Android 版本：11  
- 芯片平台：RK3568  

---

## 2. 问题背景  

应用 commit `f5b127`（将 data 分区从 f2fs 修改为 ext4）后，发现系统启动卡在 Android logo 动画界面。

查看 logcat，发现如下关键错误信息：

```logcat
Abort message: 'Check failed: chdir(data_dir.c_str()) != -1 chdir: /data/misc/credstore: No such file or directory'
```

错误信息提示找不到 `/data/misc/credstore` 目录。

---

## 3. 解决过程  

推测该问题与修改 data 分区文件系统有关。具体修改内容如下：
```diff
git --no-pager diff 7d5b55 f5b127
diff --git a/device/rockchip/common/scripts/fstab_tools/fstab.in b/device/rockchip/common/scripts/fstab_tools/fstab.in
index 04e3c9493b..2f3c58d025 100755
--- a/device/rockchip/common/scripts/fstab_tools/fstab.in
+++ b/device/rockchip/common/scripts/fstab_tools/fstab.in
@@ -23,11 +23,12 @@ ${_block_prefix}system_ext /system_ext  ext4 ro,barrier=1 ${_flags},first_stage_
 /devices/platform/${_sdmmc_device}/mmc_host*        auto  auto    defaults        voldmanaged=sdcard1:auto
 #  Full disk encryption has less effect on rk3326, so default to enable this.
 #/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev${_sync_flags},discard,reserve_root=32768,resgid=1065 latemount,wait,check,keydirectory=/metadata/vold/metadata_encryption,quota,formattable,reservedsize=128M,checkpoint=fs
-/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev,discard,reserve_root=32768,resgid=1065,fsync_mode=nobarrier latemount,wait,check,fileencryption=aes-256-xts:aes-256-cts:v2+inlinecrypt_optimized,keydirectory=/metadata/vold/metadata_encryption,quota,formattable,reservedsize=128M,checkpoint=fs
+#/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev,discard,reserve_root=32768,resgid=1065,fsync_mode=nobarrier latemount,wait,check,quota,formattable,reservedsize=128M,checkpoint=fs
 
 # for ext4
 #/dev/block/by-name/userdata /data ext4 discard,noatime,nosuid,nodev${_sync_flags},noauto_da_alloc,data=ordered,user_xattr,barrier=1    latemount,wait,formattable,check,quota,reservedsize=128M,checkpoint=block
 #/dev/block/by-name/userdata    /data      ext4    discard,noatime,nosuid,nodev${_sync_flags},noauto_da_alloc,data=ordered,user_xattr,barrier=1    latemount,wait,formattable,check,quota,reservedsize=128M,checkpoint=block
+/dev/block/by-name/userdata    /data      ext4    discard,noatime,nosuid,nodev${_sync_flags},noauto_da_alloc,data=ordered,user_xattr,barrier=1    latemount,wait,formattable,check,quota,reservedsize=128M,checkpoint=block
 
 
 #nklogo
diff --git a/device/rockchip/common/scripts/fstab_tools/fstab_go.in b/device/rockchip/common/scripts/fstab_tools/fstab_go.in
index ef331a21da..7d518b29ac 100755
--- a/device/rockchip/common/scripts/fstab_tools/fstab_go.in
+++ b/device/rockchip/common/scripts/fstab_tools/fstab_go.in
@@ -17,10 +17,11 @@ ${_block_prefix}system_ext  /system_ext ext4 ro,barrier=1 ${_flags},first_stage_
 /devices/platform/${_sdmmc_device}/mmc_host*        auto  auto    defaults        voldmanaged=sdcard1:auto
 #  Full disk encryption has less effect on rk3326, so default to enable this.
 #/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev,discard${_sync_flags},reserve_root=32768,resgid=1065 latemount,wait,check,fileencryption=aes-256-xts:aes-256-cts:v2+inlinecrypt_optimized,keydirectory=/metadata/vold/metadata_encryption,quota,formattable,reservedsize=128M,checkpoint=fs
-/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev,discard,reserve_root=32768,resgid=1065i,fsync_mode=nobarrier latemount,wait,check,fileencryption=aes-256-xts:aes-256-cts:v2+inlinecrypt_optimized,keydirectory=/metadata/vold/metadata_encryption,quota,formattable,reservedsize=128M,checkpoint=fs
+#/dev/block/by-name/userdata /data f2fs noatime,nosuid,nodev,discard,reserve_root=32768,resgid=1065i,fsync_mode=nobarrier latemount,wait,check,fileencryption=aes-256-xts:aes-256-cts:v2+inlinecrypt_optimized,keydirectory=/metadata/vold/metadata_encryption,quota,formattable,reservedsize=128M,checkpoint=fs
+
 
 # for ext4
-#/dev/block/by-name/userdata    /data      ext4    discard,noatime,nosuid,nodev,noauto_da_alloc${_sync_flags},data=ordered,user_xattr,barrier=1    latemount,wait,formattable,check,fileencryption=software,quota,reservedsize=128M,checkpoint=block
+/dev/block/by-name/userdata    /data      ext4    discard,noatime,nosuid,nodev,noauto_da_alloc${_sync_flags},data=ordered,user_xattr,barrier=1    latemount,wait,formattable,check,quota,reservedsize=128M,checkpoint=block
 
 #nklogo
 /dev/block/by-name/NKLogo    /NKLogo   ext4    discard,noatime,nosuid,nodev,noauto_da_alloc,data=ordered,user_xattr,barrier=1 latemount,wait,formattable,check,fileencryption=software,quota,reservedsize=128M,checkpoint=block
diff --git a/device/rockchip/rk356x/rk3568_HW/recovery.fstab b/device/rockchip/rk356x/rk3568_HW/recovery.fstab
index b83c0ae0a8..a1de5b9d91 100644
--- a/device/rockchip/rk356x/rk3568_HW/recovery.fstab
+++ b/device/rockchip/rk356x/rk3568_HW/recovery.fstab
@@ -9,7 +9,7 @@
 /dev/block/by-name/system_ext            /system_ext          ext4             defaults                  defaults
 /dev/block/by-name/cache                 /cache               ext4             defaults                  defaults
 /dev/block/by-name/metadata              /metadata            ext4             defaults                  defaults
-/dev/block/by-name/userdata              /data                f2fs             defaults                  defaults
+/dev/block/by-name/userdata              /data                ext4             defaults                  defaults
 /dev/block/by-name/cust                  /cust                ext4             defaults                  defaults
 /dev/block/by-name/custom                /custom              ext4             defaults                  defaults
 /dev/block/by-name/radical_update        /radical_update      ext4             defaults                  defaults

```

可以看到，最后一个修改的文件 `device/rockchip/rk356x/rk3568_HW/recovery.fstab` 与具体编译版型有关。

如果当前编译使用的版型与该文件不一致，将不会应用该修改，可能导致系统出错。

---

## 4. 解决方法  

修改当前编译版型所对应的 `recovery.fstab` 文件，使其 data 分区配置为 ext4，问题即可解决。

参考 commit：  
- `83487e`（fix: 提交“data 分区修改为 ext4”导致的卡在 Android logo 问题）
