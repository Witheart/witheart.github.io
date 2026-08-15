---
title: "加载libicui18n.so.66失败问题解决指南"
date: 2024-12-27
last_modified_at: 2024-12-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/加载libicui18n-so-66失败问题解决指南/
toc: true
---

# 问题描述
执行程序时，报如下的错误：
```bash
error while loading shared libraries: libicuil8n.so.66: cannot open shared object file: No such file or directory
```

这个错误表明程序在运行时尝试加载共享库 `libicui18n.so.66` 时失败，因为系统中缺少该库或库的路径未正确配置。`libicui18n.so.66` 是 ICU（International Components for Unicode）库的一部分，通常用于处理 Unicode 和国际化功能。

# 解决方法
## 1. **确认系统是否安装了 ICU 库**
运行以下命令来检查系统中是否安装了 ICU 库：

```bash
ldconfig -p | grep libicui18n
```

如果输出中没有找到 `libicui18n.so.66`，说明 ICU 库未安装或版本不匹配。

---

## 2. **安装合适的 ICU 库版本**

### 对于基于 Debian/Ubuntu 的系统：
运行以下命令安装 ICU 库：

```bash
sudo apt update
sudo apt install libicu66
```

如果无法找到 `libicu66`，可能是因为你的系统软件库不再支持这个版本。在这种情况下，可能需要从源码或其他来源安装该库（参见步骤 4）。

---

## 3. **检查库路径是否正确**
即使已经安装了库，系统可能找不到它。可以通过以下步骤解决：

### 检查库是否存在：
运行以下命令检查库文件是否存在：

```bash
find /usr -name "libicui18n.so.66"
```

如果找到了路径，例如 `/usr/lib/x86_64-linux-gnu/libicui18n.so.66`，但程序仍报错，可以尝试将路径添加到动态链接库搜索路径中。

### 更新动态链接器缓存：
将库路径添加到 `/etc/ld.so.conf.d/`：

```bash
echo "/usr/lib/x86_64-linux-gnu" | sudo tee -a /etc/ld.so.conf.d/icui18n.conf
sudo ldconfig
```

然后重新运行程序。

---

## 4. **手动下载和安装 ICU**
如果系统软件库中没有 `libicu66`，你可以从源码或其他来源安装。

### 下载 ICU 源码：
1. 访问 [ICU 官方网站](https://icu.unicode.org/) 或 [ICU GitHub 仓库](https://github.com/unicode-org/icu)。
2. 下载对应版本的源码并编译安装。

编译步骤如下：

```bash
wget https://github.com/unicode-org/icu/releases/download/release-66-1/icu4c-66_1-src.tgz
tar -xvzf icu4c-66_1-src.tgz
cd icu/source
./configure
make
sudo make install
```

### 验证安装：
重新运行以下命令确认库是否可用：

```bash
ldconfig -p | grep libicui18n
```

---

## 5. **使用符号链接解决版本不匹配**
如果系统中存在其他版本的 ICU（例如 `libicui18n.so.67` 或更高版本），可以尝试创建一个符号链接来解决问题：

```bash
sudo ln -s /usr/lib/x86_64-linux-gnu/libicui18n.so.67 /usr/lib/x86_64-linux-gnu/libicui18n.so.66
sudo ldconfig
```

确保路径 `/usr/lib/x86_64-linux-gnu/` 替换为实际的库路径。
