---
title: "Ubuntu 如何下载到过往版本的deb包(launchpad)(apt软件源无法下载的)"
date: 2026-07-10
last_modified_at: 2026-07-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/
toc: true
---

## 前言
有时候需要下载旧版本的deb包，但是该包在apt镜像源中已经下载不到了，这时候就需要前往launchpad下载deb包的存档，但是该网站的下载链接比较难找，故出此笔记记录。

## 下载方式
- 进入网站 https://launchpad.net/ubuntu
- 点击搜索
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-41-41.png)

- 点击进入
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-45-58.png)

- 下滑找到发行版
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-51-52.png)

- 找到对应的版本
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-52-49.png)

- 找到Builds，点击对应的架构
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-53-36.png)

- 找到Built files，点击下载对应的包
![alt text](/assets/images/ubuntu-开发指南/ubuntu-如何下载到过往版本的deb包-launchpad-apt软件源无法下载的/PixPin_2026-07-10_09-55-21.png)

## Launchpad 网站介绍
Launchpad 是由 **Canonical** 公司（Ubuntu 的母公司）开发并维护的一个集成了软件开发、项目协作和托管的托管平台。它是专门为了支持大范围、多团队协作的自由与开源软件（FOSS）项目而设计的，最著名的应用案例就是整个 **Ubuntu Linux 操作系统及其衍生版本的开发、构建和打包流程都是基于 Launchpad 运行的。**

与 GitHub、GitLab 这类纯粹以 Git 仓库和代码托管为核心的平台相比，Launchpad 的设计更偏向于**全流程的 Linux 发行版协同构建生态**。

### 1. 代码托管与评审 (Code)

- 支持 Git 和传统的 Bazaar (BZR) 分布式版本控制系统。
- 提供代码在线评审（Code Review）和合并请求（Merge Requests）功能。
- 它能够做到**代码仓库与 Ubuntu 官方软件源（Repositories）的深度绑定**。

### 2. 软件构建与 PPA 个人源 (Soyuz)

这是 Launchpad 区别于其他平台最具杀伤力的功能：

- **PPA (Personal Package Archive)**：允许个人开发者或团队上传 Debian/Ubuntu 格式的源码包（Source Package）。Launchpad 拥有庞大的分布式后端编译集群，会自动将你上传的源码在各种 CPU 架构（x86, ARM, RISC-V, PowerPC 等）上编译成编译好的 `.deb` 二进制包。
- 开发者无需自己搭建交叉编译环境，就能轻松发布软件供数百万 Ubuntu 用户通过 `apt install` 直接安装。

### 3. 缺陷跟踪系统 (Bugs)

- 它的 Bug 追踪功能极其强大，支持**跨项目关联**。如果一个 Bug 同时存在于 Ubuntu、Upstream 开源项目（如 Linux 内核或 Xorg）以及某个特定的衍生版中，Launchpad 允许将这几个项目的 Bug 报告关联在一起，一处修复，各处同步状态。
- 完美与 Ubuntu 系统的自动崩溃报告工具（Apport）集成，系统崩溃时可自动在此提交日志。

### 4. 翻译系统 (Translations)

- 这是一个基于 Web 的国际化翻译平台。任何志愿者无需懂代码，只需通过网页就能直接为开源软件贡献各个语种的界面翻译（`.po` 文件）。
- 这些翻译成果会自动打包，并在下一个系统更新周期中推送给用户。

### 5. 蓝图与路线图管理 (Blueprints)

- 用于记录、讨论和追踪产品的新功能需求（Specification）。
- 团队可以用它来规划下一个系统版本（如 Ubuntu 26.10）的开发里程碑和功能路线图。
