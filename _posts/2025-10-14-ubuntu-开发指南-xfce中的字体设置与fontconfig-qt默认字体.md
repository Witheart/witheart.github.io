---
title: "XFCE中的字体设置与fontconfig，Qt默认字体"
date: 2025-10-14
last_modified_at: 2025-10-14
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce中的字体设置与fontconfig-qt默认字体/
toc: true
---

概要：本文介绍了在 RK3568 + Ubuntu + Xfce4 环境中，通过 Fontconfig 配置方式修改 Qt5 应用默认字体为“文泉驿等宽微米黑”的方法，并探讨了桌面环境字体设置对 Qt 程序的影响范围。


## 1. 背景描述  

在 RK3568 的 Ubuntu + Xfce4 环境中，用户通过桌面设置（外观 → 字体）将默认字体设为“文泉驿等宽微米黑”。这一设置对大多数应用（如桌面、菜单、文件管理器、Chromium 等）生效，但对使用自行编译的 Qt5 库构建的 Qt 程序无效。

---

## 2. 解决方式  

为了解决 Qt 程序字体不生效的问题，可以使用 Fontconfig 进行字体配置。Fontconfig 是 Linux 和类 Unix 系统（包括 macOS）中用于管理字体发现、选择和渲染的核心库，广泛被 GTK、Qt、Firefox、LibreOffice 等应用使用。

### 2.1 检查当前默认字体  

使用以下命令检查当前系统匹配的默认字体：

```bash
fc-match
```

输出示例：

```
DejaVuSans.ttf: "DejaVu Sans" "Book"
```

可以看到当前默认字体为 DejaVu Sans，而非所期望的“文泉驿等宽微米黑”。

---

### 2.2 修改 Fontconfig 配置  

编辑桌面用户目录下的 Fontconfig 配置文件：

```bash
~/.config/fontconfig/fonts.conf
```

填入以下内容：

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
    <!-- 设置默认字体为文泉驿等宽微米黑 -->
    <match target="pattern">
        <edit name="family" mode="prepend" binding="strong">
            <string>WenQuanYi Micro Hei Mono</string>
        </edit>
    </match>

    <!-- 注释掉或删除字体大小设置部分 -->
    <!--
    <match target="pattern">
        <edit name="size" mode="assign">
            <double>20</double>
        </edit>
    </match>
    -->

    <!-- 添加别名确保兼容不同名称 -->
    <alias>
        <family>monospace</family>
        <prefer>
            <family>WenQuanYi Micro Hei Mono</family>
        </prefer>
    </alias>
    <alias>
        <family>sans-serif</family>
        <prefer>
            <family>WenQuanYi Micro Hei Mono</family>
        </prefer>
    </alias>
</fontconfig>
```

---

### 2.3 刷新缓存并验证  

刷新字体缓存：

```bash
fc-cache -fv
```

再次使用 `fc-match` 验证字体：

```bash
fc-match
```

---

## 3. 关系探寻  

### 3.1 桌面设置为何不影响 Qt 程序？  

虽然桌面环境中设置了字体，但该设置可能不被自行编译的 Qt 程序识别。以下是一些可能原因：

- 桌面字体设置保存在如下 XML 文件中：

```bash
~/.config/xfce4/xfconf/xfce-perchannel-xml/xsettings.xml
```

- 桌面设置对哪些程序生效，取决于桌面环境本身与应用程序如何读取字体设置。

### 3.2 不同发行版的行为差异  

- 桌面设置下设置的字体为什么影响不到自行编译的qt程序呢？先说探寻的结果：我没有查到一个切确的答案。但是下面这篇问答的提供了很多信息
[How do font-settings in gnome, kde and xfce work?](https://unix.stackexchange.com/questions/277649/how-do-font-settings-in-gnome-kde-and-xfce-work)

从其他文章中得知，桌面设置的字体配置会保存在这个文件中
`~/.config/xfce4/xfconf/xfce-perchannel-xml/xsettings.xml`

- 文章作者提到，对于Xubuntu，字体设置立即应用于 GTK+和 Qt 应用程序。在 Xfce 外观中指定的字体足以影响整个系统，无论使用哪种工具包。

- 对于 Debian Xfce，字体设置仅立即应用于 GTK+应用程序。必须使用 Qt 4 设置来更改 Qt 中的默认字体，从“无衬线字体（常规）”更改为“Droid Sans Mono（常规）”。我还必须在更改生效前手动从菜单栏保存。

而我使用的是 Ubuntu Xfce，看起来和第二种情况类似。


## 其他相关链接
[Solved: Font size okay and not okay](https://forum.manjaro.org/t/solved-font-size-okay-and-not-okay/125163)
[Is there a proper way to change Qt fonts in xfce?](https://forums.linuxmint.com/viewtopic.php?t=312755)
[[SOLVED] XFCE4 and font setup for Qt5 application](https://forums.gentoo.org/viewtopic-t-1031458-start-0.html)
[Where are the XFCE4 appearance/font settings stored in Xubuntu 16.04?](https://askubuntu.com/questions/860407/where-are-the-xfce4-appearance-font-settings-stored-in-xubuntu-16-04)
[Font configuration](https://wiki.archlinux.org/title/Font_configuration)
