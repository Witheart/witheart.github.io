---
title: "3568 安装dbeaver数据库可视化软件"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3568-安装dbeaver数据库可视化软件/
toc: true
---

## 简介
DBeaver Community 是一款免费跨平台的数据库工具，适用于开发者、数据库管理员、分析师以及所有处理数据的人员。它支持所有流行的 SQL 数据库，如 MySQL、MariaDB、PostgreSQL、SQLite、Apache 家族等。

## 方法一：使用 Snap 安装
```bash
sudo snap install dbeaver-ce
```

运行
```bash
dbeaver
```

这个方式安装的可能会运行报错，未解：
```bash
dbeaver cannot set capabilities: Operation not permitted
```

### 方法二：下载 Deb 包手动安装
1. 访问官网下载页面：https://dbeaver.io/download/
2. 下载 **Ubuntu Deb Package (Community Edition)**
3. 终端执行：
   ```bash
   sudo apt install -y ./dbeaver-ce_*.deb  # 替换为实际下载的文件名
   ```

4. 运行可能报错
```bash
./dbeaver: /usr/lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.33' not found (required by ./dbeaver)
./dbeaver: /usr/lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.34' not found (required by ./dbeaver)

```
推测为要求的库版本太高，此DBeaver为25.1.3版本

官网提供的deb包从21.0.0开始有arm64版本的，下载链接[https://dbeaver.io/files/21.0.0/](https://dbeaver.io/files/21.0.0/)。
下载dbeaver-ce-21.0.0-linux.gtk.aarch64-nojdk.tar.gz的即可，记得把java手动装一下。
降级后问题解决

5. deb方式安装的DBeaver，如果想加图标，在包里面有Desktop，但是指向的位置图标缺失，此处提供图标链接供自行下载
[https://techicons.dev/icons/dbeaver](https://techicons.dev/icons/dbeaver)

---

### 依赖自动处理
- 安装过程会自动解决 Java 依赖（需要 OpenJDK 11+）
- 如遇依赖问题，手动安装 JDK：
  ```bash
  sudo apt install -y openjdk-17-jdk
  ```

### 验证安装
```bash
dbeaver --version  # 应返回版本信息
```
