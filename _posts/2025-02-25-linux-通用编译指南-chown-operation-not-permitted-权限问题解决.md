---
title: "chown Operation not permitted 权限问题解决"
date: 2025-02-25
last_modified_at: 2025-02-25
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/chown-operation-not-permitted-权限问题解决/
toc: true
---

概要：在编译 Linux 内核并打包 Debian 包时，可能会遇到 `chown: Operation not permitted` 的错误。本文介绍如何使用 `fakeroot` 解决该问题，并正确生成 `.deb` 包。  


## 1. 问题描述  

在执行以下命令编译 Linux 内核并打包 linux-headers 包时：  

```sh
make -j$(nproc) ARCH=arm64 CROSS_COMPILE=aarch64-none-linux-gnu- bindeb-pkg
```

可能会遇到如下错误：  

```
chown: changing ownership of './debian/hdrtmp/usr/src/linux-headers-5.10.160-g83b4af0502f2/mm/Makefile': Operation not permitted
chown: changing ownership of './debian/hdrtmp/usr/src': Operation not permitted
...
make[4]: *** [scripts/Makefile.package:87: intdeb-pkg] Error 1
make[3]: *** [Makefile:1662: intdeb-pkg] Error 2
make[2]: *** [debian/rules:13: binary-arch] Error 2
dpkg-buildpackage: error: debian/rules binary subprocess returned exit status 2
make[1]: *** [scripts/Makefile.package:83: bindeb-pkg] Error 2
make: *** [Makefile:1662: bindeb-pkg] Error 2
```

该错误通常是由于在非 root 用户下运行 `make bindeb-pkg`，导致 `chown` 命令无法更改文件的所有权。  

---

## 2. 解决方案：使用 `fakeroot`  

### 2.1 什么是 `fakeroot`？  

`fakeroot` 是一个工具，它允许非 root 用户模拟 root 权限，以便在不真正修改文件权限的情况下进行软件打包。对于 `make bindeb-pkg` 这样的操作，`fakeroot` 可以避免 `chown` 权限问题。  

### 2.2 使用 `fakeroot` 重新运行编译命令  

可以在 `make` 命令前添加 `fakeroot`，如下所示：  

```sh
fakeroot make -j$(nproc) ARCH=arm64 CROSS_COMPILE=aarch64-none-linux-gnu- bindeb-pkg
```

这样，`fakeroot` 会拦截 `chown` 等命令，使其在伪造的 root 环境下执行，从而避免 `Operation not permitted` 的错误。  

---

## 3. 其他注意事项  

- **确保 `fakeroot` 已安装**  
  如果 `fakeroot` 命令不可用，可以通过以下方式安装：  

  ```sh
  sudo apt update
  sudo apt install fakeroot
  ```

- **避免使用 `sudo`**  
  `fakeroot` 旨在用于非 root 用户环境，不需要 `sudo`。如果直接使用 `sudo make bindeb-pkg`，可能会导致文件权限不匹配的问题。  
