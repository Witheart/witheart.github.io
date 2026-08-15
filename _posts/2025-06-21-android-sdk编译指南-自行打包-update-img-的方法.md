---
title: "自行打包 update.img 的方法"
date: 2025-06-21
last_modified_at: 2025-06-21
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/自行打包-update-img-的方法/
toc: true
---

概要：本文介绍了如何在 Linux 环境下通过 Android SDK 的工具自行打包 update.img 文件。详细说明了工具目录、脚本选择方法、变量配置方式，以及打包流程和注意事项。


## 1. 打包环境准备  

一般都是在 **Linux 环境** 下进行打包。

进入 Android SDK 源码目录后，打包工具位于以下路径：

```
RKTools/linux/Linux_Pack_Firmware/rockdev
```

该目录下包含多个脚本文件，需根据具体的版型选择合适的脚本进行打包。

图片示例：  
![alt text](/assets/images/android-sdk编译指南/自行打包-update-img-的方法/PixPin_2025-06-21_09-38-02.png)

---

## 2. 如何选择正确的打包脚本  

如果不确定使用哪个脚本，可以查阅 SDK 根目录下的 `build.sh` 中关于 `make updateimg` 部分的代码逻辑：

```sh
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

### 变量说明  

- `$TARGET_PRODUCT`：产品型号  
- `$TARGET_BOARD_PLATFORM`：平台型号  

可以通过在终端中使用 `echo` 命令查看这两个变量的值：

```sh
echo $TARGET_PRODUCT
echo $TARGET_BOARD_PLATFORM
```

---

## 3. 打包前的准备工作  

在使用打包工具之前，需要完成以下准备：

1. 在 `RKTools/linux/Linux_Pack_Firmware/rockdev` 目录下创建 `Image` 文件夹：
   ```sh
   mkdir -p RKTools/linux/Linux_Pack_Firmware/rockdev/Image
   ```

2. 将所有需要打包的镜像文件和分区表文件（如 boot.img、system.img、parameter.txt 等）放入该目录中。  

   > 这些文件通常位于 `rockdev` 目录中，是平时生成的镜像文件。

---

## 4. 执行打包命令  

根据平台执行相应脚本，例如：

```sh
./RKTools/linux/Linux_Pack_Firmware/rockdev/mkupdate_rk356x.sh
```

执行后将在以下两个位置生成 `update.img`：

- `./RKTools/linux/Linux_Pack_Firmware/rockdev/Image/update.img`
- `./RKTools/linux/Linux_Pack_Firmware/rockdev/update.img`

> 刷写时请使用后者，因为前者未包含 `MiniLoaderAll.bin`，烧录工具无法识别。
