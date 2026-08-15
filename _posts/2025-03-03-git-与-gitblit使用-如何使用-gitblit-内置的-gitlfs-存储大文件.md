---
title: "如何使用 Gitblit 内置的 GitLFS 存储大文件"
date: 2025-03-03
last_modified_at: 2025-03-03
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/如何使用-gitblit-内置的-gitlfs-存储大文件/
toc: true
---

概要：本文介绍如何使用 Gitblit 内置的 Git LFS 进行大文件存储，以管理根文件系统镜像压缩包的版本。包括 Gitblit 配置、仓库初始化、Git LFS 设置及如何上传和下载特定 commit 的压缩包。  


## 1. 背景与目标  

需要进行根文件系统镜像压缩包的版本管理，因此选择 Git 进行管理。目标如下：  

- 对压缩包进行 Git 仓库的版本控制，可随时下载指定分支或 commit 的压缩包。  
- 使用 Gitblit 进行仓库的可视化查看和文件下载。  
- 文件存储在远程服务器上，Gitblit 也运行在远程服务器上。  
- 使用 Gitblit 内置的 filestore（即 Git LFS），将压缩包与实际的仓库分离，仅存储指针文件。  

### 1.1 方案优势  

- **突破 Git 本身上传大小限制**，适合存储大文件。  
- **提升 Git 仓库性能**，仅存储文本数据，避免性能下降。  
- **文件去重**，其他仓库可复用已上传文件（基于哈希识别）。  

---

## 2. 配置 Gitblit 以支持 LFS  

Gitblit 默认启用 LFS，但你可能需要修改服务器配置文件 `./data/gitblit.properties` 以适应需求：  

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `filestore.storageFolder` | `${baseFolder}/lfs` | 指定存储 LFS 文件的服务器路径 |
| `filestore.maxUploadSize` | `-1` | 允许上传的最大文件大小，`-1` 表示无限制 |

配置详情参考：[Gitblit Filestore 配置](https://www.gitblit.com/setup_filestore.html)。  

---

## 3. 仓库初始化  

### 3.1 在 Gitblit 创建版本库  

1. 登录 Gitblit，创建一个新的仓库。  
2. **建议**勾选“加入 README”，否则需在本地初始化仓库并手动关联远程仓库。  

示例截图：  
![创建仓库](/assets/images/git-与-gitblit使用/如何使用-gitblit-内置的-gitlfs-存储大文件/image.png)  

### 3.2 本地克隆仓库  

- **建议使用 HTTP** 方式克隆，而非 SSH（Git LFS 在 SSH 下可能不稳定）。  
- **优化网络访问**：如果域名访问过慢，可在局域网内使用 `IP + 端口号` 替代域名。端口号可在 `gitblit.properties` 或 `defaults.properties` 中查看。  

示例截图：  
![仓库克隆](/assets/images/git-与-gitblit使用/如何使用-gitblit-内置的-gitlfs-存储大文件/image-2.png)  

- **注意**：部分网络环境下可能会影响克隆，建议先关闭代理或 VPN。  

---

## 4. 配置 Git LFS  

在本地仓库中，使用以下命令安装 Git LFS 并初始化：  

```sh
git lfs install
```

然后，在 `.gitattributes` 文件中定义需要使用 Git LFS 管理的文件类型，例如：  

```sh
git lfs track "*.docx"
git lfs track "*.pdf"
```

这将在仓库中创建 `.gitattributes` 文件，并添加相应的过滤规则。  

---

## 5. 上传大文件  

### 5.1 新增压缩包并提交  

1. 在本地仓库新增压缩包。  
2. 执行 `git add`、`git commit`，然后 `git push` 上传到远程服务器。  
3. **优化上传速度**：如果上传速度慢，可使用 `局域网 IP + 端口号` 替代域名。  

### 5.2 在 Gitblit 上查看上传的文件  

在 Gitblit 上查看仓库，如果文件旁边有 Git LFS 图标，则表示成功存储至 Gitblit filestore。  

示例截图：  
![LFS 存储成功](/assets/images/git-与-gitblit使用/如何使用-gitblit-内置的-gitlfs-存储大文件/image-3.png)  

还可以在 filestore 目录中查看上传的压缩包：  

示例截图：  
![filestore 目录](/assets/images/git-与-gitblit使用/如何使用-gitblit-内置的-gitlfs-存储大文件/image-4.png)  

---

## 6. 下载特定 commit 的压缩包  

1. 在 Gitblit 上打开仓库，进入对应的 commit 页面。  
2. 点击 **下载** 按钮，即可获取该 commit 的压缩包。  

示例截图：  
[下载特定 commit 文件](image-5.png)  

---

## 7. 结论  

通过 Gitblit 内置的 Git LFS，可以高效管理大文件，提升 Git 仓库性能，并实现对指定 commit 版本的精准下载。  

**总结优点：**  

- 解决 Git 原生对大文件的上传限制。  
- 使用 Gitblit filestore 分离数据存储，提高仓库性能。  
- 可在 Gitblit 界面方便地管理和下载大文件。  
