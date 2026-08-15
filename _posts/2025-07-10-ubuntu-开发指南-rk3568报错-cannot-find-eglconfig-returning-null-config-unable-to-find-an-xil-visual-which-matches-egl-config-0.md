---
title: "rk3568报错：Cannot find EGLConfig, returning null config Unable to find an Xil visual which matches EGL config 0"
date: 2025-07-10
last_modified_at: 2025-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3568报错-cannot-find-eglconfig-returning-null-config-unable-to-find-an-xil-visual-which-matches-egl-config-0/
toc: true
---

## 问题背景
- rk3568
- Ubuntu 20.04
- firefly用户直接运行hp-setup，不会报错；而自定义的用户运行则报错：
```bash
arm_release_ver:g13p0-01eac0, rk_so_ver: 10
Cannot find EGLConfig, returning null config
Unable to find an Xil visual which matches EGL config 0
segment fault
```
![alt text](/assets/images/ubuntu-开发指南/rk3568报错-cannot-find-eglconfig-returning-null-config-unable-to-find-an-xil-visual-which-matches-egl-config-0/image.png)

## 解决方式
参考：[https://forum.neardi.com/d/32-rk3588-ubuntu2004xi-tong-yun-xing-ying-yong-bao-cannot-find-eglconfigcuo-wu](https://forum.neardi.com/d/32-rk3588-ubuntu2004xi-tong-yun-xing-ying-yong-bao-cannot-find-eglconfigcuo-wu)

- LD_LIBRARY_PATH没有正确设置，验证若没有问题后加入~/.profile后重启设备

```bash
export LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/
```

## 更深一层
后续我发现，运行正常的用户LD_LIBRARY_PATH变量也是空的，也就是说，其也没有显式导出LD_LIBRARY_PATH变量，那为什么可以运行正常呢？
原因是系统还有一个/etc/ld.so.conf.d/aarch64-linux-gnu.conf文件，其中配置了/usr/lib/aarch64-linux-gnu，如下：
```bash
KangHua@user:~$ cat /etc/ld.so.conf.d/aarch64-linux-gnu.conf
# Multiarch support
/usr/local/lib/aarch64-linux-gnu
/lib/aarch64-linux-gnu
/usr/lib/aarch64-linux-gnu

```
推测当LD_LIBRARY_PATH被显式设置时，便不会在/etc/ld.so.conf.d/aarch64-linux-gnu.conf文件中找。

最好是将要显式设置的LD_LIBRARY_PATH加入该文件中。

## 更更深一层
在运行系统下qmake编译出来的qt软件时，即使在/etc/ld.so.conf.d/aarch64-linux-gnu.conf中配置了/usr/lib/aarch64-linux-gnu/，也会报同样的错误。

- ldconfig可以看到/usr/lib/aarch64-linux-gnu/路径是在的
```bash
root@user:~# ldconfig -p | grep /usr/lib/aarch64-linux-gnu/
        libgbm.so.1 (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libgbm.so.1
        libgbm.so (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libgbm.so
        libMaliOpenCL.so.1 (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libMaliOpenCL.so.1
        libMaliOpenCL.so (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libMaliOpenCL.so
        libGLESv2.so.2 (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libGLESv2.so.2
        libGLESv2.so (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libGLESv2.so
        libGLESv1_CM.so.1 (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libGLESv1_CM.so.1
        libGLESv1_CM.so (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libGLESv1_CM.so
        libEGL.so.1 (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libEGL.so.1
        libEGL.so (libc6,AArch64) => /usr/lib/aarch64-linux-gnu/mali/libEGL.so
```

如果显式导出，则可以解决问题：
export LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/

推测是qt程序运行时没在系统的动态链接库缓存中寻找。
