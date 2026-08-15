---
title: "printk Linux 内核日志调试级别"
date: 2025-12-24
last_modified_at: 2025-12-24
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/printk-linux-内核日志调试级别/
toc: true
---

概要：本文介绍了 Linux 内核中 printk 函数的使用方式及其日志调试级别的含义，包括内核日志缓冲区的工作机制、日志级别的分类、以及如何通过 /proc/sys/kernel/printk 参数控制日志输出行为。


## 参考
https://docs.kernel.org/core-api/printk-basics.html

## 1. printk() 简介  

printk() 是 Linux 内核中最广为人知的函数之一。它是用于打印消息的标准工具，所有 printk() 消息都会打印到内核日志缓冲区，这是一个通过 `/dev/kmsg` 导出到用户空间的环形缓冲区。通常使用 `dmesg` 命令来读取它。

printk() 的基本使用方式如下：

```c
printk(KERN_INFO "Message: %s\n", arg);
```

其中 `KERN_INFO` 为日志级别（请注意，它必须与格式字符串相连，日志级别不是单独的参数）。

---

## 2. 日志级别  

可用的日志级别如下表所示：

| Name         | String | Alias function                                    |
|--------------|--------|---------------------------------------------------|
| KERN_EMERG   | “0”    | pr_emerg()                                        |
| KERN_ALERT   | “1”    | pr_alert()                                        |
| KERN_CRIT    | “2”    | pr_crit()                                         |
| KERN_ERR     | “3”    | pr_err()                                          |
| KERN_WARNING | “4”    | pr_warn()                                         |
| KERN_NOTICE  | “5”    | pr_notice()                                       |
| KERN_INFO    | “6”    | pr_info()                                         |
| KERN_DEBUG   | “7”    | pr_debug() 和 pr_devel()（若定义了 DEBUG）        |
| KERN_DEFAULT | “”     | 无别名函数                                        |
| KERN_CONT    | “c”    | pr_cont()                                         |

内核根据消息的日志级别和当前的 console_loglevel（一个内核变量）来决定是否立即显示该消息（即是否打印到当前控制台）。  

- 如果消息优先级高于 console_loglevel（即日志级别的数值小于等于 console_loglevel），则内核会立即将消息打印到控制台。

---

## 3. /proc/sys/kernel/printk 参数说明  

通过查看以下命令可以获取当前内核日志级别设置：

```bash
cat /proc/sys/kernel/printk
```

输出示例：

```
4 4 1 7
```

这四个数字的含义如下：

| 参数                           | 含义说明                                                                 |
|--------------------------------|--------------------------------------------------------------------------|
| <console_loglevel>             | 当前控制台显示等级，仅日志级别 ≤ 此值的消息会被打印到控制台             |
| <default_message_loglevel>     | 未指定日志级别时使用的默认等级，例如：`printk("hello\n");` 等价于 `printk(KERN_WARNING "hello\n");` |
| <minimum_console_loglevel>     | console_loglevel 的最小下限，即使手动设置，console_loglevel 也不会小于该值 |
| <default_console_loglevel>     | 系统初始化或重置时的默认 console_loglevel 值                             |

### 3.1 日志级别解释  

- **console_loglevel**：当前控制台显示等级  
  - 仅当日志级别 ≤ console_loglevel 的 printk 消息才会直接打印到控制台（例如串口或实时 dmesg 输出）

- **default_message_loglevel**：默认日志等级  
  - 当 printk 没有显式指定日志级别时，使用该默认等级  
  - 例如：`printk("hello\n");` 等价于 `printk(KERN_WARNING "hello\n");`

- **minimum_console_loglevel**：最小控制台日志等级下限  
  - 即使执行如下命令：  
    ```bash
    echo 0 > /proc/sys/kernel/printk
    ```  
    console_loglevel 也不会小于 1

（通过/proc/sys/kernel/printk接口可能不进行参数验证，而通过）
https://stackoverflow.com/questions/31310629/why-the-printk-console-loglevel-can-be-lower-than-minimum-console-loglevel

- **default_console_loglevel**：系统初始化或某些情况下重置 console_loglevel 的默认值  
  - 当内核启动、执行 `sysctl -p` 或发生某些重置行为时，console_loglevel 会恢复为该值（例如 7）

---

## 4. 修改日志显示级别  

要显示所有日志信息，可以手动提高 console_loglevel，例如：

```bash
echo 8 > /proc/sys/kernel/printk
```

查看修改结果：

```bash
cat /proc/sys/kernel/printk
```

输出：

```
8 4 1 7
```

此时，所有日志级别的 printk 消息都会被显示在控制台。
