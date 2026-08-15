---
title: "Ubuntu 下中文输入法配置"
date: 2025-01-02
last_modified_at: 2025-01-02
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-下中文输入法配置/
toc: true
---

## 前置准备

1. **确保系统语言为中文**  
   在配置中文输入法前，建议先将系统语言设置为中文。这可以通过系统“设置”中的“区域与语言”选项完成。如需详细操作步骤，请参考相关教程。

2. **了解 IBus 框架**  
   **IBus (Intelligent Input Bus)** 是 Linux 系统上常用的输入法框架。它支持多种语言和输入法，尤其适合中文输入。

3. **为什么选择 IBus 框架？**  
   - IBus 提供了一个统一的输入法管理界面，支持多种输入法引擎（如 `ibus-pinyin`、`ibus-libpinyin` 等）。  
   - 它能够与 GTK、Qt 等主流图形界面程序兼容，确保输入法在各种应用中正常工作。  
   - 如果不使用框架，输入法配置将会较为复杂，可能需要针对不同的程序单独设置，增加维护成本。

---

## 配置步骤

### 1. 安装 IBus 框架及相关组件

在终端中依次执行以下命令：

```bash
sudo apt update  # 更新软件源
sudo apt install ibus  # 安装 IBus 输入法框架
sudo apt install ibus-gtk ibus-gtk3  # 安装 GTK 图形界面支持
sudo apt install ibus-pinyin  # 安装拼音输入法引擎
sudo apt install ibus-libpinyin  # 安装更高级的拼音输入法
```

### 2. 设置系统输入法为 IBus

1. 打开终端，运行以下命令设置输入法框架为 IBus：

   ```bash
   im-config -s ibus
   ```

2. 打开系统设置：  
   - 依次进入 **“设置 (Settings)” → “区域与语言 (Region & Language)” → “管理已安装的语言 (Manage Installed Languages)”**。  
   - 在“键盘输入法系统 (Keyboard input method system)”中选择 `IBus`，然后点击“应用到整个系统 (Apply system-wide)`”。  

---

### 3. 配置环境变量

为了确保输入法在不同的图形界面程序中工作，需要配置环境变量。在终端中编辑 `~/.bashrc` 文件：

```bash
nano ~/.bashrc
```

在文件末尾添加以下内容：

```bash
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus
```

保存并关闭文件后，使更改生效：

```bash
source ~/.bashrc
```

---

### 4. 配置 IBus 输入法

1. 在终端输入以下命令，打开 IBus 配置界面：

   ```bash
   ibus-setup
   ```
![alt text](/assets/images/ubuntu-开发指南/ubuntu-下中文输入法配置/image.png)

2. 在弹出的窗口中，点击 **“添加 (Add)”**，然后选择“中文”，添加 **“智能拼音 (Pinyin)”**。
![alt text](/assets/images/ubuntu-开发指南/ubuntu-下中文输入法配置/image-1.png)
![alt text](/assets/images/ubuntu-开发指南/ubuntu-下中文输入法配置/image-2.png)

---

### 5. 配置输入源

1. 打开系统设置，依次进入 **“设置 (Settings)” → “区域与语言 (Region & Language)” → “输入源 (Input Sources)”**。  
2. 点击 **“+”** 号，按以下顺序添加输入法：  
   - **汉语（中国） → 中文（智能拼音）**  
   - **英语（美国） → English (US)**  
3. 在输入源列表中，将 **“中文（智能拼音）”** 拖拽到最顶端，确保中文为默认输入法。  
![alt text](/assets/images/ubuntu-开发指南/ubuntu-下中文输入法配置/image-3.png)

---

### 6. 切换中英文输入

配置完成后，可以按 **`Shift`** 键在中英文输入法之间切换。如果希望自定义切换快捷键，可以在 IBus 设置中调整。
