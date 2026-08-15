---
title: "HW-T3568 安卓固件编译指南"
date: 2024-11-27
last_modified_at: 2024-11-27
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/hw-t3568-安卓固件编译指南/
toc: true
---

本文档旨在指导如何进行 **HW-T3568** 的安卓固件编译，最终生成 **update.img** 文件以供烧录。


## 一、获取源码并切换分支

1. 进入源码目录，确认源码版本为 **Android 11**。

2. 查看分支列表：

   ```bash
   git branch -a
   ```
![alt text](/assets/images/android-sdk编译指南/hw-t3568-安卓固件编译指南/image-1.png)

3. 切换到目标分支（如：`V3.007`）：

   ```bash
   git checkout V3.007
   ```

4. 拉取远程仓库的最新内容：

   ```bash
   git pull origin V3.007
   ```

---

## 二、单独编译和整体编译 Android 固件

### 1. 设置 Java 环境

进入 `android11` 文件夹，设置 Java 版本为 **1.8**。确认 Java 版本后，才能进行编译：

```bash
source javaenv.sh
java -version
```

确保输出的 Java 版本为 1.8。

---

### 2. 配置编译环境

运行以下命令以配置编译环境（每次打开新的终端都要重新进行source）：

```bash
source build/envsetup.sh
lunch
```

运行 `lunch` 后会出现目标硬件列表，根据需要输入对应的序号进行选择。

---

### 3. 整体编译 Android 固件

完成环境配置后，运行以下命令进行整体编译：

```bash
./build.sh -AUCKu
```

---

### 4. 单独编译 Android 固件

#### 4.1 编译 uboot

在 Android 源码目录下运行以下命令编译 uboot：

```bash
./build.sh -U
```

---

#### 4.2 编译 Android 内核

在 Android 源码目录下运行以下命令编译内核：

```bash
./build.sh -CKA
```

---

#### 4.3 编译 Android 文件系统

1. 在源码根目录的 `build.sh` 脚本中，找到 `make installclean` 命令，并将其注释掉。

2. 然后运行以下命令编译文件系统：

   ```bash
   ./build.sh -A
   ```

> **注意**：可能需要选择电源域电压配置，建议参考文档 **“工控ARM软硬件接口文件_20231226.xlsx”** 进行选择。
![alt text](/assets/images/android-sdk编译指南/hw-t3568-安卓固件编译指南/电源配置.png)
---

### 5. 编译时遇到的常见问题

#### 错误信息：

```text
error: external/angle/Android.bp:56:1: module "libfeature_support_angle" variant "android_arm64_armv8-a_cortex-a55_shared": 
module source path "external/angle/third_party/jsoncpp/source/include" does not exist
18:02:16 soong bootstrap failed with: exit status 1
Build android failed!
```

**原因**：模块 **libfeature_support_angle** 中引用的路径 `external/angle/third_party/jsoncpp/source/include` 不存在。

**解决方法**：

1. 在路径 `external/jsoncpp` 中找到 `include` 文件夹。
2. 将 `include` 文件夹复制到 `external/angle/third_party/jsoncpp/source/` 路径下。

> **相关资源**：  
> jsoncpp 的 GitHub 地址：[https://github.com/open-source-parsers/jsoncpp](https://github.com/open-source-parsers/jsoncpp)

---

## 三、编译耗时和系统资源占用

- **编译耗时**：约 **4小时26分**
![alt text](/assets/images/android-sdk编译指南/hw-t3568-安卓固件编译指南/编译时CPU占用情况-1.png)


- **CPU占用**：编译时 CPU 使用率较高，建议在硬件性能较好的机器上运行。
![编译成功结果与用时](/assets/images/android-sdk编译指南/hw-t3568-安卓固件编译指南/编译成功结果与用时.png)


---

## 四、参考资源

- [jsoncpp GitHub 仓库](https://github.com/open-source-parsers/jsoncpp)
- **工控ARM软硬件接口文件**
