---
title: "搭建编译 HW-T3568 安卓固件的环境"
date: 2024-11-27
last_modified_at: 2024-11-27
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/搭建编译-hw-t3568-安卓固件的环境/
toc: true
---

## 编译环境构建

### 1. 安装 SDK 编译环境所需软件包

首先，更新并升级系统：

```bash
sudo apt update
sudo apt upgrade
```

然后，安装必要的软件包：

```bash
sudo apt install git git-core gnupg ssh make gcc g++ libssl-dev liblz4-tool \
expect patchelf chrpath gawk texinfo diffstat binfmt-support qemu-user-static \
live-build bison flex fakeroot cmake gcc-multilib g++-multilib unzip zip curl \
zlib1g-dev libc6-dev-i386 lib32ncurses5-dev libx11-dev lib32z-dev ccache \
libgl1-mesa-dev libxml2-utils xsltproc device-tree-compiler libfdt-dev libfdt1 \
python3-pip python3-dev python3-pyelftools ncurses-dev libncurses5 libgl1-mesa-dev \
gperf build-essential
```

---

### 2. 常见问题及解决方法

#### **1）软件包安装失败的解决方案**

- **替换 `python-pip`**  
  现代系统默认使用 Python 3，请改用 `python3-pip`：

  ```bash
  sudo apt install python3-pip
  ```

- **启用 `universe` 仓库**  
  如果某些包无法找到，确保已启用 `universe` 仓库：

  ```bash
  sudo add-apt-repository universe
  sudo apt update
  sudo apt install expect
  ```

- **安装 `qemu-user-static`**  
  若安装失败，尝试启用 `multiverse` 仓库：

  ```bash
  sudo add-apt-repository multiverse
  sudo apt update
  sudo apt install qemu-user-static
  ```

- **安装 `device-tree-compiler`**  
  如果未找到该工具，可以尝试：

  ```bash
  sudo apt install device-tree-compiler
  ```

- **安装 `pyelftools`**  
  使用 `pip3` 安装 Python 库 `pyelftools`：

  ```bash
  pip3 install pyelftools
  ```

#### **2）确保 Python2 为系统默认版本**

Android 11 的编译环境要求默认使用 Python 2。执行以下命令切换默认版本：

```bash
sudo rm -rf /usr/bin/python
sudo ln -s /usr/bin/python2 /usr/bin/python
```

---

### 3. 安装 `repo`

1. 创建 `repo` 所需的目录并配置环境变量：

   ```bash
   mkdir ~/bin
   export PATH=~/bin:$PATH
   ```

2. 下载 `repo` 工具：

   ```bash
   curl https://mirrors.tuna.tsinghua.edu.cn/git/git-repo -o ~/bin/repo
   chmod a+x ~/bin/repo
   ```

3. 配置 Git 用户信息（`repo` 使用 Git 工作，需要提前配置用户信息）：

   ```bash
   git config --global user.name "your name"
   git config --global user.email "your email"
   ```

4. 验证 Git 配置信息：

   ```bash
   git config --list
   ```

---

## 注意事项

- 请确保所有依赖的软件包均已正确安装，若遇到问题可参考上述解决方案逐一排查。
- 完成上述环境配置后，即可开始编译 HW-T3568 固件。
