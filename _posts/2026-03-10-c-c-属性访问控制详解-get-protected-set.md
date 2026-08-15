---
title: "C#属性访问控制详解：{ get; protected set; }"
date: 2026-03-10
last_modified_at: 2026-03-10
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/c-属性访问控制详解-get-protected-set/
toc: true
---

在C#面向对象编程中，属性的访问控制是封装思想的核心体现。其中 `{ get; protected set; }` 这种语法虽然简洁，却蕴含了精妙的设计哲学。它既不是完全公开的`{ get; set; }`，也不是完全私有的字段，而是在可访问性与安全性之间找到了绝佳的平衡点。


## 1 语法解析：三层访问控制

### 1.1 基本语法结构
```csharp
public bool PropertyName { get; protected set; }
```
- **读取权限**：`public get` - 对所有代码开放
- **写入权限**：`protected set` - 仅限当前类和派生类
- **类型**：可以是任意类型，不只是`bool`

### 1.2 访问级别对比表

| 语法形式 | 读取权限 | 写入权限 | 典型场景 |
|---------|---------|---------|---------|
| `{ get; set; }` | 公开 | 公开 | 普通数据载体 |
| `{ get; private set; }` | 公开 | 仅当前类 | 内部状态，外部只读 |
| `{ get; protected set; }` | 公开 | 当前类+派生类 | 继承体系中的共享状态 |
| `{ get; internal set; }` | 公开 | 同一程序集 | 模块内部协作 |
| `{ get; }` | 公开 | 仅初始化时 | 不可变属性 |

## 2 设计意图：为什么需要这样的设计？

### 2.1 继承体系的状态共享
在模板方法模式或基类定义通用算法时，基类需要为派生类提供可修改的"钩子"：

```csharp
public abstract class DataProcessor
{
    // 派生类可以控制处理进度
    public bool IsProcessing { get; protected set; }
    
    public void Process()
    {
        IsProcessing = true;  // 基类可设置
        OnProcess();          // 调用抽象方法
        IsProcessing = false; // 基类可设置
    }
    
    protected abstract void OnProcess();
}

public class CsvProcessor : DataProcessor
{
    protected override void OnProcess()
    {
        // 处理过程中可能需要调整状态
        if (someCondition)
            IsProcessing = false;  // 派生类可设置 ✅
    }
}
```

### 2.2 状态机的受控变更
在状态模式中，状态转换应该受到严格控制：

```csharp
public abstract class ConnectionState
{
    // 外部只能查询状态，只有状态类能修改
    public bool IsConnected { get; protected set; }
    
    public abstract void Handle(Connection context);
}

public class ConnectedState : ConnectionState
{
    public override void Handle(Connection context)
    {
        // 只有状态对象自己知道何时断开
        if (networkError)
            IsConnected = false;  // 状态类内部可修改
    }
}
```
