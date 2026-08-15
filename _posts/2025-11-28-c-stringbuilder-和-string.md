---
title: "StringBuilder 和 string"
date: 2025-11-28
last_modified_at: 2025-11-28
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/stringbuilder-和-string/
toc: true
---

```csharp
using System.Text;
public static class Identifier
{
    public static string Clean(string identifier)
    {
        var sb = new StringBuilder(identifier);
        sb.Replace(' ', '_');
        return sb.ToString();
    }
}
```

Q：string 传参进来，为什么要构造成StringBuilder进行处理，再转回string进行return？

A：`StringBuilder` 和 `string` 有本质的区别，这正体现了 C# 中字符串处理的重要概念。

## 主要区别

| 特性 | string | StringBuilder |
|------|--------|--------------|
| **可变性** | 不可变（immutable） | 可变（mutable） |
| **内存分配** | 每次修改都创建新对象 | 在原有缓冲区上修改 |
| **性能** | 大量修改时性能差 | 大量修改时性能好 |
| **转换** | 直接使用 | 需要 `.ToString()` 转换 |

## 详细解释

### string 的不可变性
```csharp
string str = "hello";
str = str + " world"; // 实际上创建了一个新的字符串对象
```

### StringBuilder 的可变性
```csharp
var sb = new StringBuilder("hello");
sb.Append(" world"); // 在原有对象上修改，不创建新对象
```

## 为什么需要 .ToString()

`StringBuilder` 是一个**字符串构建器**，不是字符串本身。它内部维护一个字符缓冲区来进行高效修改，但最终我们需要得到一个真正的字符串：
