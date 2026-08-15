---
title: "多设备树 build.sh修改 与打包解析"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/多设备树-build-sh修改-与打包解析/
toc: true
---

概要：本文主要介绍如何修改 build.sh 脚本以支持多设备树的编译与打包，适用于 Android 平台。内容包括设备树的编译流程、resource.img 和 boot.img 的构建逻辑，以及 ./build.sh -u 选项的函数执行原理。  


## 1. 基本流程  

对 `build.sh` 进行修改，使之可以一次性编译出多个设备树，并将多个设备树打包到最终的 `update.img` 中。

- 多个设备树对应多个 dts，dts 需要手动创建并自行配置。
- 设备树的编译命令：在 kernel 目录下使用以下命令：

```bash
make ARCH=$KERNEL_ARCH xxx.dtb -j$BUILD_JOBS
```

- 将编译出来的 dtb 打包到 `resource.img` 中：使用 `./scripts/mkmultidtb.py`（该脚本也需要对应修改）。
- `resource.img` 需要被打包到 `boot.img` 中：在 SDK 根目录下使用以下命令：

```bash
make bootimage -j$BUILD_JOBS
```

- `make bootimage` 命令只会更新 `out` 目录下的 `boot.img`，而不会更新 `rockdev` 中的镜像。因此需要手动将 `boot.img` 移动到 `rockdev` 对应目录下。
- 使用 `./build.sh -u` 打包时，实际使用的是 `rockdev` 下的镜像。

---

## 2. 重要原理解析  

### 2.1 Android下 boot.img 与 kernel 下 boot.img 的差异  

- Android 下的 `boot.img` 包含：
  - ramdisk  
  - kernel  
  - DTB  
  - resource.img  

  这个 `boot.img` 才是最终烧录到 boot 分区的镜像。

- 而 `kernel/boot.img` 是不完整的，仅包含：
  - kernel  
  - resource.img  

- `-K` 选项并不能编译出最终的 `boot.img`，因为 ramdisk 是依赖 Android 编译的。

### 2.2 一键生成多设备树的 update.img  

为了实现一键生成多设备树的 `update.img`，需要引入一个 `-m` 选项，完成以下步骤：

- 多个设备树编译为 dtb  
- 将 dtb 打包进 `resource.img`  
- 使用上述 `resource.img` 最终打包出 `update.img`  

实测发现：

- `-u` 选项打包时，使用的是 `rockdev` 中的镜像  
- SDK 根目录下的 `make bootimage` 命令只会更新 `out` 下的 `boot.img`，而不会同步更新到 `rockdev`  

---

## 3. build.sh -u 函数原型分析  

以下为 `./build.sh -u` 的核心函数执行逻辑：

```bash
if [ "$BUILD_UPDATE_IMG" = true ] ; then
    cp logo-img/nk-logo.img $IMAGE_PATH/	
    mkdir -p $PACK_TOOL_DIR/rockdev/Image/
    cp -f $IMAGE_PATH/* $PACK_TOOL_DIR/rockdev/Image/

    echo "Make update.img"
    if [[ $TARGET_PRODUCT =~ "PX30" ]]; then
	cd $PACK_TOOL_DIR/rockdev && ./mkupdate_px30.sh
    elif [[ $TARGET_PRODUCT =~ "rk356x_box" ]]; then
	if [ "$BUILD_AB_IMAGE" = true ] ; then
		cd $PACK_TOOL_DIR/rockdev && ./mkupdate_ab_$TARGET_PRODUCT.sh
	else
		cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_PRODUCT.sh
	fi
    else
	if [ "$BUILD_AB_IMAGE" = true ] ; then
		cd $PACK_TOOL_DIR/rockdev && ./mkupdate_"$TARGET_BOARD_PLATFORM"_ab.sh
	else
		cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_BOARD_PLATFORM.sh
	fi
    fi

    if [ $? -eq 0 ]; then
        echo "Make update image ok!"
    else
        echo "Make update image failed!"
        exit 1
    fi
    cd -
    mv $PACK_TOOL_DIR/rockdev/update.img $IMAGE_PATH/ -f
    rm $PACK_TOOL_DIR/rockdev/Image -rf
fi
```

### 3.1 变量说明  

- `$IMAGE_PATH`：为 `rockdev` 下的目录  
- `$PACK_TOOL_DIR`：为 `RKTools/linux/Linux_Pack_Firmware`  
- `$TARGET_BOARD_PLATFORM`：如 `rk356x`  

### 3.2 流程示例（以 3568_HW-userdebug 为例）  

- 在打包工具目录（`RKTools/linux/Linux_Pack_Firmware`）下创建打包用的临时目录  
- 把 `rockdev` 中版型对应的内容复制到临时目录  
- 使用打包工具目录下的 `./mkupdate_rk356x.sh` 脚本进行打包  
- 打包完成后，将生成的 `update.img` 复制回 `rockdev` 中  

---

## 4. build.sh 具体修改  

