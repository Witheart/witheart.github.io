---
title: "Allegro Cadence 原理图导出为 PDF"
date: 2026-07-22
last_modified_at: 2026-07-22
categories:
  - "Allegro"
tags:
  - "Allegro"
permalink: /allegro/allegro-cadence-原理图导出为-pdf/
toc: true
---

## 概述

Cadence OrCAD Capture 本身没有直接"另存为 PDF"的功能。将原理图导出为 PDF 主要有三种方法：

| 方法                                | 适用版本    | 需要额外软件             | 书签/跨页       | 推荐度    |
| ----------------------------------- | ----------- | ------------------------ | --------------- | --------- |
| 方法一：打印为 PDF                  | 所有版本    | 无（系统自带虚拟打印机） | 无              | 快速查看  |
| 方法二：Export PDF + Ghostscript    | 17.2 / 17.4 | Ghostscript              | 有（Smart PDF） | 推荐      |

注意：方式二没有实际尝试过

---

## 方法一：打印为 PDF（虚拟打印机，最简单）

此方法无需安装任何额外软件，利用系统自带的 `Microsoft Print to PDF`，或已安装的 `Adobe PDF`、`WPS PDF` 等虚拟打印机即可。

### 操作步骤

1. **选中工程文件**  
   在 OrCAD Capture 左侧项目管理器中，单击选中要导出的 `.dsn` 根文件。

2. **打印设置**
   - 点击菜单栏 `File` → `Print Setup...`
   - 在弹出的窗口中将打印机选择为 `Microsoft Print to PDF`（或 `Adobe PDF`、`WPS PDF` 等）。
   - 根据需要调整纸张大小（A4/A3）和方向（横向/纵向）。

3. **执行打印**
   - 点击菜单栏 `File` → `Print...`（或直接按 `Ctrl + P`）。
   - 确认打印机为刚才选择的 PDF 虚拟打印机，点击 `OK`。
   - 在弹出的保存对话框中，选择保存路径、输入文件名，点击保存。

> **注意**：如果找不到 `WPS PDF` 选项，说明电脑未安装 WPS 办公软件，安装后即可显示。

### 优缺点

- **优点**：操作简单，无需安装额外软件，兼容所有版本。
- **缺点**：生成的 PDF 没有书签、跨页跳转等交互功能，不便在大型原理图中导航。

---

## 方法二：Export PDF + Ghostscript（推荐，生成 Smart PDF）

OrCAD Capture 17.2 / 17.4 内置了 `File → Export → PDF` 功能，配合 Ghostscript 可以导出带书签、带跨页引用、带元件属性且文本可搜索的 **Smart PDF**，方便团队评审和软件工程师查看。

### 2.1 下载并安装 Ghostscript

Ghostscript 是一个开源的 PostScript 解释器和 PDF 渲染器，负责将 PS 中间文件转换为最终的 PDF。

1. 访问 Ghostscript 官网下载页：  
   `https://www.ghostscript.com/releases/index.html`

2. 根据系统选择对应版本：
   - Windows 64-bit：下载 `Ghostscript x.x.x for Windows (64 bit)`
   - Windows 32-bit：下载 `Ghostscript x.x.x for Windows (32 bit)`

3. 安装时 **务必记住安装路径**，默认路径类似：  
   `C:\Program Files\gs\gs10.0x.x\bin\gswin64.exe`

4. **建议**：安装后，将 Ghostscript 的 `bin` 目录添加到系统环境变量 `PATH` 中，后续配置更便捷。

### 2.2 在 OrCAD Capture 中导出

1. **选中 .dsn 文件**  
   在项目管理器中，单击选中原理图根文件（`.dsn`）。

2. **打开导出对话框**  
   点击菜单栏 `File` → `Export` → `PDF`。  
   弹出 **PDF Export** 设置窗口。

3. **设置输出路径**  
   在 **Output PDF** 区域选择保存路径和文件名。

4. **配置 PS 驱动**（若有此选项）  
   输入虚拟打印机的名称，如 `Adobe PDF`。该名称必须与 Windows 中 `设置 → 打印机和扫描仪` 里显示的名称 **完全一致**（不区分大小写）。

5. **配置 Converter Path**
   - 在 **Converter Path** 栏中，点击右侧 `[...]` 浏览按钮。
   - 定位到 Ghostscript 安装目录下的 `gswin64.exe`（或 `gswin32.exe`），选中确认。
   - 若已添加环境变量，可直接填入 `gswin64.exe`。

6. **确认状态**  
   配置正确后，窗口底部的错误提示会由 **红色** 变为 **绿色**，表示可以正常导出。

7. **导出**  
   点击 **OK**，等待转换完成。导出的 PDF 将包含：
   - 原理图页书签（Page number）
   - 元件位号书签（Reference）
   - 网络名书签（Net name）
   - 可搜索的文本内容
   - 跨页连接跳转

### 2.3 完整流程图

```
选中 .dsn → File → Export → PDF
    ↓
设置输出路径和文件名
    ↓
配置 PS 驱动名称（如 Adobe PDF）
    ↓
指定 Ghostscript 路径 (gswin64.exe)
    ↓
底部状态变绿 → 点击 OK → 生成 Smart PDF
```

### 2.4 注意事项

- **原理图页码顺序**：PDF 中的页码顺序可能与 OrCAD 中的顺序不一致。需在原理图中放置 TitleBlock，然后使用 `Tools → Annotate` → `Reset part references to "?"` + `Incremental reference update` 重排 Page Number。
- **Adobe PDF 字体问题**：如果导出报字体错误，需进入打印机属性 → `Adobe PDF Settings` → 关闭 `Rely on system fonts only; do not use document fonts` 选项。
- **Ghostscript 版本**：建议使用较新版本（9.50 及以上），兼容性更好。
