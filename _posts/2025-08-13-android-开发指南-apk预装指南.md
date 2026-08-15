---
title: "apk预装指南"
date: 2025-08-13
last_modified_at: 2025-08-13
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/apk预装指南/
toc: true
---

# 1 方式一
- 这种方式预装的软件在开机自启应用处可能不显示。
- 相比于方式二，方式一安装的应用可获得的权限更高。
- 方式一是Android原生的软件预装方式。
## 1.1 目录结构

确保在`vendor/rockchip/common/apps`下创建相应的文件夹，每个APK一个文件夹。例如：

```plaintext
vendor/rockchip/common/apps/
└── Turnstile_APP/
    ├── Turnstile_APP_v1.0.1_PRO_release.apk
    └── Android.mk
```
## 1.2 给予应用可执行权限
```bash
chmod 644 vendor/<your-vendor>/apps/Turnstile_APP/Turnstile_APP_v1.0.1_PRO_release.apk
```

## 1.3 `Android.mk` 文件配置

**`Android.mk`** 文件用于告知编译系统如何处理和编译APK文件。下面是一个示例：

```makefile
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := Turnstile_APP
LOCAL_MODULE_CLASS := APPS
LOCAL_MODULE_TAGS := optional
LOCAL_CERTIFICATE := platform
LOCAL_SRC_FILES := Turnstile_APP_v1.0.1_PRO_release.apk
LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)
LOCAL_PRIVILEGED_MODULE := true

include $(BUILD_PREBUILT)
```

**`Android.mk` 解读：**

- **LOCAL_PATH := $(call my-dir)** - 定义当前文件夹的路径。
- **include $(CLEAR_VARS)** - 清除所有变量，以避免冲突。
- **LOCAL_MODULE := Turnstile_APP** - 定义模块名，这个名字会在`apps.mk`中被引用。
- **LOCAL_MODULE_CLASS := APPS** - 指定这是一个应用程序模块。
- **LOCAL_MODULE_TAGS := optional** - 标记为可选模块，通常用于预装APK。
- **LOCAL_CERTIFICATE := platform** - 使用系统平台证书签名，这通常用于系统级应用。
- **LOCAL_SRC_FILES := Turnstile_APP_v1.0.1_PRO_release.apk** - 指定源文件，即APK文件。
- **LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)** - 设置模块后缀为`.apk`。
- **LOCAL_PRIVILEGED_MODULE := true** - 表示此模块是特权模块，可以访问系统级API。
- **include $(BUILD_PREBUILT)** - 指示系统构建一个预编译模块。

## 1.4 修改 `apps.mk`

在`vendor/rockchip/common/apps/apps.mk`文件中，你需要添加你的应用名称到`PRODUCT_PACKAGES`列表中：

```makefile
PRODUCT_PACKAGES += \
    Turnstile_APP
```

确保`Turnstile_APP`与`Android.mk`中的`LOCAL_MODULE`属性值一致。

## 1.5 方式一总结

1. **创建文件夹**：在`vendor/rockchip/common/apps`下为每个APK创建一个文件夹。
2. **放置APK和`Android.mk`**：在每个文件夹中放入要预装的APK文件和相应的`Android.mk`文件。
3. **修改`apps.mk`**：在`apps.mk`中添加应用名称到`PRODUCT_PACKAGES`列表中。

---
---

# 2 方式二
## 2.0 更新说明
如果是新版型，直接在device/rockchip/rk3588/rk3588_RB(示例版型)/下，添加下面三个目录，然后直接将apk放到对应的目录中即可，编译过程中会自动处理生成apk对应的Android.mk并提取出库文件：
```
这三个文件夹分别为：
preinstall：存放不可卸载的应用
preinstall_del_forever：存放可永久卸载的应用
preinstall_del：存放卸载后、 恢复出厂设置可自动恢复的应用
```

这里使用了device/rockchip/common/auto_generator.py这个脚本自动根据放入的apk生成对应的Android.mk文件。

## 2.1 目录结构与说明

预装 APK 的目录结构如下：

```
device/rockchip/rk3399/preinstall_del/
    AppName/
        AppName.apk
        Android.mk
        lib/
            libExample.so
```

- **`preinstall/`**: 不可卸载目录，APK 安装后不可被用户卸载。
- **`preinstall_del/`**: 可卸载目录，用户卸载后不会恢复。
- **`preinstall_del_forever/`**: 可卸载目录，用户卸载后恢复出厂设置也不会恢复。

### 2.1.1 为什么使用 `rk3399` 目录

