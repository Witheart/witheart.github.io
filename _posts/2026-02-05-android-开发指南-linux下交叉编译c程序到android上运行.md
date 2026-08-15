---
title: "Linux下交叉编译C程序到Android上运行"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/linux下交叉编译c程序到android上运行/
toc: true
---

概要：本文介绍了如何在 Linux 平台下使用交叉编译器编译 C 语言程序，并将其部署到 Android 设备上运行的完整过程。通过具体的命令示例，演示了从编译、推送到设备、赋予执行权限直到运行程序的整个流程。


## 1. 准备交叉编译环境

### 1.1 安装交叉编译器

在 Linux 上交叉编译时，需要使用合适的交叉编译工具链。例如，针对 64 位 ARM 架构（aarch64）的 Android 设备，可以使用如下编译器：

```bash
aarch64-linux-gnu-gcc
```

---

## 2. 编译 C 程序

### 2.1 编写和编译代码

假设已有一个名为 `rtc_test.c` 的 C 源代码文件，可以通过如下命令进行交叉编译：

```bash
aarch64-linux-gnu-gcc -static -o rtc_test rtc_test.c
```

- `-static`：表示静态链接，避免在 Android 上因缺乏动态库而无法运行。
- `-o rtc_test`：输出的可执行文件名为 `rtc_test`。

---

## 3. 将程序推送到 Android 设备

### 3.1 使用 ADB 推送文件

将编译好的可执行程序推送到 Android 设备的 `/data/local/tmp` 路径下：

```bash
adb push "F:\0014_Android_develop\TKUN-3568\251230-RTC-定时开关机\rtc_test" /data/local/tmp/rtc_test
```

- 注意 Windows 下路径格式需加双引号。
- `/data/local/tmp/` 是 Android 上通常有写权限的目录。

---

## 4. 在 Android 设备上运行程序

### 4.1 设置权限并运行

使用 ADB 进入设备终端：

```bash
adb shell
su
cd /data/local/tmp
chmod +x rtc_test
./rtc_test
```

- `su`：切换为 root 用户（视设备是否已 root）。
- `chmod +x`：赋予执行权限。
- `./rtc_test`：运行程序。

---

## 5. 注意事项与建议

- 请确保目标 Android 设备与交叉编译器的架构一致（如 aarch64）。
- 若提示权限不足，可能需确保设备已具备 root 权限。
- 若程序无法运行，检查是否正确使用了 `-static` 静态编译选项。
