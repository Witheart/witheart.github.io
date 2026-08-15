---
title: "如何构建 DEB 包"
date: 2026-07-15
last_modified_at: 2026-07-15
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/如何构建-deb-包/
toc: true
---

本文是一篇通用指南，介绍如何将任意一组文件打包为 `.deb` 安装包，适配 Debian/Ubuntu 等系统。


## 1. DEB 包的本质

一个 `.deb` 文件本质上是一个 **ar 归档**，内部包含三个文件：

```
xxx.deb
├── debian-binary    ← 固定内容 "2.0\n"
├── control.tar.gz   ← 包元信息 + 安装/卸载脚本
└── data.tar.gz      ← 要安装到系统的文件（按系统路径组织）
```

我们不需要手动操作 ar 格式，`dpkg-deb` 命令会帮我们完成这一切。

---

## 2. 最小 DEB 包

只需三个文件就能生成一个可安装的 deb 包：

### 目录结构

```
myapp_1.0.0_arm64/          ← 目录名格式：<包名>_<版本号>_<架构>
├── DEBIAN/
│   └── control             ← 包元信息（唯一必须的文件）
└── usr/
    └── local/
        └── bin/
            └── myapp       ← 要安装的文件，路径即目标路径
```

### `DEBIAN/control` 内容

```
Package: myapp
Version: 1.0.0
Architecture: arm64
Maintainer: YourName <you@example.com>
Description: A minimal example deb package
```

### 打包

```bash
dpkg-deb --root-owner-group --build myapp_1.0.0_arm64
```

生成 `myapp_1.0.0_arm64.deb`，用 `sudo dpkg -i` 安装后，文件会出现在 `/usr/local/bin/myapp`。

---

## 3. 目录名规范

```
<包名>_<版本号>_<架构>/
```

| 部分   | 规则                             | 示例                  |
| ------ | -------------------------------- | --------------------- |
| 包名   | 小写字母、数字、`-`、`+`、`.`    | `my-rk3588npu-driver` |
| 版本号 | 数字 + 点号，可带字母后缀        | `1.0.0`、`1.6.0a`     |
| 架构   | `amd64`、`arm64`、`armhf`、`all` | `arm64`               |

> `Architecture: all` 表示与架构无关（纯脚本、配置文件等）。

---

## 4. DEBIAN/ 目录详解

`DEBIAN/` 下的文件不会安装到系统，仅供 `dpkg` 使用。

### 4.1 control（必须）

```
Package: myapp
Version: 1.0.0
Architecture: arm64
Maintainer: YourName <you@example.com>
Section: utils
Priority: optional
Depends: libc6 (>= 2.28)
Homepage: https://example.com
Description: Short description (one line)
 This is the long description,
 can span multiple lines.
 Each continuation line starts with a space.
```

| 字段           | 说明                                       |
| -------------- | ------------------------------------------ |
| `Package`      | 包名，唯一标识                             |
| `Version`      | 版本号，升级时用于比较新旧                 |
| `Architecture` | 目标 CPU 架构                              |
| `Maintainer`   | 维护者姓名和邮箱                           |
| `Depends`      | 依赖的其他包，逗号分隔                     |
| `Description`  | 首行简短描述，后续行（以空格开头）是长描述 |

### 4.2 安装/卸载脚本（可选）

这些脚本在特定时机由 `dpkg` 调用，用 `$1` 参数区分操作阶段：

| 脚本       | 触发时机 | 典型用途           |
| ---------- | -------- | ------------------ |
| `preinst`  | 安装前   | 备份旧配置         |
| `postinst` | 安装后   | 启用服务、创建用户 |
| `prerm`    | 卸载前   | 停止服务           |
| `postrm`   | 卸载后   | 清理日志、删除用户 |

**`postinst` 模板：**

```bash
#!/bin/sh
set -e

case "$1" in
    configure)
        # 安装完成后要做的事
        systemctl enable myapp
        echo "Install complete."
    ;;
    abort-upgrade|abort-remove|abort-deconfigure)
        # 升级/卸载被中止时，通常留空
    ;;
    *)
        echo "postinst called with unknown argument '$1'"
    ;;
esac
```

**`prerm` 模板：**

```bash
#!/bin/sh
set -e

case "$1" in
    remove|upgrade|deconfigure)
        # 卸载/升级前要做的事
        systemctl stop myapp
        systemctl disable myapp
    ;;
    failed-upgrade)
        # 升级失败
    ;;
    *)
        echo "prerm called with unknown argument '$1'"
    ;;
esac
```

### 4.3 conffiles（可选）

列出哪些文件是配置文件，升级时不会直接覆盖，而是提示用户选择：

```
/etc/myapp/config.yaml
/etc/myapp/settings.ini
```

一行一个绝对路径。

---

## 5. 文件权限要求

| 文件类型           |  权限   | 说明         |
| ------------------ | :-----: | ------------ |
| `DEBIAN/` 下的脚本 | **755** | 必须可执行   |
| 可执行二进制       | **755** | 必须可执行   |
| Shell 脚本         | **755** | 必须可执行   |
| 动态库 `.so`       | **644** | 普通文件即可 |
| 配置文件 / 头文件  | **644** | 普通文件即可 |
| `DEBIAN/control`   | **644** | 普通文件即可 |

> 使用 `dpkg-deb --root-owner-group` 自动把所有文件属主设为 `root:root`。

