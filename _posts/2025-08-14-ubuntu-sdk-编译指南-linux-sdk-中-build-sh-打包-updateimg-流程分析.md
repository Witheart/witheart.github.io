---
title: "Linux SDK 中 build.sh 打包 updateimg 流程分析"
date: 2025-08-14
last_modified_at: 2025-08-14
categories:
  - "Ubuntu SDK 编译指南"
tags:
  - "Ubuntu SDK 编译指南"
permalink: /ubuntu-sdk-编译指南/linux-sdk-中-build-sh-打包-updateimg-流程分析/
toc: true
---

概要：本文详细分析了 Linux SDK 中 build.sh 脚本打包 update.img 的流程，涵盖了脚本调用关系、关键函数解析以及所用工具与软链接指向，帮助开发者更清晰地理解固件打包过程。


## 1. build.sh 脚本概述

SDK 根目录下的 `build.sh` 实际上是一个软链接，指向 `device/rockchip/common/build.sh`。

```bash
➜  rk3568_linux_4.19 git:(QY-Standard-SATA_enable-01) ✗ ls -al build.sh 
lrwxrwxrwx 1 hw hw 31 1月  21  2025 build.sh -> device/rockchip/common/build.sh
```

---

## 2. build_updateimg 函数解析

在 `build.sh` 中定义了 `build_updateimg` 函数，用于打包 update.img。

```bash
function build_updateimg(){
	IMAGE_PATH=$TOP_DIR/rockdev
	PACK_TOOL_DIR=$TOP_DIR/tools/linux/Linux_Pack_Firmware

	cd $PACK_TOOL_DIR/rockdev

	if [ -f "$RK_PACKAGE_FILE_AB" ]; then
		build_sdcard_package
		build_otapackage

		cd $PACK_TOOL_DIR/rockdev
		echo "Make Linux a/b update_ab.img."
		source_package_file_name=`ls -lh package-file | awk -F ' ' '{print $NF}'`
		ln -fs "$RK_PACKAGE_FILE_AB" package-file
		./mkupdate.sh
		mv update.img $IMAGE_PATH/update_ab.img
		ln -fs $source_package_file_name package-file
	else
		echo "Make update.img"

		if [ -f "$RK_PACKAGE_FILE" ]; then
			source_package_file_name=`ls -lh package-file | awk -F ' ' '{print $NF}'`
			ln -fs "$RK_PACKAGE_FILE" package-file
			./mkupdate.sh
			ln -fs $source_package_file_name package-file
		else
			./mkupdate.sh
		fi
 	        #md5sum update.img >update.img.md5
                #zip update.zip update.img update.img.md5
                #md5sum update.zip > update.zip.md5
                mv update.img $IMAGE_PATH
                #mv update.zip $IMAGE_PATH
                #mv update.zip.md5 $IMAGE_PATH
	fi

	finish_build
}
```

该函数核心逻辑：

- 判断是否存在 A/B 分区的打包配置文件。
- 使用 `mkupdate.sh` 脚本进行打包。
- 将生成的 `update.img` 移动到 `$TOP_DIR/rockdev` 目录下。

---

## 3. mkupdate.sh 脚本及其软链接

`build_updateimg` 函数中调用的 `mkupdate.sh` 实际上也是一个软链接，指向 `rk356x-mkupdate.sh`。

```bash
➜  rk3568_linux_4.19 git:(QY-Standard-SATA_enable-01) ✗ ls -l /home/hw/hdd/rk3568_linux_4.19/tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh
lrwxrwxrwx 1 hw hw 18 2月   7  2025 /home/hw/hdd/rk3568_linux_4.19/tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh -> rk356x-mkupdate.sh
```

---

## 4. rk356x-mkupdate.sh 脚本内容

该脚本负责调用打包工具 `afptool` 和 `rkImageMaker` 生成 `update.img`。

```bash
#!/bin/bash
pause()
{
echo "Press any key to quit:"
read -n1 -s key
exit 1
}
echo "start to make update.img..."
if [ ! -f "Image/parameter" -a ! -f "Image/parameter.txt" ]; then
	echo "Error:No found parameter!"
	exit 1
fi
if [ ! -f "package-file" ]; then
	echo "Error:No found package-file!"
	exit 1
fi
./afptool -pack ./ Image/update.img || pause
./rkImageMaker -RK3568 Image/MiniLoaderAll.bin Image/update.img update.img -os_type:androidos || pause
echo "Making ./Image/update.img OK."
exit $?
```

- 检查参数文件和 `package-file` 是否存在。
- 使用 `afptool` 打包 `Image/` 目录下的文件为 `Image/update.img`。
- 使用 `rkImageMaker` 生成最终的 `update.img`。

---

## 5. Image 目录的软链接

`Image` 目录也是一个软链接，实际指向 SDK 根目录下的 `rockdev`。

```bash
➜  rk3568_linux_4.19 git:(QY-Standard-SATA_enable-01) ✗ ls -l /home/hw/hdd/rk3568_linux_4.19/tools/linux/Linux_Pack_Firmware/rockdev/Image
lrwxrwxrwx 1 hw hw 20 1月  21  2025 /home/hw/hdd/rk3568_linux_4.19/tools/linux/Linux_Pack_Firmware/rockdev/Image -> ../../../../rockdev/
```

---

## 6. 总结

整个打包流程如下：

1. SDK 根目录执行 `build.sh`，实际调用的是 `device/rockchip/common/build.sh`。
2. 调用 `build_updateimg` 函数。
3. 函数内调用 `mkupdate.sh`（软链接至 `rk356x-mkupdate.sh`）。
4. `rk356x-mkupdate.sh` 使用 `afptool` 和 `rkImageMaker` 进行打包。
5. 镜像文件来源于 `Image` 目录，实际指向 `rockdev`。
