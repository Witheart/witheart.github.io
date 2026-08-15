---
title: "Ubuntu20.04 chromium安装(RK SDK debian11版本)"
date: 2026-07-20
last_modified_at: 2026-07-20
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu20-04-chromium安装-rk-sdk-debian11版本/
toc: true
---

## deb获取
- RK 官方 SDK kernel-5.10有预编译好的deb
rk3588/debian/packages/arm64/chromium/chromium-x11_111.0.5563.147_arm64.deb

## 问题
在Ubuntu20.04上，直接安装会报错
```bash
# sudo apt install ./chromium-x11_111.0.5563.147_arm64.deb
正在读取软件包列表... 完成
正在分析软件包的依赖关系树
正在读取状态信息... 完成
您也许需要运行“apt --fix-broken install”来修正上面的错误。
下列软件包有未满足的依赖关系：
 chromium-x11 : 依赖: libavcodec58 (>= 7:4.0) 但无法安装它
                依赖: libavformat58 (>= 7:4.1) 但无法安装它
                依赖: libavutil56 (>= 7:4.0) 但无法安装它
                依赖: libevent-2.1-7 (>= 2.1.8-stable) 但无法安装它
                依赖: libicu67 (>= 63.1-1~) 但无法安装它
                依赖: libjsoncpp24 (>= 1.7.4) 但无法安装它
                依赖: libminizip1 (>= 1.1) 但无法安装它
                依赖: libre2-9 (>= 20160901) 但无法安装它
                依赖: libsnappy1v5 但无法安装它
E: 有未能满足的依赖关系。请尝试不指明软件包的名字来运行“apt --fix-broken install”(也可以指定一个解决办法)。
```

尝试使用apt解决依赖问题
```bash
root@rk3588:~/rk_deb# sudo apt install ./chromium-x11_111.0.5563.147_arm64.deb
正在读取软件包列表... 完成
正在分析软件包的依赖关系树
正在读取状态信息... 完成
您也许需要运行“apt --fix-broken install”来修正上面的错误。
下列软件包有未满足的依赖关系：
 chromium-x11 : 依赖: libavcodec58 (>= 7:4.0)
                依赖: libavformat58 (>= 7:4.1) 但是它还没有被安装
                依赖: libavutil56 (>= 7:4.0) 但是它还没有被安装
                依赖: libevent-2.1-7 (>= 2.1.8-stable) 但是它还没有被安装
                依赖: libicu67 (>= 63.1-1~) 但无法安装它
                依赖: libjsoncpp24 (>= 1.7.4) 但无法安装它
                依赖: libminizip1 (>= 1.1) 但是它还没有被安装
                依赖: libre2-9 (>= 20160901) 但无法安装它
                依赖: libsnappy1v5 但是它还没有被安装
E: 有未能满足的依赖关系。请尝试不指明软件包的名字来运行“apt --fix-broken install”(也可以指定一个解决办法)。

```
有3个包在软件源中找不到，原因是这几个包是在Debian11的源里面的，不在Ubuntu 20.04里。

## 解决方式
```bash
# 下载 libicu67 (带 deb11u1 安全补丁版)
wget http://mirrors.ustc.edu.cn/debian-security/pool/updates/main/i/icu/libicu67_67.1-7+deb11u1_arm64.deb

# 下载 libjsoncpp24 (修正了 libj 目录路径)
wget http://mirrors.ustc.edu.cn/debian/pool/main/libj/libjsoncpp/libjsoncpp24_1.9.4-4_arm64.deb

# 下载 libre2-9 (修正了 20210201 版本号)
wget http://mirrors.ustc.edu.cn/debian/pool/main/r/re2/libre2-9_20210201+dfsg-1_arm64.deb
```

```bash
sudo dpkg -i libicu67_*.deb libjsoncpp24_*.deb libre2-9_*.deb
```

- 重新安装chromium
```bash
sudo apt install ./chromium-x11_111.0.5563.147_arm64.deb
```
