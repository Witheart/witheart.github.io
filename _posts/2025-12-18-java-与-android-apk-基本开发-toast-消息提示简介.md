---
title: "Toast 消息提示简介"
date: 2025-12-18
last_modified_at: 2025-12-18
categories:
  - "JAVA 与 Android apk 基本开发"
tags:
  - "JAVA 与 Android apk 基本开发"
permalink: /java-与-android-apk-基本开发/toast-消息提示简介/
toc: true
---

**Toast 是 Android 系统中的一个轻量级消息提示组件**，用于在屏幕底部（默认位置）显示一个短暂的非模态弹窗，向用户提供操作反馈或简短信息，**不会打断用户当前操作**，几秒后会自动消失。


## 主要特点：

- **非阻塞式**：不会获取焦点，用户可继续操作
- **自动消失**：显示 2-3.5 秒后自动隐藏
- **轻量级**：占用资源少
- **位置可调**：默认底部，可调整位置

## 示例代码解析：

```java
private void showMessage(String sMsg) {
    Toast.makeText(this, sMsg, Toast.LENGTH_SHORT).show();
}
```

### 参数说明：

1. **`this`** - Context（上下文）

   - 通常是 Activity
   - 在 Fragment 中需要用 `getContext()` 或 `requireContext()`

2. **`sMsg`** - 要显示的文本内容

3. **`Toast.LENGTH_SHORT`** - 显示时长常量

   - `Toast.LENGTH_SHORT`：约 2 秒
   - `Toast.LENGTH_LONG`：约 3.5 秒

4. **`.show()`** - 最终调用此方法显示 Toast
