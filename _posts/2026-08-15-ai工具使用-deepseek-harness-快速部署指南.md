---
title: "DeepSeek Harness 快速部署指南"
date: 2026-08-15
last_modified_at: 2026-08-15
categories:
  - "AI工具使用"
tags:
  - "AI工具使用"
permalink: /ai工具使用/deepseek-harness-快速部署指南/
toc: true
---

> 面向**第一次使用** DeepSeek Harness（简称 dsh）的新手。跟着下面 5 步走，约 10~20 分钟即可跑起来。

DeepSeek Harness 是一个**网页应用**：启动后会在本地运行一个服务，然后在**浏览器**里访问使用（默认地址 `http://127.0.0.1:3080`）。它没有独立的桌面窗口。


## 项目地址

- https://github.com/deepseek-ai/deepseek-harness

## 第 0 步：了解你需要什么

| 前置条件 | 说明                                   |
| -------- | -------------------------------------- |
| 操作系统 | Windows（本教程针对 Windows）          |
| Node.js  | 版本 `22.19+` 或 `24+`（下面会教你装） |
| 磁盘空间 | 约 2 GB 以上（依赖较多）               |
| 网络     | 能访问 GitHub 和 npm 仓库              |

---

## 第 1 步：安装 Node.js

1. 打开官网 <https://nodejs.org>
2. 点击 **LTS** 版本下载（例如 Node.js 24 LTS 的 `.msi` 安装包）
3. 双击运行安装包，一路 **Next**（全部保持默认即可）
4. 安装完成后，**关闭所有已打开的 PowerShell / 命令行窗口**，再重新打开一个新的

**验证是否装好**（新开的 PowerShell 里输入）：

```powershell
node --version
```

如果显示类似 `v24.x.x` 的版本号，说明安装成功。如果提示"无法识别 node"，请重新打开窗口或重启电脑后再试。

---

## 第 2 步：安装 pnpm

`pnpm` 是这个项目要求的包管理器。在**同一个 PowerShell 窗口**里输入：

```powershell
npm install -g pnpm
```

> 如果这一步报"禁止运行脚本"（`about_Execution_Policies` 错误），先执行下面这条放宽当前用户权限，再重新运行上面的命令：
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

验证：

```powershell
pnpm --version
```

---

## 第 3 步：获取项目代码

### 方式 A：用 Git 克隆（推荐，方便后续更新）

```powershell
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
```

### 方式 B：下载 ZIP 压缩包

1. 访问 <https://github.com/deepseek-ai/deepseek-harness>
2. 点击绿色 **Code** 按钮 → **Download ZIP**
3. 解压到任意目录，然后在 PowerShell 里 `cd` 进入解压后的 `deepseek-harness` 目录

---

## 第 4 步：安装依赖 + 构建

进入项目目录后，依次执行：

```powershell
pnpm install
pnpm run build
```

- `pnpm install`：下载所有依赖（首次会较慢，约几分钟，请耐心等待）
- `pnpm run build`：编译项目（约 1~2 分钟）

> 如果 `pnpm install` 因网络问题失败，可以重试，或配置镜像：
>
> ```powershell
> pnpm config set registry https://registry.npmmirror.com
> ```

---

## 第 5 步：启动并使用

### 手动启动（命令行）

```powershell
pnpm dsh web
```

看到类似 `Web UI is served at http://127.0.0.1:3080` 的输出后，**保持窗口不要关闭**，打开浏览器访问：

```
http://127.0.0.1:3080
```

### 用一键启动工具（可选，更省事）

如果你有 `dsh_start.cmd` 这个工具脚本：

1. 把它复制到 `deepseek-harness` 目录内
2. 双击运行
3. 脚本会自动：检查环境 → 启动服务 → 探测就绪 → 自动打开浏览器
