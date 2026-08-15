---
title: "4 Secure Munchester United - 类型判断"
date: 2025-10-16
last_modified_at: 2025-10-16
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/4-secure-munchester-united-类型判断/
toc: true
---

## 基础概念

- 强制类型转换

```csharp
long l = 1000L;
int i = (int)l;

object o = new Random();
Random r = (Random)o;
```

- 类型判断

```csharp
object o = new List<int>();

o is ICollection<int> // true
o.GetType() == typeof(ICollection<int>) // false
o is List<int> // true
o.GetType() == typeof(List<int>) // true
```

is 将对类以及直接或间接派生的任何类和接口返回 true。在这种情况下， typeof 和 Object.GetType() 是解决方案。

## 代码示例

```csharp
public class SecurityPassMaker
{
    public string GetDisplayName(TeamSupport support)
    {
        var res = support.Title;
        if(support is Staff){
            if(support.GetType()==typeof(Security)) res+=" Priority Personnel";
            return res;
        }
        else return "Too Important for a Security Pass";
    }
}

/**** Please do not alter the code below ****/

public interface TeamSupport { string Title { get; } }

public abstract class Staff : TeamSupport { public abstract string Title { get; } }

public class Manager : TeamSupport { public string Title { get; } = "The Manager"; }

public class Chairman : TeamSupport { public string Title { get; } = "The Chairman"; }

public class Physio : Staff { public override string Title { get; } = "The Physio"; }

public class OffensiveCoach : Staff { public override string Title { get; } = "Offensive Coach"; }

public class GoalKeepingCoach : Staff { public override string Title { get; } = "Goal Keeping Coach"; }

public class Security : Staff { public override string Title { get; } = "Security Team Member"; }

public class SecurityJunior : Security { public override string Title { get; } = "Security Junior"; }

public class SecurityIntern : Security { public override string Title { get; } = "Security Intern"; }

public class PoliceLiaison : Security { public override string Title { get; } = "Police Liaison Officer"; }
```
