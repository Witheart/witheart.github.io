---
title: "正则去除有关HDMIIN相关刷屏日志"
date: 2026-06-01
last_modified_at: 2026-06-01
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/正则去除有关hdmiin相关刷屏日志/
toc: true
---

如果你想删除所有包含 `hdmirx_wait_lock_and_get_timing` 这个报错/状态信息的行，请在“查找”框中输入：

```regex
^.*fdee0000\.hdmirx-controller: hdmirx_wait_lock_and_get_timing.*\r?\n?

```

- 要删除can相关日志可以用这个
```regex
^.*rockchip_canfd_get_berr_counter.*\r?\n?
```

**替换为：**
_(留空，什么都不填)_

---

### VS Code 操作步骤

1. 按 `Ctrl + H` (Windows/Linux) 或 `Cmd + Option + F` (Mac) 打开替换面板。
2. 点击查找框右侧的 **`.*`** 图标，或按 `Alt + R` 启用**正则表达式 (Use Regular Expression)** 模式。
3. 在“查找(Find)”框中粘贴上面的正则表达式。
4. 在“替换(Replace)”框中**保持完全为空**。
5. 点击“全部替换 (Replace All)”按钮（或按 `Ctrl + Alt + Enter`）。

---

### 参数说明

- **`^`**：匹配行的开头。
- **`.*`**：匹配任意字符（除了换行符）0 次或多次，这会吃掉前面的时间戳和用户名 `Jun 01 10:24:40 user kernel: `。
- **`fdee0000\.hdmirx-controller`**：精准匹配核心关键字，注意 `.` 前面加了 `\` 进行转义，因为 `.` 在正则中是特殊字符。
- **`.*`**：再次匹配后面的所有具体报错信息。
- **`\r?\n?`**：匹配可能存在的 Windows 回车符 (`\r`) 和换行符 (`\n`)。这一步非常关键，它**连同这一行的换行符一起选中**，这样替换为空时才不会留下一堆空白行。
