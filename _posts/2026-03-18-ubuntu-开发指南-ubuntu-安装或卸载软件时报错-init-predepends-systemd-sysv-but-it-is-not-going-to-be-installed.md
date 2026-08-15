---
title: "Ubuntu 安装或卸载软件时报错 init PreDepends systemd-sysv but it is not going to be installed"
date: 2026-03-18
last_modified_at: 2026-03-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-安装或卸载软件时报错-init-predepends-systemd-sysv-but-it-is-not-going-to-be-installed/
toc: true
---

## 问题描述
Ubuntu 安装或卸载软件时报错 init PreDepends systemd-sysv but it is not going to be installed
具体如下
```bash
root@user:~# sudo apt purge chrony
Reading package lists... Done
Building dependency tree
Reading state information... Done
Some packages could not be installed. This may mean that you have
requested an impossible situation or if you are using the unstable
distribution that some required packages have not yet been created
or been moved out of Incoming.
The following information may help to resolve the situation:

The following packages have unmet dependencies:
 init : PreDepends: systemd-sysv but it is not going to be installed
E: Error, pkgProblemResolver::Resolve generated breaks, this may be caused by held packages.

```

## 问题背景
- RK3568 Ubuntu
- 更换过 /lib/systemd/systemd

## 解决方式
- 将系统时间设置为准确的真实时间
- apt update
- 然后再执行安装或卸载，问题解决

## 原因分析
可能是系统时间不对，导致软件包校验没通过。
