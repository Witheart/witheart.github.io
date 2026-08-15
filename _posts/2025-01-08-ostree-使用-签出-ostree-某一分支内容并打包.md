---
title: "签出 OSTree 某一分支内容并打包"
date: 2025-01-08
last_modified_at: 2025-01-08
categories:
  - "OSTree 使用"
tags:
  - "OSTree 使用"
permalink: /ostree-使用/签出-ostree-某一分支内容并打包/
toc: true
---

本文介绍如何签出 OSTree 仓库中某一分支的内容，并将其打包为根文件系统。

## 1. 查看分支和提交历史

### 查看仓库中的分支

使用以下命令列出仓库中已有的分支：

```bash
ostree --repo=/path/to/repo refs
```

### 查看分支的提交历史

查看指定分支的提交记录：

```bash
ostree --repo=/path/to/repo log my-linux-rootfs
```

---

## 2. 签出特定提交

### 签出命令格式

OSTree 提供 `checkout` 命令用于签出特定提交：

```bash
ostree checkout [OPTION…] COMMIT [DESTINATION]
```

### 示例操作

签出指定的提交 `90c8ea80d9d96fb2046e836cfef8073086e0f73bebf4783f53f10439d4d93f93` 到目标目录 `/mnt/my_rootfs`：

```bash
ostree checkout -C 90c8ea80d9d96fb2046e836cfef8073086e0f73bebf4783f53f10439d4d93f93 /mnt/my_rootfs --repo=/mnt/hdd/ostree/repo
```

- **`-C` 选项**：禁止使用硬链接（`Never hardlink`），但如果系统支持 `reflink`，仍会使用。
  - **原因**：打包文件系统时需要确保文件完整性，避免硬链接带来的问题。

### 检查签出结果

签出完成后，可以通过以下命令确认目标目录是否包含文件系统内容：

```bash
ls /mnt/my_rootfs
```

---

## 3. 打包文件系统

如果签出成功，目录 `/mnt/my_rootfs` 就包含了完整的文件系统内容。此时可以使用 `hw_export_rootfs` 工具进行打包。

具体打包方法可参考文章《根文件系统打包时如何指定打包的目录》。 

---

通过以上步骤，可以签出 OSTree 仓库中特定分支的内容，并成功打包为文件系统，便于在其他设备上使用。
