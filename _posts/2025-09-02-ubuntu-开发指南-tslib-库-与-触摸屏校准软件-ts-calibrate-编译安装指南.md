---
title: "tslib 库 与 触摸屏校准软件 ts_calibrate 编译安装指南"
date: 2025-09-02
last_modified_at: 2025-09-02
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/tslib-库-与-触摸屏校准软件-ts-calibrate-编译安装指南/
toc: true
---

ts_calibrate 是一个触摸屏校准软件，由 tslib 库编译得到。

## tslib 库源码下载地址

- [https://github.com/libts/tslib](https://github.com/libts/tslib)

## 最终目标

1.  安装 `tslib` 库和工具。
2.  使用 `ts_calibrate` 工具，生成准确的校准文件 (`pointercal`)。
3.  正确配置 `tslib` 的环境变量和配置文件 (`ts.conf`)，确保触摸功能在应用中正常工作。

---

## 第一步：安装前的系统准备

打开终端 (`Ctrl+Alt+T`)，执行以下命令更新系统并安装编译所需的工具和依赖包。

```bash
sudo apt update
sudo apt install -y git build-essential autoconf automake libtool pkg-config libc6-dev
```

- `git`：用于下载源代码。
- `build-essential`, `libc6-dev`：提供 GCC 编译器和其他基础开发库。
- `autoconf`, `automake`, `libtool`, `pkg-config`：用于生成编译配置脚本。

---

## 第二步：下载并编译安装 tslib

我们将从官方仓库获取最新源代码进行编译。

```bash
# 1. 克隆 tslib 的源代码仓库
git clone https://github.com/kergoth/tslib.git

# 2. 进入源代码目录
cd tslib

# 3. 生成 configure 编译配置脚本
./autogen.sh

# 4. 配置编译选项。这里我们选择安装到系统标准路径 /usr/local/
./configure

# 5. 开始编译源代码（这个过程需要一些时间）
make

# 6. 将编译好的库和工具安装到系统
sudo make install

# 7. 更新系统的动态链接库缓存，让系统能找到新安装的 tslib
sudo ldconfig /usr/local/lib
```

**验证安装：**
输入 `ts_calibrate --version` 并按回车，如果安装成功，会显示版本信息。如果显示 `command not found`，请尝试**注销再登录**或重启系统，让 `/usr/local/bin` 路径生效。

---

## 第三步：配置 tslib 环境与修改配置文件

这是最关键的一步，需要根据触摸屏设备节点进行配置。

### 1. 确定触摸屏的设备节点

首先，需要确认触摸屏在系统中的设备文件是哪个。

- **方法 A（推荐）**：使用 `evtest` 工具。

  ```bash
  # 安装 evtest
  sudo apt install evtest
  # 运行 evtest，它会列出所有输入设备
  evtest
  ```

  会看到类似下面的输出，根据设备描述（如：`Goodix Capacitive TouchScreen`）判断哪个是触摸屏，并记下其对应的 `/dev/input/eventX`（例如 `/dev/input/event0`）。

  ```
  No device specified, trying to scan all of /dev/input/event*
  Available devices:
  /dev/input/event0:	Goodix Capacitive TouchScreen
  /dev/input/event1:	USB Keyboard
  /dev/input/event2:	USB Keyboard
  ```

- **方法 B**：查看系统输入设备列表。
  ```bash
  ls /dev/input/
  ```
  通常触摸屏会是 `event0` 到 `event5` 之间的一个。可以逐个尝试 `cat /dev/input/eventX`，然后触摸屏幕，如果终端输出乱码，那就是那个设备。按 `Ctrl+C` 停止。如果方法 A 中查看的触摸屏生成了两个 event，那么也可以从有没有乱码输出进行判断

**假设确认的设备节点是 `/dev/input/event0`。**

### 2. 设置环境变量

我们需要创建一个脚本文件来设置 `tslib` 运行所需的环境变量，这样每次测试前只需运行这个脚本即可。

1.  创建并编辑环境变量设置脚本：（登录时会自动加载）

    ```bash
    sudo nano /etc/profile.d/tslib.sh
    ```

2.  在该文件中填入以下内容，**请务必将 `TSLIB_TSDEVICE` 的值修改为实际的设备节点**（例如 `/dev/input/event0`）：

    ```bash
    #!/bin/sh
    # 指定触摸屏设备节点
    export TSLIB_TSDEVICE=/dev/input/event0

    # 指定校准文件存放的路径和名称
    export TSLIB_CALIBFILE=/etc/pointercal

    # 指定 tslib 配置文件的位置
    export TSLIB_CONFFILE=/usr/local/etc/ts.conf

    # 指定 tslib 插件所在目录
    export TSLIB_PLUGINDIR=/usr/local/lib/ts

    # 指定帧缓冲设备（LCD屏幕）
    export TSLIB_FBDEVICE=/dev/fb0
    ```

    - `TSLIB_CALIBFILE`: 校准后生成的文件，应用会读取这个文件来修正触摸坐标。
    - `TSLIB_CONFFILE`: `tslib` 的主配置文件，下一步会修改它。
    - `TSLIB_PLUGINDIR`: `tslib` 的各种模块（插件）存放的路径。
    - `TSLIB_FBDEVICE`: 显示设备，通常是 `/dev/fb0`。

3.  按 `Ctrl+X`，然后按 `Y`，再按 `Enter` 保存并退出 `nano` 编辑器。

4.  让脚本立即生效（或者重启终端）：
    ```bash
    source /etc/profile.d/tslib.sh
    ```

### 3. 修改 tslib 库配置文件 (`ts.conf`)

`ts.conf` 文件定义了 `tslib` 读取触摸数据和处理数据的流程（模块链）。

1.  使用编辑器打开配置文件：

    ```bash
    sudo nano /usr/local/etc/ts.conf
    ```

2.  会看到文件内容。**最关键的一行是 `module_raw input`**，它负责直接从硬件读取原始数据。确保这一行**没有被注释**（行首没有 `#` 号）。
    对于绝大多数现代触摸屏（电容屏、电阻屏），一个常见的、简单的配置如下：

    ```
    module_raw input
    module variance delta=30
    module dejitter delta=100
    module linear
    ```

    - `module_raw input`: 必须启用，使用 `input` 模块读取原始数据。
    - `module variance`: 滤波模块，用于去除噪音数据。`delta` 值可根据情况调整。
    - `module dejitter`: 去抖模块，用于平滑数据。`delta` 值可根据情况调整。
    - `module linear`: **必须启用**，用于线性变换和校准。它依赖 `pointercal` 文件。

3.  保存并退出文件（`Ctrl+X` -> `Y` -> `Enter`）。

---

## 第四步：执行触摸屏校准（生成 pointercal 文件）

**重要：** 校准必须在**纯文本控制台**下进行。Ubuntu 的图形桌面界面（GNOME）会独占输入和显示设备，导致校准工具无法正常工作。

1.  切换到文本控制台：按 `Ctrl+Alt+F1`（F1 到 F6 通常都可以）。会看到一个黑色的登录界面。
2.  使用 root 和密码登录。（输入密码时不要使用小键盘上的数字）
3.  因为我们在 `/etc/profile.d/` 下设置了环境变量，所以登录后它们会自动生效。如果没有，请手动执行 `source /etc/profile.d/tslib.sh`。
4.  开始校准：

    ```bash
    ts_calibrate
    ```

    **注意：** 可能需要 `sudo` 权限来写入 `/etc/pointercal` 文件。

5.  屏幕上会出现一个十字光标，并依次在五个位置（中心、四个角）出现。请**使用触笔或手指精确点击**十字的中心。
    ![alt text](/assets/images/ubuntu-开发指南/tslib-库-与-触摸屏校准软件-ts-calibrate-编译安装指南/image.png)
6.  完成后，程序会提示校准成功，并自动将校准数据写入 `TSLIB_CALIBFILE` 指定的路径（`/etc/pointercal`）。

7.  校准完成后，可以按 `Ctrl+Alt+F7`（或 `F1`）返回到图形桌面界面。

---

## 第五步：测试校准结果

同样，需要在文本控制台 (`Ctrl+Alt+F1`) 下进行测试。

1.  运行测试程序：
    ```bash
    sudo ts_test
    ```
2.  会看到屏幕上显示一个十字线和坐标值。用手触摸屏幕并移动，观察屏幕上的光标是否**精准且流畅地**跟随触摸点。
    ![alt text](/assets/images/ubuntu-开发指南/tslib-库-与-触摸屏校准软件-ts-calibrate-编译安装指南/image-1.png)
3.  如果测试结果不理想，可以重新运行 `ts_calibrate` 再次校准。

## 总结

现在，任何使用 `tslib` 的应用程序（如 Qt 配置了 `-tslib` 选项）在启动时都会自动读取 `/etc/pointercal` 文件中的校准参数，从而获得准确的触摸体验。
