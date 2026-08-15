---
title: "Kotlin 快速入门"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "Kotlin"
tags:
  - "Kotlin"
permalink: /kotlin/kotlin-快速入门/
toc: true
---

### 练习环境
可在网站进行练习
[https://play.kotlinlang.org/](https://play.kotlinlang.org/)

### **1. 变量与类型推断**
**题目**：  
声明以下变量：  
• 一个不可变的字符串 `name`，初始值为 "Alice"；  
• 一个可变的整数 `age`，初始值为 25；  
• 一个可空字符串 `nickname`，初始值为 `null`；  
• 一个显式声明类型为 `Double` 的变量 `height`，值为 1.75。

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   val name = "Alice"           // 类型推断为 String，不可变（val）
   var age = 25                 // 类型推断为 Int，可变（var）
   val nickname: String? = null // 可空类型必须显式声明（String?）
   val height: Double = 1.75    // 显式声明类型
   ```
   </details>

---

### **2. 函数参数与默认值**
**题目**：  
编写一个函数 `greet`，接收一个 `String` 类型的 `name` 参数和一个可选的 `greeting` 参数（默认值为 "Hello"），返回拼接后的字符串。  
示例：  
```kotlin
println(greet("Bob"))             // 输出 "Hello, Bob!"
println(greet("Alice", "Hi"))     // 输出 "Hi, Alice!"
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun greet(name: String, greeting: String = "Hello") = "$greeting, $name!"
   ```
   </details>

---

### **3. 空安全与安全调用**
**题目**：  
编写一个函数 `safeUpperCase`，接收一个可空字符串 `s`，返回其大写形式。若 `s` 为 `null`，返回空字符串。  
示例：  
```kotlin
println(safeUpperCase("kotlin"))  // 输出 "KOTLIN"
println(safeUpperCase(null))      // 输出 ""
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun safeUpperCase(s: String?) = s?.uppercase() ?: ""
   ```
   </details>

---

### **4. 数据类与解构声明**
**题目**：  
创建一个数据类 `Point`，包含 `x` 和 `y` 两个 `Int` 类型的属性。  
编写一个函数 `swap`，接收一个 `Point` 对象，返回一个新的 `Point` 对象，交换 `x` 和 `y` 的值。  
**使用解构声明**实现 `swap` 函数。  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   data class Point(val x: Int, val y: Int)

   fun swap(p: Point): Point {
       val (x, y) = p // 解构声明
       return Point(y, x)
   }

   // 调用示例
   val p = Point(3, 5)
   println(swap(p)) // 输出 Point(x=5, y=3)
   ```
   </details>

---

### **5. 扩展函数**
**题目**：  
为 `String` 类添加一个扩展函数 `addExclamation`，返回字符串末尾添加感叹号的结果。  
示例：  
```kotlin
println("Hello".addExclamation()) // 输出 "Hello!"
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun String.addExclamation() = "$this!"
   ```
   </details>

---

### **6. 伴生对象与静态方法**
**题目**：  
创建一个类 `Logger`，使用伴生对象实现一个静态方法 `log(message: String)`，在控制台打印消息。  
示例：  
```kotlin
Logger.log("Error occurred") // 输出 "[LOG] Error occurred"
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   class Logger {
       companion object {
           fun log(message: String) {
               println("[LOG] $message")
           }
       }
   }
   ```
   </details>

---

### **7. Lambda 与高阶函数**
**题目**：  
编写一个高阶函数 `operateOnNumbers`，接收两个整数 `a` 和 `b`，以及一个函数参数 `operation`（类型为 `(Int, Int) -> Int`），返回 `operation` 的执行结果。  
用 Lambda 表达式调用此函数，分别实现加法和乘法。  
示例：  
```kotlin
println(operateOnNumbers(3, 4) { a, b -> a + b }) // 输出 7
println(operateOnNumbers(3, 4) { a, b -> a * b }) // 输出 12
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun operateOnNumbers(a: Int, b: Int, operation: (Int, Int) -> Int) = operation(a, b)
   ```
   </details>

---

### **8. 集合操作**
**题目**：  
给定一个整数列表 `list = listOf(1, 2, 3, 4, 5)`，使用集合操作完成以下任务：  
1. 过滤出偶数；  
2. 将每个元素乘以 2；  
3. 将结果转换为字符串列表（如 `["2", "4", "6", ...]`）。  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   val list = listOf(1, 2, 3, 4, 5)
   val result = list
       .filter { it % 2 == 0 }  // [2, 4]
       .map { it * 2 }          // [4, 8]
       .map { it.toString() }   // ["4", "8"]
   ```
   </details>

---

### **9. `when` 表达式**
**题目**：  
编写一个函数 `describeNumber(n: Int)`，根据数字返回描述：  
• 若为 0 → "Zero"  
• 若为 1 → "One"  
• 若为 2 → "Two"  
• 其他 → "Other"  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun describeNumber(n: Int) = when (n) {
       0 -> "Zero"
       1 -> "One"
       2 -> "Two"
       else -> "Other"
   }
   ```
   </details>

---

### **10. 主构造函数与初始化块**
**题目**：  
创建一个类 `Person`，主构造函数接收 `name`（不可变）和 `age`（可变）。  
在初始化块中检查 `age` 是否非负，若为负数则抛出异常。  
示例：  
```kotlin
val p1 = Person("Alice", 25) // 正常创建
val p2 = Person("Bob", -5)   // 抛出 IllegalArgumentException
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   class Person(val name: String, var age: Int) {
       init {
           require(age >= 0) { "Age cannot be negative" }
       }
   }
   ```
   </details>

---

### **11. 对象表达式（匿名类）**
**题目**：  
使用对象表达式创建一个简单的匿名类 `Runnable`，重写 `run()` 方法打印 "Running..."。  
调用其 `run()` 方法。

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   val runnable = object : Runnable {
       override fun run() {
           println("Running...")
       }
   }
   runnable.run()
   ```
   </details>

---

### **12. 密封类（Sealed Class）**
**题目**：  
定义一个密封类 `Result`，包含两个子类：  
• `Success(data: String)`  
• `Error(message: String)`  

编写函数 `handleResult(result: Result)`，使用 `when` 表达式处理两种结果。  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   sealed class Result
   class Success(val data: String) : Result()
   class Error(val message: String) : Result()

   fun handleResult(result: Result) {
       when (result) {
           is Success -> println("Success: ${result.data}")
           is Error -> println("Error: ${result.message}")
       }
   }

   fun main(){
    val successResult = Success("Data loaded")
    handleResult(successResult)
   }
   ```
   </details>

---

### **13. 类型检查与智能转换**
**题目**：  
编写函数 `printLength(obj: Any)`，判断 `obj` 是否为 `String` 类型，如果是则打印其长度，否则打印 "Not a string"。  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   fun printLength(obj: Any) {
       if (obj is String) {
           println("Length: ${obj.length}") // 智能转换为 String
       } else {
           println("Not a string")
       }
   }
   ```
   </details>

---

### **14. 作用域函数（`let`/`apply`/`run`）**
**题目**：  
使用作用域函数优化以下代码：  
```kotlin
val list2 = mutableListOf<String>()
list.add("Apple")
list.add("Banana")
list.add("Orange")
list.sort()
println(list2)
```

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   val list2 = mutableListOf<String>().apply {
       add("Apple")
       add("Banana")
       add("Orange")
       sort()
   }
   println(list2)
   ```
   </details>

---

### **15. 协程基础**
**题目**：  
使用协程在后台延迟 1 秒后打印 "Hello from coroutine!"。  

<details>
   <summary>点击查看解答</summary>

   ```kotlin
   import kotlinx.coroutines.*

   fun main() = runBlocking {
       launch {
           delay(1000)
           println("Hello from coroutine!")
       }
       println("Start") // 立即执行
   }
   // 输出：
   // Start
   // Hello from coroutine!（1秒后）
   ```
   </details>