预置 APK 的行为由 `device/rockchip/common/device.mk` 配置文件决定。部分开发人员迁移项目中，路径被写死为 `rk3399`，因此需要使用 `rk3399` 目录结构。(注意，下面修改的auto_generator.py的第一个参数实际上有个多余的`preinstall`，导致无法正常拼接)

```makefile
# 配置预置 APK 路径
$(shell python device/rockchip/common/auto_generator.py device/rockchip/rk3399/preinstall preinstall bundled_persist-app $(TARGET_ARCH))
$(shell python device/rockchip/common/auto_generator.py device/rockchip/rk3399/preinstall preinstall_del bundled_uninstall_back-app $(TARGET_ARCH))
$(shell python device/rockchip/common/auto_generator.py device/rockchip/rk3399/preinstall preinstall_del_forever bundled_uninstall_gone-app $(TARGET_ARCH))
-include device/rockchip/rk3399/preinstall/preinstall.mk
-include device/rockchip/rk3399/preinstall_del/preinstall.mk
-include device/rockchip/rk3399/preinstall_del_forever/preinstall.mk
```
- 具体参考资料 [[RK3568][Android12.0]--- 系统自带预置第三方APK方法](https://blog.csdn.net/xiaowang_lj/article/details/134404937)

---

## 2.2 `Android.mk` 配置

**文件路径：**  
`device/rockchip/rk3399/preinstall_del/AppName/Android.mk`

### 2.2.1 示例配置

```makefile
LOCAL_PATH := $(my-dir)

include $(CLEAR_VARS)

# 模块名称
LOCAL_MODULE := Turnstile

# 模块类型为 APK
LOCAL_MODULE_CLASS := APPS

# 安装路径（可卸载）
LOCAL_MODULE_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app

# APK 文件名
LOCAL_SRC_FILES := $(LOCAL_MODULE)$(COMMON_ANDROID_PACKAGE_SUFFIX)

# 使用已有签名
LOCAL_CERTIFICATE := PRESIGNED

# 可选标签
LOCAL_MODULE_TAGS := optional

# APK 后缀
LOCAL_MODULE_SUFFIX := $(COMMON_ANDROID_PACKAGE_SUFFIX)

# JNI 库路径配置
LOCAL_JNI_SHARED_LIBRARIES_ABI := arm64
MY_LOCAL_PREBUILT_JNI_LIBS := \
	lib/arm64/libWlt2BmpDemo.so \
	lib/arm64/libYSerialPort.so \
	lib/arm64/libaikl_calc_arm.so \
	lib/arm64/libaikl_cluster_arm.so \
	lib/arm64/libbd_unifylicense.so \
	lib/arm64/libbdca.so \
	lib/arm64/libbdface_sdk.so \
	lib/arm64/libbrcrash.so \
	lib/arm64/libbrcrash_dumper.so \
	lib/arm64/libbronlinetracking.so \
	lib/arm64/libc++_shared.so \
	lib/arm64/libcrt288xur_drv.so \
	lib/arm64/libliantian.so \
	lib/arm64/libpaddle_light_api_shared.so \
	lib/arm64/libwlt2bmp.so

# 把 JNI 库复制到目标路径
MY_APP_LIB_PATH := $(TARGET_OUT_ODM)/bundled_uninstall_back-app/$(LOCAL_MODULE)/lib/$(LOCAL_JNI_SHARED_LIBRARIES_ABI)
ifneq ($(LOCAL_JNI_SHARED_LIBRARIES_ABI), None)
$(warning MY_APP_LIB_PATH=$(MY_APP_LIB_PATH))
LOCAL_POST_INSTALL_CMD := \
	mkdir -p $(MY_APP_LIB_PATH) \
	$(foreach lib, $(MY_LOCAL_PREBUILT_JNI_LIBS), ; cp -f $(LOCAL_PATH)/$(lib) $(MY_APP_LIB_PATH)/$(notdir $(lib)))
endif

include $(BUILD_PREBUILT)
```

---

## 2.3 `preinstall.mk` 配置

**文件路径：**  
`device/rockchip/rk3399/preinstall_del/preinstall.mk`

### 2.3.1 示例配置

```makefile
PRODUCT_PACKAGES += AppName
```

### 2.3.2 配置说明

- **`PRODUCT_PACKAGES`**: 用于声明需要预装的模块名称（即 `LOCAL_MODULE` 值）。
- 每个需要预装的 APK 都需要在 `preinstall.mk` 中添加一行。

## 2.4 方式二总结
1. **确定目录**：选择`preinstall_del/`目录以便用户可卸载。

2. **配置 `Android.mk`**：
   - 设置模块名称、安装路径、签名等。
   - 配置JNI库路径和复制命令。

3. **添加到 `preinstall.mk`**：
   - 加入模块名称。
