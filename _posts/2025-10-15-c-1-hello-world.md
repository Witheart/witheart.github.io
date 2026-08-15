---
title: "1 Hello World"
date: 2025-10-15
last_modified_at: 2025-10-15
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/1-hello-world/
toc: true
---

```csharp
public static class HelloWorld
{
    public static string Hello() => "Hello, World!";
}
```

这段 C#代码定义了一个简单的静态类，其中包含一个返回"Hello, World!"字符串的静态方法。

1.  **`public static class HelloWorld`**

    - `public`: 访问修饰符。表示这个类可以从任何其他代码访问。
    - `static`: 关键字。表示这是一个**静态类**。
      - 静态类**不能被实例化**（你不能用 `new HelloWorld()` 创建它的对象）。
      - 它只能包含**静态成员**（静态方法、静态属性、静态字段、静态事件）。
      - 它通常用作工具类或组织一组相关的静态功能。
    - `class`: 关键字。表示这是一个类定义。
    - `HelloWorld`: 类的名称。

2.  **`public static string Hello()`**

    - `public`: 访问修饰符。表示这个方法可以从任何其他代码访问。
    - `static`: 关键字。表示这是一个**静态方法**。
      - 静态方法属于**类本身**，而不是类的某个实例。
      - 调用静态方法时，直接使用类名：`HelloWorld.Hello()`，不需要创建类的对象。
    - `string`: 方法的**返回类型**。表示这个方法执行后会返回一个字符串 (`string`) 类型的值。
    - `Hello()`: 方法的名称。这是一个无参数的方法（括号 `()` 内为空）。

3.  **`=> "Hello, World!";`**
    - `=>`: 这是 C# 6.0 引入的**表达式主体成员 (Expression-bodied member)** 语法。
    - `"Hello, World!"`: 这是一个字符串字面量。
    - 这整行的含义是：方法 `Hello` 的**主体**是一个表达式，该表达式直接计算并返回字符串 `"Hello, World!"`。
    - 这是对传统方法体写法的一种简洁替代。传统写法等价于：
      ```csharp
      public static string Hello()
      {
          return "Hello, World!";
      }
      ```

**总结代码的功能：**

1.  定义了一个名为 `HelloWorld` 的**公共静态类**。
2.  在这个类中，定义了一个名为 `Hello` 的**公共静态方法**。
3.  这个方法**没有参数**。
4.  这个方法**返回一个字符串**。
5.  当调用 `HelloWorld.Hello()` 时，它**直接返回字符串 `"Hello, World!"`**。

**如何使用：**

可以在代码的其他地方像这样调用这个方法：

```csharp
string greeting = HelloWorld.Hello(); // greeting 的值将是 "Hello, World!"
Console.WriteLine(HelloWorld.Hello()); // 直接在控制台输出 "Hello, World!"
```

**关键点：**

- **静态类 (`static class`)**: 用于组织不需要实例化的工具方法或常量。
- **静态方法 (`static method`)**: 通过类名直接调用。
- **表达式主体方法 (`=>`)**: 提供了一种简洁的方式来编写只包含一个返回表达式的方法（或属性）。
