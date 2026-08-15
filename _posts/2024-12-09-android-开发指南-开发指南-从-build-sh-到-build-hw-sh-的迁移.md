---
title: "**开发指南：从 `build.sh` 到 `build_hw.sh` 的迁移**"
date: 2024-12-09
last_modified_at: 2024-12-09
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/
toc: true
---

以下是将原始 `build.sh` 升级为支持多设备树构建的开发指南：

## **1. 增加多设备树支持**
### 1.1 添加 `-m` 参数支持
- 加入-m选项的提示
```bash
echo "       -m = build multi dtb    "
```
![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image.png)

- 初始化选项为false
```bash
BUILD_MULTIDTB=false
```
![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-1.png)
- 在 `getopts` 参数解析部分，添加对 `-m` 的解析：
```bash
m)
    echo "will build multidtb and package all the dtb into resource.img"
    BUILD_MULTIDTB=true
    ;;
```
![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-3.png)

### 1.2 定义多设备树文件名数组
在脚本顶部，定义一个数组，包含目标设备支持的所有设备树文件名。例如：
```bash
RK3568_HW_DTS=(
    "hw-t3568i-lvds-0000-1024x768-s18"
    "hw-t3568i-lvds-0001-1680x1050-d24"
    "hw-t3568i-lvds-0010-1600x1200-d24"
    "hw-t3568i-lvds-0011-1920x1080-d18"
    ...
)
```
![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-2.png)

### 1.3 创建 `build_multidtb()` 函数
新增一个函数，用于批量构建设备树文件：

```bash
function build_multidtb()
{
    if [ "$TARGET_PRODUCT" = "rk3568_HW" ]; then
        for (( i = 0 ; i < ${#RK3568_HW_DTS[@]} ; i++ )); do
            echo "make ${RK3568_HW_DTS[$i]} ....."
            make ARCH=$KERNEL_ARCH ./rockchip/${RK3568_HW_DTS[$i]}.dtb -j$BUILD_JOBS
        done
        ./scripts/mkmultidtb.py RK3568-HW
    fi
}
```

### 1.4 在构建流程中调用 `build_multidtb()`
在构建逻辑中，根据 `BUILD_MULTIDTB` 的值决定是否调用 `build_multidtb()`：
```bash
if [ "$BUILD_MULTIDTB" = true ]; then
    cd "$LOCAL_KERNEL_PATH" || { echo "Failed to enter directory: $LOCAL_KERNEL_PATH"; exit 1; }
    if [ "$TARGET_PRODUCT" = "rk3568_HW" ]; then
        make ARCH=arm64 NK_RK3568_defconfig
    else
        echo "There is no kernel defconfig file for the current TARGET_PRODUCT."
        echo "Build build multi dtb failed!"
        exit 1
    fi
    build_multidtb
    cd -
fi
```
![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-4.png)

### 1.5 去除charge图片的打包
在原始脚本中：

1. **charge图标的打包**  
   原始脚本会通过 `./u-boot/scripts/pack_resource.sh` 脚本将 charge 图标打包进 `resource.img` 中。然而经过测试发现，该脚本存在以下问题：
   - `pack_resource.sh` 会将 `resource.img` 中的一个设备树文件（DTB）重命名为 `rk-kernel.dtb`。
   - 这导致 `resource.img` 中出现了两个 `rk-kernel.dtb` 文件。
   - 被重命名的设备树文件无法被 HW-ID DTB 正确识别，导致识别异常。

2. **charge图标的打包过程**  
   原始脚本中对 charge 图标的打包方式如下：
   ![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-5.png)

关于使用 `mkmultidtb.py` 脚本：

1. **多设备树打包**  
   使用 `mkmultidtb.py` 脚本对多设备树进行打包时，`resource.img` 中也会存在一个 `rk-kernel.dtb`，但与原始脚本不同：
   - `mkmultidtb.py` 会将多个设备树中的一个文件复制后再重命名为 `rk-kernel.dtb`。
   - 该 `rk-kernel.dtb` 的作用是当硬件拨码条件不满足时，默认选择这个 DTB 文件。
   - 由于是复制后重命名，不会影响 HW-ID DTB 对设备树的正确识别。

在修改后的脚本中：

- **取消 charge 图标的打包**  
  当选择编译多设备树时，已取消对 charge 图标的打包，以避免上述问题的发生。
  ![alt text](/assets/images/android-开发指南/开发指南-从-build-sh-到-build-hw-sh-的迁移/image-6.png)


## **2. 增加调试信息**
在脚本末尾，添加调试信息输出，以便快速定位问题。例如：

```bash
echo "========== Debug Information =========="
echo "TARGET_PRODUCT: ${TARGET_PRODUCT:-Not Set}"
echo "KERNEL_ARCH: ${KERNEL_ARCH:-Not Set}"
echo "BUILD_JOBS: ${BUILD_JOBS:-Not Set}"
echo "LOCAL_KERNEL_PATH: ${LOCAL_KERNEL_PATH:-Not Set}"
echo "KERNEL_DEFCONFIG: ${KERNEL_DEFCONFIG:-Not Set}"
echo "======================================="
```

## **3. 修改内核路径为局部变量**
为了方便维护，建议将内核路径设为局部变量，并在所有相关路径中引用该变量：

```bash
LOCAL_KERNEL_PATH="./kernel"
```

在所有内核相关操作中，将硬编码路径替换为变量，例如：

```bash
cd $LOCAL_KERNEL_PATH && make $ADDON_ARGS ARCH=$KERNEL_ARCH $KERNEL_DEFCONFIG
```

---

## **总结**

通过上述改动，`build_hw.sh` 在原有功能的基础上新增了对多设备树文件的支持，同时提高了代码的可维护性和可读性。开发者可以参考本指南，将类似的多设备树支持功能集成到其他脚本中。
