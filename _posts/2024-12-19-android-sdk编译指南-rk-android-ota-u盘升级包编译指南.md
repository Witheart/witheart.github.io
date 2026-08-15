---
title: "RK Android OTA U盘升级包编译指南"
date: 2024-12-19
last_modified_at: 2024-12-19
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/rk-android-ota-u盘升级包编译指南/
toc: true
---

本指南用于指导如何编译出可供U盘 OTA 升级的`update.zip`。

具体升级方式见`《RK Android OTA U盘升级指南》`。

### 1. 配置编译环境

运行以下命令以配置编译环境（每次打开新的终端都要重新进行source）：

```bash
source build/envsetup.sh
lunch
```

运行 `lunch` 后会出现目标硬件列表，根据需要输入对应的序号进行选择。

---

### 2. 整体编译 Android 固件

完成环境配置后，运行以下命令进行编译：

```bash
./build.sh -AUCKuop
```

### 3. 为编译出的固件改名
在 out/target/product/rkxxxx/目录下会生成 ota 完整包 rkxxxx-ota-eng.root.zip，改成 update.zip 即可拷贝到 U盘进行升级。
