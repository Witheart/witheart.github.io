---
title: "3 Lucian's Luscious Lasagna - 类和方法"
date: 2025-10-16
last_modified_at: 2025-10-16
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/3-lucian-s-luscious-lasagna-类和方法/
toc: true
---

https://exercism.org/tracks/csharp/exercises/lucians-luscious-lasagna

## 基础概念
- 变量定义
```csharp
int explicitVar = 10; // Explicitly typed 显式指定其类型
var implicitVar = 10; // Implicitly typed 根据赋值推断其类型
```

- 类
C# 是一种面向对象的语言 ，要求所有函数都必须定义在类中。
class class 用于定义类。对象（或实例 ）是使用 new 关键字创建的。
```csharp
class Calculator
{
    // ...
}

var calculator = new Calculator();
```

- 方法
为了允许其他文件中的代码调用方法，必须添加 public 访问修饰符。

## 代码示例
```csharp
class Lasagna
{
    // TODO: define the 'ExpectedMinutesInOven()' method
    public int ExpectedMinutesInOven() => 40;

    // TODO: define the 'RemainingMinutesInOven()' method
    public int RemainingMinutesInOven(int i) => 40 - i;

    // TODO: define the 'PreparationTimeInMinutes()' method
    public int PreparationTimeInMinutes(int i) => 2*i;

    // TODO: define the 'ElapsedTimeInMinutes()' method
    public int ElapsedTimeInMinutes(int i, int j) => 2*i+j;
}

```
