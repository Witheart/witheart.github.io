---
title: "apk 解包指南"
date: 2024-12-31
last_modified_at: 2024-12-31
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/apk-解包指南/
toc: true
---

## 1. 工具简介

**Apktool** 是一款强大的 Android APK 反编译工具，主要用于对 APK 文件进行解包（disassemble）和重打包（assemble）。它可以帮助开发者和逆向工程师对应用进行分析、翻译或者修改权限等操作。

---

## 2. 工具下载地址

- **官方网站**：[Apktool 官网](https://apktool.org/)

---

## 3. 工具安装方式

1. **下载 Apktool 的 Windows 包装脚本**：

   - 访问 [Install Guide](https://apktool.org/docs/install/) 页面，右键点击 `apktool.bat` 链接并选择“另存为”下载脚本。

2. **下载 Apktool 的最新版本**：

   - 下载 Apktool 的 `.jar` 文件并重命名为 `apktool.jar`。

3. **文件移动**：

   - 将 `apktool.jar` 和 `apktool.bat` 一起移动到 `C://Windows` 目录下。
   - 如果没有权限访问 `C://Windows`，可以将文件移动到任意目录，并将该目录添加到系统的环境变量 `PATH` 中。

4. **运行工具**：

   - 打开命令提示符，输入 `apktool`，测试是否安装成功。

5. **Java 环境**：
   - Apktool 需要 Java 8 或更高版本，如果报 Java 的错误，请确保系统中安装了合适的 Java 环境。
   - [Java 运行环境下载地址](https://www.java.com/zh-CN/)

---

## 4. 工具使用方式

以下是 Apktool 的基本用法：

### 4.1 解包 APK 文件

使用以下命令解包 APK 文件：

```bash
apktool d test.apk
```

运行后输出如下：

```
I: Using Apktool 2.10.0 on test.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: 1.apk
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...
```

解包完成后，可以在指定目录中查看解包结果（包括资源文件、配置文件、DEX 文件等）。

---

### 4.2 重打包 APK 文件

修改资源或代码后，可以通过以下命令重新打包 APK 文件：

```bash
apktool b test
```

运行后输出如下：

```
I: Using Apktool 2.10.0 on test
I: Checking whether sources has changed...
I: Smaling smali folder into classes.dex...
I: Checking whether resources has changed...
I: Building resources...
I: Building apk file...
I: Copying unknown files/dir...
```

重打包完成后，可以在输出目录中找到修改后的 APK 文件。

---

### 4.3 常用命令

1. **仅提取资源和清单文件**：

   ```bash
   apktool d -m test.apk
   ```

   使用 `-m` 参数，工具将只提取资源文件和清单文件，方便快速分析。

2. **指定输出目录**：

   ```bash
   apktool d test.apk -o output_dir
   ```

   使用 `-o` 参数可以指定解包文件的输出目录。

3. **查看版本信息**：
   ```bash
   apktool --version
   ```

---

## 5. 注意事项

- **Java 版本要求**：Apktool 需要 Java 8 或更高版本，请确保系统中安装了合适的 Java 环境。
- **包装脚本的作用**：包装脚本（如 `apktool.bat` 或 `apktool`）可以让用户直接运行 `apktool` 命令，而无需每次输入 `java -jar apktool.jar`。
