---
title: "Linux 上文件夹打包方式（权限、所有权、符号链接保留）"
date: 2025-08-12
last_modified_at: 2025-08-12
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/linux-上文件夹打包方式-权限-所有权-符号链接保留/
toc: true
---

## 直接复制 vs tar 打包

| 场景           | 直接复制到 U 盘  | 使用`tar`打包      |
| -------------- | ---------------- | ------------------ |
| **权限保留**   | ✘ 全部丢失       | ✔ 完全保留         |
| **符号链接**   | ✘ 可能损坏       | ✔ 保持链接         |
| **特殊权限位** | ✘ 丢失           | ✔ 保留             |
| **文件所有权** | ✘ 变成当前用户   | ✔ 可还原原始所有者 |
| **时间戳精度** | ✘ 可能改变       | ✔ 纳秒级保留       |
| **硬链接处理** | ✘ 复制为多个文件 | ✔ 保持链接关系     |

## **方法 1：使用 `tar` 归档（推荐）**

### **步骤 1：在源机器打包文件夹**

```bash
# 创建压缩包（保留权限、所有权、符号链接等元数据）
cd /path/to/parent_directory  # 进入目标文件夹的上级目录
tar -cvpzf folder_name.tar.gz folder_name/
```

- **参数解释**：
  - `c`: 创建归档文件
  - `v`: 显示过程（可选）
  - `p`: 保留权限和所有权
  - `z`: 用 gzip 压缩
  - `f`: 指定文件名

> **关键点**：`-p` 选项确保权限/所有权保留，`-C` 或切换到父目录避免包含绝对路径。

---

### **步骤 2：复制到目标机器**

通过任意方式传输文件（如 `scp`）：

```bash
scp folder_name.tar.gz user@remote_host:/destination/path/
```

---

### **步骤 3：在目标机器解包**

```bash
# 解压到目标路径（保留所有属性）
cd /destination/path
sudo tar -xvzp -f folder_name.tar.gz  # 需sudo保留所有权
```

- 使用 `sudo` 确保系统能正确还原文件所有权。

> **注意**：
>
> - 如果目标机器无相同用户/组，解压后需手动调整所有权（用 `chown -R user:group folder_name`）。
> - 如需排除特定文件（如缓存），打包前用 `--exclude=pattern`。

---

## **方法 2：使用 `rsync`（直接同步，无需压缩包）**

如果两台机器网络互通，直接同步更高效：

```bash
# 在目标机器执行（拉取数据）
rsync -avz -e ssh user@source_host:/path/to/folder /destination/path/

# 或在源机器执行（推送数据）
rsync -avz -e ssh /path/to/folder user@remote_host:/destination/path/
```

- **参数解释**：
  - `a`: 归档模式（保留权限、符号链接、时间戳等）
  - `v`: 详细输出
  - `z`: 压缩传输
  - `e ssh`: 通过 SSH 加密传输

> **优点**：增量同步，节省带宽；**缺点**：需 SSH 配置免密登录。

---

### **总结**

- **快速打包迁移** → 用 `tar -cvpzf` 打包，解压时 `sudo tar -xvzp`。
- **频繁同步/更新** → 用 `rsync -avz`。
- **权限还原**：必须 `sudo` 解压，否则所有权丢失！
