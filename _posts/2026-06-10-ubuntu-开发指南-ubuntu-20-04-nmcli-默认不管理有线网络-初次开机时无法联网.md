---
title: "Ubuntu 20.04 nmcli 默认不管理有线网络 —— 初次开机时无法联网"
date: 2026-06-10
last_modified_at: 2026-06-10
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-20-04-nmcli-默认不管理有线网络-初次开机时无法联网/
toc: true
---

## 1. 配置目录的优先级差异

像 NetworkManager（NM）以及 systemd 等现代 Linux 核心组件，通常会从多个目录读取配置文件。它们有着严格的优先级顺序：

- `/usr/lib/NetworkManager/conf.d/`：**低优先级**。这里存放的是操作系统（Ubuntu）打包时自带的“系统默认配置”。包管理器在更新系统时可能会覆盖这里的文件。
- `/etc/NetworkManager/conf.d/`：**高优先级**。这里专门留给系统管理员（也就是用户）存放自定义配置。更新系统时，这里的文件不会被修改。

当这两个目录中出现了**同名文件**时，NM 会认为管理员想要修改默认行为，因此会**只读取 `/etc/` 下的那个文件，而完全无视 `/usr/lib/` 下的同名文件。**

## 2. Ubuntu 默认做了什么限制？

如果你去查看 Ubuntu 系统默认的 `/usr/lib/NetworkManager/conf.d/10-globally-managed-devices.conf` 文件，你会发现里面大概写着类似这样的规则：

```ini
[keyfile]
unmanaged-devices=*,except:type:wifi,except:type:gsm,except:type:cdma
```

这段规则的意思是：“除了 WiFi 和移动网络（4G/5G 等），其他的网卡（比如有线网卡 eth0）全部标记为 `unmanaged`（未托管），不要去管它们。”
Ubuntu 这样设计是因为它默认使用 `Netplan` 或 `systemd-networkd` 来管理有线网络，为了防止 NetworkManager 抢夺控制权导致冲突，所以加了这个限制。

## 3. 解决限制方式

```bash
touch /etc/NetworkManager/conf.d/10-globally-managed-devices.conf

```

当 NetworkManager 启动并加载配置时，它的处理逻辑如下：

1. 发现了系统默认的 `/usr/lib/.../10-globally-managed-devices.conf`。
2. 发现了用户自定义的 `/etc/.../10-globally-managed-devices.conf`。
3. 因为名字一样，使用高优先级的 `/etc/` 版本，**抛弃系统默认版本**。
4. 读取 `/etc/` 下的这个文件，**发现里面是空的，没有任何限制规则**。
5. 既然没有任何限制规则，NetworkManager 就会回退到它的默认原始出厂行为：**接管系统里发现的所有网卡**。

## 总结

这种方法极其优雅。你没有去修改或删除 `/usr/lib/` 下的系统文件（直接修改系统文件不仅不安全，还可能在下次系统更新时被强行恢复覆盖），而是利用了系统的规则，用一个合法的“空指令”在更高层级拦截并废除了底层的限制。
