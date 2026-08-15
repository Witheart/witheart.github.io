---
title: "自行构建的 deb 在安装时处理依赖时报错"
date: 2025-03-24
last_modified_at: 2025-03-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/自行构建的-deb-在安装时处理依赖时报错/
toc: true
---

概要：本文介绍了在安装自行构建的 `.deb` 软件包时遇到依赖关系错误的问题，并提供了解决方法，即修改 `DEBIAN/control` 文件中的架构设置。  


## 1. 问题表现  

手动安装这些依赖是成功的，但是直接执行 `.deb` 安装时却失败，错误信息如下：  

```sh
下列软件包有未满足的依赖关系：
 qt5142-custom:amd64 : 依赖: build-essential:amd64 但无法安装它
                       依赖: libgl1-mesa-dev:amd64 但无法安装它
                       依赖: libxkbcommon-dev:amd64 但无法安装它
                       依赖: libxkbcommon-x11-dev:amd64 但无法安装它
                       依赖: libxcb-xinerama0-dev:amd64 但无法安装它
                       依赖: libxcb-xinerama0:amd64 但无法安装它
                       依赖: libxcb-icccm4-dev:amd64 但无法安装它
                       依赖: libxcb-image0-dev:amd64 但无法安装它
                       依赖: libxcb-keysyms1-dev:amd64 但无法安装它
                       依赖: libxcb-render-util0-dev:amd64 但无法安装它
                       依赖: libxcb-shape0-dev:amd64 但无法安装它
                       依赖: libxcb-sync-dev:amd64 但无法安装它
                       依赖: libxcb-xfixes0-dev:amd64 但无法安装它
                       依赖: libxcb-xkb-dev:amd64 但无法安装它
                       依赖: libxcb1-dev:amd64 但无法安装它
                       依赖: libxcb1:amd64 但无法安装它
                       依赖: libxrender-dev:amd64 但无法安装它
                       依赖: libx11-dev:amd64 但无法安装它
                       依赖: libx11-xcb-dev:amd64 但无法安装它
                       依赖: libxi-dev:amd64 但无法安装它
                       依赖: libxext-dev:amd64 但无法安装它
                       依赖: libfontconfig1-dev:amd64 但无法安装它
                       依赖: libfreetype6-dev:amd64 但无法安装它
                       依赖: libpng-dev:amd64 但无法安装它
                       依赖: libjpeg-dev:amd64 但无法安装它
                       依赖: libssl-dev:amd64 但无法安装它
                       依赖: libdbus-1-dev:amd64 但无法安装它
                       依赖: libicu-dev:amd64 但无法安装它
                       依赖: libpulse-dev:amd64 但无法安装它
                       依赖: libasound2-dev:amd64 但无法安装它
                       依赖: libgstreamer1.0-dev:amd64 但无法安装它
                       依赖: libgstreamer-plugins-base1.0-dev:amd64 但无法安装它
                       依赖: libwayland-dev:amd64 但无法安装它
E: 无法修正错误，因为您要求某些软件包保持现状，就是它们破坏了软件包间的依赖关系。
```

---

## 2. 解决方式  

观察到安装的软件包都有 `:amd64` 的后缀，而关于架构的问题实际上应该让 `apt` 自动处理。  

### **步骤 1：修改 `DEBIAN/control` 文件**  

在 `.deb` 软件包的 `DEBIAN/control` 文件中，将架构字段修改为 `all`：  

```sh
Architecture: all
```

### **步骤 2：重新安装**  

执行以下命令安装 `.deb` 软件包：  

```sh
apt install ./xxx.deb
```

这样 `apt` 就可以正确解析依赖关系并进行安装。  

---

通过上述方法，可以解决 `deb` 软件包安装时的依赖错误问题，确保 `apt` 正确处理架构相关的依赖解析。
