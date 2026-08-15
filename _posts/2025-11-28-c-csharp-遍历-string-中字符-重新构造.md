---
title: "Csharp 遍历 string 中字符 重新构造"
date: 2025-11-28
last_modified_at: 2025-11-28
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/csharp-遍历-string-中字符-重新构造/
toc: true
---

概要：本文介绍了如何在 C# 中遍历字符串中的每个字符，并通过 StringBuilder 对其进行重构。示例代码展示了根据字符类型（控制字符或空格）进行替换的方式，实现了对字符串的清洗功能。  


## 1. 遍历字符串中的字符  

在 C# 中，可以使用 `foreach` 循环遍历字符串中的每一个字符：

```csharp
foreach (char c in identifier)
```

---

## 2. 使用 StringBuilder 构造新字符串  

使用 `StringBuilder` 可以更高效地构建新的字符串：

```csharp
var sb = new StringBuilder();
sb.Append(c);
```

---

## 3. 示例：清洗字符串  

下面的代码示例展示了如何将原始字符串中的控制字符替换为 "CTRL"，将空格替换为下划线 `_`，其余字符保持不变。  

具体思想是：  
- 遍历原始字符串  
- 判断字符类型  
- 根据规则构造新的字符串  

```csharp
using System.Text;

public static class Identifier
{
    public static string Clean(string identifier)
    {
        var sb = new StringBuilder();
        
        foreach (char c in identifier)
        {
            if (char.IsControl(c))
            {
                // 替换控制字符为 "CTRL"
                sb.Append("CTRL");
            }
            else if (c == ' ')
            {
                // 替换空格为下划线
                sb.Append('_');
            }
            else
            {
                // 保持其他字符不变
                sb.Append(c);
            }
        }
        
        return sb.ToString();
    }
}
```
