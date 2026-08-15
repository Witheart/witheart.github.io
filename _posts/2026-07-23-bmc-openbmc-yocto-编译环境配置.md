---
title: "OpenBMC Yocto 编译环境配置"
date: 2026-07-23
last_modified_at: 2026-07-23
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/openbmc-yocto-编译环境配置/
toc: true
---

安装 Yocto 必备的系统依赖库
```bash
sudo apt update
sudo apt install -y git build-essential python3 python3-pip python3-pexpect \
python3-git python3-jinja2 xz-utils debianutils iputils-ping \
python3-subunit zstd liblz4-tool file locales libacl1 \
socat diffstat curl gcc-multilib g++-multilib \
gawk wget bzip2 chrpath cpio texinfo
```

拉取 OpenBMC 官方源码
```bash
mkdir -p ~/bmc-dev
cd ~/bmc-dev
git clone https://github.com/openbmc/openbmc.git
cd openbmc
```
