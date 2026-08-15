---
title: "Csharp char类型常用的处理函数"
date: 2025-11-28
last_modified_at: 2025-11-28
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/csharp-char类型常用的处理函数/
toc: true
---

## 1. char.IsControl(c) - 控制字符检测

### 功能
判断字符是否为控制字符（Control Character）

### 控制字符示例
```csharp
Console.WriteLine(char.IsControl('\0'));    // True - 空字符
Console.WriteLine(char.IsControl('\t'));    // True - 制表符
Console.WriteLine(char.IsControl('\n'));    // True - 换行符
Console.WriteLine(char.IsControl('\r'));    // True - 回车符
Console.WriteLine(char.IsControl('\u0007')); // True - 响铃符
Console.WriteLine(char.IsControl('A'));     // False - 普通字母
Console.WriteLine(char.IsControl(' '));     // False - 空格
```

### ASCII 控制字符范围
- `\u0000` - `\u001F` (0-31)
- `\u007F` (127) - 删除字符

## 2. char.IsLetter(c) - 字母检测

### 功能
判断字符是否为字母字符

### 支持的字母类型
```csharp
// 拉丁字母
Console.WriteLine(char.IsLetter('A'));      // True
Console.WriteLine(char.IsLetter('z'));      // True

// Unicode 字母
Console.WriteLine(char.IsLetter('à'));      // True - 带重音字母
Console.WriteLine(char.IsLetter('ḃ'));      // True - 扩展拉丁字母
Console.WriteLine(char.IsLetter('α'));      // True - 希腊字母
Console.WriteLine(char.IsLetter('你'));      // True - 中文字符

// 非字母
Console.WriteLine(char.IsLetter('1'));      // False - 数字
Console.WriteLine(char.IsLetter('!'));      // False - 标点
Console.WriteLine(char.IsLetter(' '));      // False - 空格
```

### 相关方法
```csharp
char.IsLetterOrDigit('A');  // 字母或数字
char.IsLower('a');          // 小写字母
char.IsUpper('A');          // 大写字母
```

## 3. char.ToUpper(c) - 字符大写转换

### 功能
将字符转换为大写形式

### 使用示例
```csharp
// 基本转换
Console.WriteLine(char.ToUpper('a'));       // 'A'
Console.WriteLine(char.ToUpper('z'));       // 'Z'

// Unicode 支持
Console.WriteLine(char.ToUpper('à'));       // 'À' - 带重音字母
Console.WriteLine(char.ToUpper('ḃ'));       // 'Ḃ' - 扩展拉丁字母
Console.WriteLine(char.ToUpper('α'));       // 'Α' - 希腊字母

// 已经是大写的不变
Console.WriteLine(char.ToUpper('A'));       // 'A'
Console.WriteLine(char.ToUpper('1'));       // '1' - 数字不变
Console.WriteLine(char.ToUpper('!'));       // '!' - 符号不变
```

### 相关方法
```csharp
char.ToLower('A');          // 转换为小写 'a'
char.ToUpperInvariant('a'); // 使用不变区域设置转换
```

## 4. 其他常用字符方法

### 字符分类方法
```csharp
char.IsDigit('5');          // True - 数字
char.IsWhiteSpace(' ');     // True - 空白字符
char.IsPunctuation('!'));   // True - 标点符号
char.IsSymbol('+'));        // True - 符号
```

### 字符转换方法
```csharp
char.GetNumericValue('5');  // 5.0 - 获取数字值
char.GetUnicodeCategory('A'); // 获取 Unicode 分类
```

## 5. 综合使用示例

```csharp
public static void AnalyzeString(string input)
{
    foreach (char c in input)
    {
        Console.Write($"字符 '{c}' (U+{(int)c:X4}): ");
        
        if (char.IsControl(c))
            Console.Write("控制字符");
        else if (char.IsLetter(c))
            Console.Write($"字母 -> 大写: '{char.ToUpper(c)}'");
        else if (char.IsDigit(c))
            Console.Write($"数字 -> 数值: {char.GetNumericValue(c)}");
        else if (char.IsWhiteSpace(c))
            Console.Write("空白字符");
        else
            Console.Write("其他字符");
        
        Console.WriteLine();
    }
}

// 测试
AnalyzeString("Hello 123!\t世界");
```
