---
title: "Csharp 十六进制字符串转整数int"
date: 2026-06-15
last_modified_at: 2026-06-15
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/csharp-十六进制字符串转整数int/
toc: true
---

```csharp
int target = Convert.ToInt32("CD", 16);

```

- **`Convert.ToInt32(string value, int fromBase)`**：这是 C# 内置的方法，用于将特定进制的字符串转换为 32 位带符号整数（`int`）。
- **`"CD"`**：要转换的字符串内容。
- **`16`**：指定前面的字符串是**十六进制 (Hexadecimal)**。
- **运行结果**：十六进制中的 `C` 代表十进制的 12，`D` 代表 13。转换计算过程为 `12 * 16 + 13 = 205`。因此，执行这行代码后，变量 `target` 的值将是 **205**。