```diff
--- ./build.sh  2024-11-26 15:57:54.206701988 +0800
+++ ./build_hw.sh       2025-08-12 10:36:47.988967731 +0800
@@ -14,6 +14,7 @@
     echo "       -d = huild kernel dts name    "
     echo "       -V = build version    "
     echo "       -J = build jobs    "
+    echo "       -m = build multi dtb    "
     exit 1
 }
 
@@ -30,9 +31,32 @@
 KERNEL_DTS=""
 BUILD_VERSION=""
 BUILD_JOBS=16
+BUILD_MULTIDTB=false
+LOCAL_KERNEL_PATH="./kernel"
+
+
+RK3568_HW_DTS=(
+    "hw-t3568i-lvds-0000-1024x768-s18"
+    "hw-t3568i-lvds-0001-1680x1050-d24"
+    "hw-t3568i-lvds-0010-1600x1200-d24"
+    "hw-t3568i-lvds-0011-1920x1080-d18"
+    "hw-t3568i-lvds-0100-1280x800-s24"
+    "hw-t3568i-lvds-0101-1366x768-s24"
+    "hw-t3568i-lvds-0110-1366x768-s18"
+    "hw-t3568i-lvds-0111-1280x1024-d24"
+    "hw-t3568i-lvds-1000-1280x1024-d18"
+    "hw-t3568i-lvds-1001-1024x768-s24"
+    "hw-t3568i-lvds-1010-1920x1080-d24"
+    "hw-t3568i-lvds-1011-1024x600-s24"
+    "hw-t3568i-lvds-1100-1024x600-s18"
+    "hw-t3568i-lvds-1101-800x600-s24"
+    "hw-t3568i-lvds-1110-800x600-s18"
+    "hw-t3568i-lvds-1111-1280x800-s18"
+)
+
 
 # check pass argument
-while getopts "UCKABpouv:d:V:J:" arg
+while getopts "UCKABpoumv:d:V:J:" arg
 do
     case $arg in
         U)
@@ -80,6 +104,10 @@
         J)
             BUILD_JOBS=$OPTARG
             ;;
+        m)
+            echo "will build multidtb and package all the dtb into resource.img and boot.img"
+            BUILD_MULTIDTB=true
+            ;;
         ?)
             usage ;;
     esac
@@ -116,6 +144,30 @@
 export STUB_PATH=$PROJECT_TOP/$STUB_PATH
 export STUB_PATCH_PATH=$STUB_PATH/PATCHES
 
+function build_multidtb()
+{
+    if [[ "$TARGET_PRODUCT" == "rk3568_HW" || "$TARGET_PRODUCT" == "TKUN_MEKT_T3568I" ]]; then
+        for (( i = 0 ; i < ${#RK3568_HW_DTS[@]} ; i++ )); do
+            echo "make ${RK3568_HW_DTS[$i]} ....."
+            make ARCH=$KERNEL_ARCH ./rockchip/${RK3568_HW_DTS[$i]}.dtb -j$BUILD_JOBS
+            if [ $? -eq 0 ]; then
+                echo "Make ${RK3568_HW_DTS[$i]}.dtb ok!"
+            else
+                echo "Make ${RK3568_HW_DTS[$i]}.dtb failed!"
+                exit 1
+            fi
+        done
+
+        ./scripts/mkmultidtb.py RK3568-HW
+        if [ $? -eq 0 ]; then
+            echo "Make multi resource.img ok!"
+        else
+            echo "Make multi resource.img failed!"
+            exit 1
+        fi
+    fi
+}
+
 # build uboot
 if [ "$BUILD_UBOOT" = true ] ; then
 echo "start build uboot"
@@ -131,27 +183,32 @@
 if [ "$BUILD_KERNEL_WITH_CLANG" = true ] ; then
 ADDON_ARGS="CC=../prebuilts/clang/host/linux-x86/clang-r383902b/bin/clang LD=../prebuilts/clang/host/linux-x86/clang-r383902b/bin/ld.lld"
 fi
+
 # build kernel
 if [ "$BUILD_KERNEL" = true ] ; then
-echo "Start build kernel"
-cd kernel  && make $ADDON_ARGS ARCH=$KERNEL_ARCH $KERNEL_DEFCONFIG && make $ADDON_ARGS ARCH=$KERNEL_ARCH $KERNEL_DTS.img -j$BUILD_JOBS && cd -
-if [ $? -eq 0 ]; then
-    echo "Build kernel ok!"
-else
-    echo "Build kernel failed!"
-    exit 1
-fi
+    echo "Start build kernel"
 
-if [ "$KERNEL_ARCH" = "arm64" ]; then
-    KERNEL_DEBUG=kernel/arch/arm64/boot/Image
-else
-    KERNEL_DEBUG=kernel/arch/arm/boot/zImage
-fi
-cp -rf $KERNEL_DEBUG $OUT/kernel
+    cd $LOCAL_KERNEL_PATH && make clean && make $ADDON_ARGS ARCH=$KERNEL_ARCH $KERNEL_DEFCONFIG && make $ADDON_ARGS ARCH=$KERNEL_ARCH $KERNEL_DTS.img -j$BUILD_JOBS && cd -
+    
+    if [ $? -eq 0 ]; then
+        echo "Build kernel ok!"
+    else
+        echo "Build kernel failed!"
+        exit 1
+    fi
+
+    if [ "$KERNEL_ARCH" = "arm64" ]; then
+        KERNEL_DEBUG=kernel/arch/arm64/boot/Image
+    else
+        KERNEL_DEBUG=kernel/arch/arm/boot/zImage
+    fi
+    cp -rf $KERNEL_DEBUG $OUT/kernel
 fi
 
-echo "package resoure.img with charger images"
-cd u-boot && ./scripts/pack_resource.sh ../kernel/resource.img && cp resource.img ../kernel/resource.img && cd -
+if [ "$BUILD_MULTIDTB" = false ]; then
+    echo "package resoure.img with charger images"
+    cd u-boot && ./scripts/pack_resource.sh ../$LOCAL_KERNEL_PATH/resource.img && cp resource.img ../$LOCAL_KERNEL_PATH/resource.img && cd -
+fi
 
 # build android
 if [ "$BUILD_ANDROID" = true ] ; then
@@ -201,26 +258,49 @@
        fi
 fi
 
+if [ "$BUILD_MULTIDTB" = true ]; then
+    cd "$LOCAL_KERNEL_PATH" || { echo "Failed to enter directory: $LOCAL_KERNEL_PATH"; exit 1; }
+    if [[ "$TARGET_PRODUCT" == "rk3568_HW" || "$TARGET_PRODUCT" == "TKUN_MEKT_T3568I" ]]; then
+        make ARCH=arm64 NK_RK3568_defconfig
+    else
+        echo "There is no kernel defconfig file for the current TARGET_PRODUCT."
+        echo "Build build multi dtb failed!"
+        exit 1
+    fi
+    build_multidtb
+    cd -
+
+    make bootimage -j$BUILD_JOBS
+    if [ $? -eq 0 ]; then
+               echo "Make multi boot.img ok!"
+       else
+               echo "Make multi boot.img failed!"
+               exit 1
+       fi
+
+    cp out/target/product/$TARGET_PRODUCT/boot.img $IMAGE_PATH/boot.img
+fi
+
 if [ "$BUILD_UPDATE_IMG" = true ] ; then
-    cp logo-img/nk-logo.img $IMAGE_PATH/
+    cp logo-img/nk-logo.img $IMAGE_PATH/
     mkdir -p $PACK_TOOL_DIR/rockdev/Image/
     cp -f $IMAGE_PATH/* $PACK_TOOL_DIR/rockdev/Image/
 
     echo "Make update.img"
     if [[ $TARGET_PRODUCT =~ "PX30" ]]; then
-       cd $PACK_TOOL_DIR/rockdev && ./mkupdate_px30.sh
+           cd $PACK_TOOL_DIR/rockdev && ./mkupdate_px30.sh
     elif [[ $TARGET_PRODUCT =~ "rk356x_box" ]]; then
-       if [ "$BUILD_AB_IMAGE" = true ] ; then
-               cd $PACK_TOOL_DIR/rockdev && ./mkupdate_ab_$TARGET_PRODUCT.sh
-       else
-               cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_PRODUCT.sh
-       fi
+        if [ "$BUILD_AB_IMAGE" = true ] ; then
+            cd $PACK_TOOL_DIR/rockdev && ./mkupdate_ab_$TARGET_PRODUCT.sh
+        else
+            cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_PRODUCT.sh
+        fi
     else
-       if [ "$BUILD_AB_IMAGE" = true ] ; then
-               cd $PACK_TOOL_DIR/rockdev && ./mkupdate_"$TARGET_BOARD_PLATFORM"_ab.sh
-       else
-               cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_BOARD_PLATFORM.sh
-       fi
+        if [ "$BUILD_AB_IMAGE" = true ] ; then
+            cd $PACK_TOOL_DIR/rockdev && ./mkupdate_"$TARGET_BOARD_PLATFORM"_ab.sh
+        else
+            cd $PACK_TOOL_DIR/rockdev && ./mkupdate_$TARGET_BOARD_PLATFORM.sh
+        fi
     fi
 
     if [ $? -eq 0 ]; then
@@ -260,3 +340,13 @@
 echo "version: $SDK_VERSION"                                                                         >> $STUB_PATH/build_cmd_info.txt
 echo "finger:  $BUILD_ID/$BUILD_NUMBER/$BUILD_VARIANT"                                               >> $STUB_PATH/build_cmd_info.txt
 fi
+
+
+# 打印调试信息
+echo "========== Debug Information =========="
+echo "TARGET_PRODUCT: ${TARGET_PRODUCT:-Not Set}"
+echo "KERNEL_ARCH: ${KERNEL_ARCH:-Not Set}"
+echo "BUILD_JOBS: ${BUILD_JOBS:-Not Set}"
+echo "LOCAL_KERNEL_PATH: ${LOCAL_KERNEL_PATH:-Not Set}"
+echo "KERNEL_DEFCONFIG: ${KERNEL_DEFCONFIG:-Not Set}"
+echo "======================================="
```
