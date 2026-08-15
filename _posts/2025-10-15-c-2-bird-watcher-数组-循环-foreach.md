---
title: "2 Bird Watcher - 数组、循环、foreach"
date: 2025-10-15
last_modified_at: 2025-10-15
categories:
  - "C#"
tags:
  - "C#"
permalink: /c/2-bird-watcher-数组-循环-foreach/
toc: true
---

## 数组定义方式

### 1. 基本数组定义
```csharp
// 定义长度为2的整型数组
int[] twoInts = new int[2];

// 三种初始化数组的方式
int[] threeIntsV1 = new int[] { 4, 9, 7 };
int[] threeIntsV2 = new[] { 4, 9, 7 };  // 简化写法
int[] threeIntsV3 = { 4, 9, 7 };        // 最简写法
```

## 循环语句

### 1. for循环（与C语言语法一致）
```csharp
for (int i = 0; i < 5; i++)
{
    // 循环体
}
```

### 2. foreach循环
```csharp
char[] vowels = new[] { 'a', 'e', 'i', 'o', 'u' };

foreach (char vowel in vowels)
{
    // 输出元音字母
    System.Console.Write(vowel);
}
```

## 数组相关操作

### 1. 数组作为返回值
```csharp
public static int[] LastWeek() => new[] {0, 2, 5, 3, 7, 8, 4};
```

### 2. 获取数组长度
```csharp
// 使用 .Length 属性获取数组总长度
int length = array.Length;
```

## 注意事项

- **逻辑非操作符 `!`**：只能作用于布尔变量，不能作用于整型变量

## 解决示例
```csharp
class BirdCount
{
    private int[] birdsPerDay;

    public BirdCount(int[] birdsPerDay)
    {
        this.birdsPerDay = birdsPerDay;
    }

    public static int[] LastWeek() => new [] {0, 2, 5, 3, 7, 8, 4};

    public int Today() => birdsPerDay[birdsPerDay.Length-1];

    public void IncrementTodaysCount()
    {
        birdsPerDay[birdsPerDay.Length-1]++;
    }

    public bool HasDayWithoutBirds()
    {
        foreach(int count in birdsPerDay){
            if(count==0) return true;
        }
        return false;
    }

    public int CountForFirstDays(int numberOfDays)
    {
        int sum = 0;
        for(int i=0; i<numberOfDays; ++i){
            sum += birdsPerDay[i];
        }
        return sum;
    }

    public int BusyDays()
    {
        int sum = 0;
        for(int i=0; i<birdsPerDay.Length; ++i){
           if(birdsPerDay[i] >= 5){
               sum++;
           }
        }
        return sum;
    }
}
```
