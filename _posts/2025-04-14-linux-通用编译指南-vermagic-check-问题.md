---
title: "vermagic check 问题"
date: 2025-04-14
last_modified_at: 2025-04-14
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/vermagic-check-问题/
toc: true
---

## 问题现象
在尝试加载内核模块 `dhd-cyw43430.ko` 时，系统提示错误：  
```bash
insmod: ERROR: could not insert module /lib/modules/dhd-cyw43430.ko: Invalid module format
```

## 初步排查步骤
1. **确认当前内核版本**  
   运行 `uname -r` 查看当前运行的内核版本：
   ```bash
   $ uname -r
   5.4.0-g123-dirty  # 示例输出
   ```

2. **检查模块的 Vermagic 信息**  
   通过 `modinfo` 查看模块的元数据：
   ```bash
   $ modinfo /lib/modules/dhd-cyw43430.ko
   vermagic:       5.4.0-g120-dirty SMP mod_unload modversions 
   sig_key:        ...
   ```
   关键字段 `vermagic` 显示该模块编译时针对的内核版本为 `5.4.0-g120-dirty`，而当前系统内核版本为 `5.4.0-g123-dirty`，两者不匹配导致加载失败。

---

## 根本原因分析
**Vermagic 不匹配**  
Linux 内核模块包含一个称为 **vermagic** 的签名字符串，用于确保模块与当前运行的内核版本、配置（如 `SMP`、`PREEMPT` 等）完全兼容。若编译模块时的内核环境（版本、编译选项）与当前系统不一致，会导致此错误。
---

## 解决方案

### 方法 1: 重新编译模块
确保模块和内核是同个版本编译出来的，这样就不会提示`Invalid module format`。

### 方法 2：去除内核哈希版本号
可以看到模块匹配时版本的检查主要通过哈希版本号，例如`5.4.0-g120-dirty`，主要是中间的`g120`不匹配，那么在编译的时候直接去除这部分。
- 5.4.0：内核版本号
- g120：仓库commit哈希
- dirty：仓库有未提交的更改

参考《关于 uname 查看的内核版本号的后缀》进行去除。

### 方法 3：加载时使用-f选项
