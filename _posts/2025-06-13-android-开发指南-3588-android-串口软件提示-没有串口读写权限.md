---
title: "3588 Android 串口软件提示“没有串口读写权限”"
date: 2025-06-13
last_modified_at: 2025-06-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3588-android-串口软件提示-没有串口读写权限/
toc: true
---

概要：本文介绍了在 RK3588 Android 系统中，配置串口设备后，部分串口在使用串口调试软件时提示“没有串口读写权限”的问题。通过分析 /dev/ 目录下设备权限以及系统配置文件，最终定位到 ueventd.rockchip.rc 配置被其他 rc 文件覆盖，并提供了解决方法和参考补丁代码。


## 1. 问题背景  

在 RK3588 的 Android 系统中，串口已经通过设备树和 ueventd.rockchip.rc 文件进行配置，启动系统后能在 /dev/ 目录下看到 ttyS* 串口设备。使用安卓串口调试软件（如 comAssistant）进行测试时，发现部分串口可以正常使用，而另一些串口则提示“没有串口读写权限”。

尽管所有串口的配置看起来一致，还是出现了权限差异的问题。

---

## 2. 问题排查  

切换到 /dev 目录并查看串口设备权限：

```bash
cd /dev
ls -l ttyS*
```

输出示例：

```
crw-rw---- 1 bluetooth net_bt 4,  64 2025-06-13 03:01 ttyS0  
crw-rw-rw- 1 system    system 4,  67 2025-06-13 03:01 ttyS3  
crw-rw-rw- 1 system    system 4,  70 2025-06-13 03:01 ttyS6  
crw-rw---- 1 bluetooth net_bt 4,  71 2025-06-13 03:01 ttyS7  
crw-rw---- 1 bluetooth net_bt 4,  73 2025-06-13 03:01 ttyS9  
```

可以看到：

- 权限为 `crw-rw----` 的串口设备对应的所有者是 bluetooth，组是 net_bt。
- 权限为 `crw-rw-rw-` 的串口设备所有者是 system，组是 system。

这表明权限不足的串口设备，其权限被设为了仅限 bluetooth 用户组访问。

进一步排查配置文件，怀疑 ueventd.rockchip.rc 中的设置被其他文件覆盖。

使用 grep 查找其他相关配置：

```bash
grep -irn "device/rockchip/common" -e "ttyS9"
```

结果：

```
device/rockchip/common/init.connectivity.rc:24:    chmod 0660 /dev/ttyS9  
device/rockchip/common/init.connectivity.rc:33:    chown bluetooth net_bt /dev/ttyS9  
```

确认 init.connectivity.rc 文件也对 ttyS9 做了权限和所有者设置，覆盖了之前 ueventd.rockchip.rc 中的设置。

---

## 3. 解决方法  

在 device/rockchip/common 目录下，依次查找所有串口设置，并屏蔽掉会影响权限的配置。

示例命令：

```bash
grep -irn "device/rockchip/common" -e "ttyS0"
grep -irn "device/rockchip/common" -e "ttyS3"
grep -irn "device/rockchip/common" -e "ttyS6"
...
```

通过注释掉 init.connectivity.rc 中相关串口的设置，避免覆盖 ueventd.rockchip.rc 中的权限配置。

---

## 4. 参考代码  

```diff
diff --git a/device/rockchip/common/car/ueventd.rockchip.rc b/device/rockchip/common/car/ueventd.rockchip.rc
index 148fd44047..36957fd5bf 100755
--- a/device/rockchip/common/car/ueventd.rockchip.rc
+++ b/device/rockchip/common/car/ueventd.rockchip.rc
@@ -53,12 +53,12 @@
 /dev/compassirq           0660   system     system
 
 # for GPS
-/dev/ttyS7                0600   gps        gps
+#/dev/ttyS7                0600   gps        gps
 /dev/gps                  0660   gps        gps
 
 # for BT
 /dev/vflash               0660   bluetooth  net_bt
-/dev/ttyS0                0660   bluetooth  net_bt
+#/dev/ttyS0                0660   bluetooth  net_bt
 /dev/ttyS1                0660   bluetooth  net_bt
 /dev/ttyS2                0660   bluetooth  net_bt
 /dev/rtk_btusb            0660   bluetooth  net_bt
```

```diff
diff --git a/device/rockchip/common/init.connectivity.rc b/device/rockchip/common/init.connectivity.rc
index 5617e3667d..d143536298 100755
--- a/device/rockchip/common/init.connectivity.rc
+++ b/device/rockchip/common/init.connectivity.rc
@@ -17,18 +17,18 @@ on zygote-start
     chown bluetooth net_bt ro.bt.bdaddr_path
     setprop ro.bt.bdaddr_path "/data/misc/bluetooth/bdaddr"
 
-    chmod 0660 /dev/ttyS0
+#    chmod 0660 /dev/ttyS0
     chmod 0660 /dev/ttyS1
-    chmod 0660 /dev/ttyS7
+#    chmod 0660 /dev/ttyS7
     chmod 0660 /dev/ttyS8
     chmod 0660 /dev/ttyS9
     chmod 0660 /dev/vflash
     chmod 0664 /dev/vendor_storage
     chown bluetooth net_bt /dev/vflash
     chown bluetooth net_bt /dev/vendor_storage
-    chown bluetooth net_bt /dev/ttyS0
+#    chown bluetooth net_bt /dev/ttyS0
     chown bluetooth net_bt /dev/ttyS1
-    chown bluetooth net_bt /dev/ttyS7
+#    chown bluetooth net_bt /dev/ttyS7
     chown bluetooth net_bt /dev/ttyS8
     chown bluetooth net_bt /dev/ttyS9
     chown bluetooth net_bt /sys/class/rfkill/rfkill0/type
```

---
