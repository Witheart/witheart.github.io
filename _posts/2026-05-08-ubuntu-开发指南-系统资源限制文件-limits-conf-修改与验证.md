---
title: "系统资源限制文件 limits.conf 修改与验证"
date: 2026-05-08
last_modified_at: 2026-05-08
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/系统资源限制文件-limits-conf-修改与验证/
toc: true
---

## 1 修改方式

vim /etc/security/limits.conf

- 加入

```conf
* soft nofile 655350
* hard nofile 655350
* soft nproc 655350
* hard nproc 655350
* soft memlock unlimited
* hard memlock unlimited
root soft nofile 655350
root hard nofile 655350

```

## 2 限制分类

soft（软限制）：警戒线。这是用户当前实际生效的限制。用户可以自己修改软限制，但不能超过硬限制。
hard（硬限制）：天花板。这是系统允许的最大限制，只有 root管理员才能修改。

## 3 配置解读

这些配置主要分为三大类：文件句柄数、进程数、内存锁定。

### 1. 文件句柄数（nofile - Number of Open Files）

```bash
* soft nofile 655350
* hard nofile 655350
root soft nofile 655350
root hard nofile 655350
```

- **是什么**：控制一个用户可以同时打开的文件数量（在 Linux 中，一切皆文件，包括网络连接、设备等都是文件）。
- **为什么这么配**：在高并发场景下（比如 Nginx 处理大量请求、Redis 响应海量连接），每个 TCP 连接都会占用一个文件句柄。如果这个值太小，服务器很容易报 `Too many open files`（文件句柄耗尽）的错误，导致服务拒绝连接甚至崩溃。
- **效果**：将默认的 1024 提升到 655350，确保系统能从容应对海量连接。

### 2. 进程数（nproc - Number of Processes）

```bash
* soft nproc 655350
* hard nproc 655350
```

- **是什么**：限制一个用户能够创建的最大进程（或线程）数量。
- **为什么这么配**：对于需要开启大量线程来处理任务的程序（如 Java 应用的多线程池、Node.js 的集群模式），默认的进程/线程限制很快就会触达瓶颈。调高此值可以防止系统出现 `resource temporarily unavailable` 或无法 fork 新进程的致命错误。

### 3. 内存锁定（memlock - Memory Locking）

```bash
* soft memlock unlimited
* hard memlock unlimited
```

- **是什么**：控制用户可以将多少物理内存“锁定”在 RAM 中，禁止其被交换到磁盘（Swap）。
- **为什么这么配（极其关键）**：
  很多高性能组件（最典型的是 **Oracle 数据库** 和 **Redis**）在底层实现中，会依赖“内存锁定”来保证极高的读写性能。如果这部分内存被操作系统因为内存紧张而交换到了磁盘 Swap 分区，性能会呈现断崖式下跌（磁盘 I/O 比内存慢十万倍）。
  设置为 `unlimited`（无限制），就是给这些核心服务“开绿灯”，允许它们霸占物理内存，从而保证低延迟和高吞吐。

## 4 为什么既要配 `*` 又要配 `root`？

第一行写了 `*`（代表所有用户），为什么后面还要单独给 `root` 配一套？

这是因为在早期的 Linux 版本（如 CentOS 6 及以前）中，`*` 通配符**并不包含 `root` 用户**。如果不单独为 `root` 显式声明，管理员在执行高负载任务时依然会受到默认的低限额限制。
虽然在较新的系统中这个问题已经修复，但在企业生产环境中，为了兼容不同版本并确保绝对安全，运维工程师通常会养成“既写 `*` 又写 `root`”的防御性编程/配置习惯。

## 5 修改验证
limits.conf 对当前已经打开的 Shell 会话无效，需要重新打开一个查看：
```bash
ulimit -a          # 查看所有限制
ulimit -n          # 专门查看最大文件打开数 (open files)
ulimit -u          # 专门查看最大进程数 (max user processes)
```
注意，有的 * 通配符不匹配root用户，所以需要打开普通用户的Shell会话查看。