```bash
# 权限设置参考
chmod 755 DEBIAN/postinst DEBIAN/prerm DEBIAN/preinst DEBIAN/postrm
chmod 755 usr/bin/*                         # 可执行文件
chmod 644 usr/lib/*.so                      # 动态库
chmod 644 etc/*                             # 配置文件
```

---

## 6. 完整 DEB 包模板

```
myapp_1.0.0_arm64/
├── DEBIAN/
│   ├── control
│   ├── postinst
│   ├── prerm
│   └── conffiles               ← 可选
├── etc/
│   └── myapp/
│       └── config.yaml
├── lib/
│   └── systemd/
│       └── system/
│           └── myapp.service
└── usr/
    ├── bin/
    │   └── myapp
    ├── lib/
    │   └── libmyapp.so
    └── share/
        └── doc/
            └── myapp/
                └── README
```

---

## 7. systemd 服务集成

如果包需要开机自启的后台服务，加入服务文件：

**`lib/systemd/system/myapp.service`：**

```ini
[Unit]
Description=My Application Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Restart=always
RestartSec=1
User=root

[Install]
WantedBy=multi-user.target
```

在 `postinst` 中 `systemctl enable myapp`，`prerm` 中 `systemctl disable myapp`。

---

## 8. 打包命令

```bash
# 基础打包
dpkg-deb --build <目录名>

# 推荐：强制 root 属主
dpkg-deb --root-owner-group --build <目录名>

# 指定输出文件名
dpkg-deb --root-owner-group --build <目录名> <输出文件名>.deb

# 最高压缩比（包更小，安装稍慢）
dpkg-deb -Zxz --root-owner-group --build <目录名>
```

> `-Zxz` 用 xz 压缩，比默认 gzip 更小，适合大文件。

---

## 9. ⚠️ 常见陷阱

### 9.1 CRLF 换行符

Windows 编辑器默认写入 `\r\n`，Linux 只认 `\n`。脚本带有 CRLF 会报：

```
没有那个文件或目录
```

**检测：**

```bash
file DEBIAN/postinst | grep CRLF
```

**修复：**

```bash
# vim
vim DEBIAN/postinst
:set ff=unix
:wq

# sed
sed -i 's/\r$//' DEBIAN/postinst
```

### 9.2 脚本权限不足

如果 `postinst` 权限是 644 而非 755，`dpkg` 会提示无法执行。

```bash
chmod 755 DEBIAN/postinst
```

### 9.3 control 文件格式错误

- 每个字段冒号后**必须有一个空格**
- 不能有空行
- 长描述续行以空格开头

❌ 错误：

```
Description:MyApp  ← 缺少空格
Description: My app ← 首行描述后直接换行（没空格开头的续行可以，但不能有空行）
```

✅ 正确：

```
Description: A minimal example
 This is a longer description
 spanning multiple lines
```

### 9.4 目录名与 control 不一致

目录名中的包名、版本号、架构可以和 `control` 不同（以 control 为准），但建议保持一致，否则容易混淆。

---

## 10. 调试技巧

### 不安装，仅解压查看内容

```bash
# 解压 control 信息
dpkg-deb -e xxx.deb ./extracted/DEBIAN

# 解压数据文件
dpkg-deb -x xxx.deb ./extracted/

# 查看包信息
dpkg-deb -I xxx.deb

# 列出所有文件
dpkg-deb -c xxx.deb
```

### 安装失败排查

```bash
# 查看 dpkg 错误详情
sudo dpkg -i xxx.deb 2>&1

# 查看残留状态
dpkg -l | grep 包名

# 查看已安装包的文件列表
dpkg -L 包名

# 强制清除残留
sudo rm -f /var/lib/dpkg/info/包名.*
sudo dpkg --purge 包名
```

### 模拟安装

```bash
# 只检查依赖和冲突，不实际安装
sudo dpkg --dry-run -i xxx.deb
```

---

## 11. 完整构建脚本模板

```bash
#!/bin/sh
# build-deb.sh - 一键构建 deb 包

PKG_DIR="myapp_1.0.0_arm64"

echo "=== 1. Set permissions ==="
chmod 755 ${PKG_DIR}/DEBIAN/postinst
chmod 755 ${PKG_DIR}/DEBIAN/prerm
chmod 644 ${PKG_DIR}/DEBIAN/control
chmod 755 ${PKG_DIR}/usr/bin/*
chmod 644 ${PKG_DIR}/usr/lib/*
chmod 644 ${PKG_DIR}/etc/*

echo "=== 2. Build ==="
dpkg-deb --root-owner-group --build ${PKG_DIR}

echo "=== 3. Verify ==="
dpkg-deb -I ${PKG_DIR}.deb
echo ""
dpkg-deb -c ${PKG_DIR}.deb
echo ""
echo "Build complete: ${PKG_DIR}.deb"
```

---

## 12. 总结

| 步骤 | 操作                                         |
| ---- | -------------------------------------------- |
| ①    | 创建 `<包名>_<版本>_<架构>/DEBIAN/control`   |
| ②    | 按系统路径放置要安装的文件                   |
| ③    | 编写 `postinst`/`prerm` 等脚本（按需）       |
| ④    | `chmod 755` 可执行文件，`chmod 644` 普通文件 |
| ⑤    | `dpkg-deb --root-owner-group --build` 打包   |
| ⑥    | `sudo dpkg -i` 安装，`dpkg -r` 卸载          |
