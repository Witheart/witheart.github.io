---
title: "修改 GDM 自动登录的账户"
date: 2025-09-16
last_modified_at: 2025-09-16
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/修改-gdm-自动登录的账户/
toc: true
---

- GDM 的主配置文件是 `/etc/gdm/custom.conf`。

```bash
sudo vim /etc/gdm3/custom.conf
```

- 在打开的 `custom.conf` 文件中，找到 `[daemon]` 部分。

需要修改或添加以下两行：

```ini
[daemon]
# 启用自动登录
AutomaticLoginEnable = true
# 设置要自动登录的用户名（请将 your_username 替换为实际用户名）
AutomaticLogin = your_username
```

- **`AutomaticLoginEnable = true`**: 这一行启用自动登录功能。
- **`AutomaticLogin = your_username`**: 这一行指定了哪个用户将自动登录。请将 `your_username` 替换为想要自动登录的**实际用户名**（例如 `alice`）。

**示例：**
假设想让用户 `john` 自动登录，那么配置应该看起来像这样：

```ini
[daemon]
AutomaticLoginEnable = true
AutomaticLogin = john
```

如果之前为其他用户设置过自动登录，直接修改 `AutomaticLogin` 后面的用户名即可。

- 在终端中运行以下命令进行重启验证

```bash
sudo reboot
```
