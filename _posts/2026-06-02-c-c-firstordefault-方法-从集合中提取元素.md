---
title: "C# FirstOrDefault 方法 —— 从集合中提取元素"
date: 2026-06-02
last_modified_at: 2026-06-02
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/c-firstordefault-方法-从集合中提取元素/
toc: true
---

在 C# 的 LINQ 中，`.FirstOrDefault()` 是用来从集合中提取元素的防守型利器。

简单来说，它的核心功能是：**获取集合中的第一个元素；如果集合是空的，它不会报错，而是返回一个安全的“默认值”。**


### 1. 拆解名字：First + OrDefault

这个方法的名字非常直白地表达了它的两步逻辑：

- **`First`（找第一）**：它会从头开始看集合。只要找到第一个元素，它就立刻停下来并把这个元素交给你。它甚至不会去管集合后面还有没有几万个元素（这在性能上非常高效，被称为“延迟执行”和“短路逻辑”）。
- **`OrDefault`（或者给默认值）**：如果它翻遍了整个集合，发现里面**空空如也**，它不会像某些语言那样抛出异常导致程序崩溃，而是给你一个该类型的默认值。

### 2. 这个“Default（默认值）”到底是什么？

默认值是什么，完全取决于集合里装的是什么**数据类型**：

- **对于引用类型（所有的 Class 类、接口）**：默认值是 `null`。
- _例如：您的 `FiveGCheckStep` 是一个类，所以找不到时返回 `null`。_

- **对于数值类型（int, double 等）**：默认值是 `0`。
- **对于布尔类型（bool）**：默认值是 `false`。

### 3. 关键对比：为什么不直接用 `.First()`？

LINQ 中确实有一个名为 `.First()` 的方法。区分它们是避免线上 Bug 的关键：

- **`.First()` 是激进的**：如果你确信集合里**至少有一个**元素，你可以用它。但如果集合为空，它会立刻抛出 `InvalidOperationException` 异常，导致程序崩溃。
- **`.FirstOrDefault()` 是安全的**：如果你**不确定**集合里有没有元素，永远优先使用它。拿到结果后，再用 `if (result != null)` 判断一下即可。

**代码对比：**

```csharp
List<string> emptyList = new List<string>(); // 这是一个空列表

// 1. 危险写法
// string item1 = emptyList.First();
// 💥 报错：Sequence contains no elements (序列不包含任何元素)

// 2. 安全写法
string item2 = emptyList.FirstOrDefault();
// ✅ 安全通过，item2 的值变成了 null

```
