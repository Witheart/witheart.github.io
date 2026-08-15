---
title: "XFCE 安装新语言时报错 policykit.error.failed"
date: 2025-12-22
last_modified_at: 2025-12-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-安装新语言时报错-policykit-error-failed/
toc: true
---

## 具体报错
```
Could not install the full language support org. freedesktop. PolicyKit. Error. Failed:(' system-bus-name',{ name':':1.81}): org. debian. apt. install-or-remove-packages
```

## 问题原因
安装新语言需要管理员权限，而系统中policykit相关的组件缺失，导致无法调起权限的密码输入弹窗。

## 解决方式
```sh
sudo apt-get install policykit-1 policykit-1-gnome
```

然后重启
