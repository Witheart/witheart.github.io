---
title: "编译sdk过程记录"
date: 2026-03-01
last_modified_at: 2026-03-01
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/编译sdk过程记录/
toc: true
---

### 2. `lunch rk3568_r-userdebug`
这个命令用于选择 Android 构建的目标设备和构建配置。

![alt text](/assets/images/android-sdk编译指南/编译sdk过程记录/image.png)

- **`rk3568_r-userdebug`**:
  这是一个具体的构建目标，通常由以下几个部分组成：
  
  - **`rk3568`**:
    设备的代号，表示要构建的目标硬件平台。在这里，`rk3568` 可能是基于 Rockchip RK3568 芯片的开发板或设备。
  
  - **`r`**:
    Android 的版本代号。`r` 通常表示 Android 11（R）。
  
  - **`userdebug`**:
    构建类型。Android 构建系统支持以下三种主要构建类型：
    - **`user`**: 适用于发布的最终版本，启用了更多的安全限制和优化。
    - **`userdebug`**: 类似于 `user` 构建，但保留了调试功能，适用于开发和测试。
    - **`eng`**: 工程师版本，启用了所有的调试功能，适合开发者调试代码。

#### **执行后发生了什么**：
运行 `lunch rk3568_r-userdebug` 后，以下内容会被设置：
1. 确定了目标设备（`rk3568`）。
2. 确定了 Android 版本（`r`）。
3. 确定了构建类型（`userdebug`）。
4. 构建过程中所需的环境变量被设置，例如：
   - `TARGET_PRODUCT`
   - `TARGET_BUILD_VARIANT`
   - `TARGET_BUILD_TYPE`


u-boot.bin在u-boot文件夹下


可能需要选择电源域电压配置，建议按照“工控ARM软硬件接口文件_20231226.xlsx”选择
![alt text](/assets/images/android-sdk编译指南/编译sdk过程记录/电源配置.png)

编译过程中出现了错误
...
HOST_OS_EXTRA=Linux-5.15.0-124-generic-x86_64-Ubuntu-20.04.6-LTS
HOST_CROSS_OS=windows
HOST_CROSS_ARCH=x86
HOST_CROSS_2ND_ARCH=x86_64
HOST_BUILD_TYPE=release
BUILD_ID=RD2A.211001.002
OUT_DIR=out
============================================
[100% 190/190] out/soong/.bootstrap/bin/soong_build out/soong/build.ninja
FAILED: out/soong/build.ninja
out/soong/.bootstrap/bin/soong_build -t -l out/.module_paths/Android.bp.list -b out/soong -n out -d out/soong/build.ninja.d -globFile out/soong/.bootstrap/build-globs.ninja -o out/soong/build.ninja Android.bp
libRkTeeWeaver want to conditional Compile
libcameradevice want to conditional Compile
libgralloc_priv want to conditional Compile
libmpimmz conditional Compile
librga want to conditional Compile
librockit want to conditional Compile
Rockchip conditional compile
Optee Version: v2
[hardware/rockchip/libgralloc/bifrost frameworks/native/include system/core/libsync system/core/libsync/include external/libdrm/include/drm] 30
>>>>>>>>>>>>>>>>>>>>> rk356x
libcameradevice curr board is rk356x
error: external/angle/Android.bp:56:1: module "libfeature_support_angle" variant "android_arm64_armv8-a_cortex-a55_shared": module source path "external/angle/third_party/jsoncpp/source/include" does not exist
error: external/angle/Android.bp:56:1: module "libfeature_support_angle" variant "android_arm64_armv8-a_cortex-a55_shared": module source path "external/angle/third_party/jsoncpp/source/include" does not exist
18:02:16 soong bootstrap failed with: exit status 1

#### failed to build some targets (44 seconds) ####

Build android failed!


错误提示表明，模块 libfeature_support_angle 中引用的路径 external/angle/third_party/jsoncpp/source/include 不存在

目前的解决方式：
在external/jsoncpp中查找include文件夹复制到external/angle/third_party/jsoncpp/source/中

jsoncpp的github地址：https://github.com/open-source-parsers/jsoncpp



编译了4小时
![alt text](image-1.png)
