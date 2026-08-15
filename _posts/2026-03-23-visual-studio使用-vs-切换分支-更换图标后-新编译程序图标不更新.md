---
title: "VS 切换分支、更换图标后，新编译程序图标不更新"
date: 2026-03-23
last_modified_at: 2026-03-23
categories:
  - "visual studio使用"
tags:
  - "visual studio使用"
permalink: /visual-studio使用/vs-切换分支-更换图标后-新编译程序图标不更新/
toc: true
---

## 参考链接
- [Icon for EXE file got cached in Explorer and doesn't update after a rebuild](https://stackoverflow.com/questions/40885378/icon-for-exe-file-got-cached-in-explorer-and-doesnt-update-after-a-rebuild)
- [Reset the icon cache in older versions of Windows](https://en.movilforum.com/How-to-reset-the-icon-cache-in-Windows-step-by-step/)

## 1 问题描述
在Visual Studio 2022中使用C#项目。我在主分支的基础上创建了一个新分支，替换了应用程序的图标文件。现在，当我切换回主分支并重新编译时，生成的可执行文件的图标却显示为新分支的图标。然而，通过git检查确认，主分支的代码库中并未引入新分支的图标文件。
```
branch A: old.ico
branch B: new.ico

切换到 B → 编译 → Windows 缓存 new.ico
切回 A → 编译 → exe 正常变回 old.ico
但 Explorer 仍显示 new.ico
```

## 2 问题原因
Explorer 缓存命中，Windows 会把 exe 图标缓存到本地数据库里，而不是每次都从 exe 读取。

### 2.1 验证方式
右键 exe → 属性 → 更改图标

如果这里显示的是旧图标：
✔ 编译正常
❌ 只是 Explorer 显示错了

## 3 解决方法
### 3.1 方式一
打开任务管理器，重新启动 Explorer。

### 3.2 方式二
命令行运行
ie4uinit.exe -show

（此方式未验证过）
