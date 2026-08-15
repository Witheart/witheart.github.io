---
title: "C# checkbox UI 复选框的状态和布尔变量“双向同步”"
date: 2026-05-09
last_modified_at: 2026-05-09
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/c-checkbox-ui-复选框的状态和布尔变量-双向同步/
toc: true
---

```csharp
chkCpu.Checked = EnableCpuTest; chkCpu.CheckedChanged += (s, e) => EnableCpuTest = chkCpu.Checked;
```

## 一、代码逐行说明

```csharp
chkCpu.Checked = EnableCpuTest;
```

- `chkCpu`：一个 `CheckBox` 控件
- `EnableCpuTest`：一个 `bool` 类型的变量（通常是字段或属性）
- **作用**：  
  👉 把变量的值同步到界面  
  如果 `EnableCpuTest == true`，复选框就被勾选；否则不勾选

---

```csharp
chkCpu.CheckedChanged += (s, e) =>
{
    EnableCpuTest = chkCpu.Checked;
};
```

- `CheckedChanged`：当复选框的勾选状态发生变化时触发的事件
- `+=`：订阅事件
- `(s, e) => { ... }`：一个 **lambda 表达式**（匿名事件处理方法）

**作用**：  
👉 当用户点击复选框时，把 UI 状态同步回变量

- 勾选 → `EnableCpuTest = true`
- 取消勾选 → `EnableCpuTest = false`

---

## 二、最终效果

✅ **UI ↔ 变量 自动同步**

| 操作                 | 结果                     |
| -------------------- | ------------------------ |
| 修改 `EnableCpuTest` | UI 自动变化              |
| 用户点击 CheckBox    | `EnableCpuTest` 自动更新 |

这相当于一个**简易的双向绑定**。
