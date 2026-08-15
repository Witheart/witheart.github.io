---
title: "CSDN 自动上传 markdown 文章中的本地图片 —— 解决转存失败问题"
date: 2026-05-31
last_modified_at: 2026-05-31
categories:
  - "blog"
tags:
  - "blog"
permalink: /blog/csdn-自动上传-markdown-文章中的本地图片-解决转存失败问题/
toc: true
---

## 项目地址
https://github.com/Witheart/CSDN_auto_upload

## 0 前言：被“图片转存失败”折磨的日常

对于习惯使用 本地 Markdown 工具进行写作的开发者来说，把写好的文章发布到 CSDN 一直是个痛点。如果不配置图床，使用本地图片路径、由于浏览器安全沙箱的限制，CSDN 的网页编辑器无法直接读取本地路径（如 `![img](./images/1.png)`）的图片。

每次直接使用CSDN的md文章上传功能，都会无情地换来满屏的“图片转存失败”。为了解决这个问题，我曾尝试过手动一张张替换，效率极低。难道就没有一种方式可以一键自动化解决这个问题吗？

---

## 1 为什么不建议死磕 API 抓包？

一开始，我的思路很传统：抓包拿到 CSDN 的图片上传接口，写个 Python `requests` 脚本批量把本地图片 POST 上去，拿到 URL 后替换 Markdown 里的本地路径。

但在实际操作中，我一头撞上了企业级网关防爬的“叹息之墙”：

1. **动态加密签名**：请求头中包含大量类似 `x-ca-signature` 的动态加密参数，前端混淆极深，逆向成本极高。
2. **云存储直传架构**：CSDN 目前采用了华为云 OBS 对象存储直传，接口不仅返回临时凭证，还要二次握手，逻辑极其复杂。

**破局点：既然底层接口难以攻破，为何不利用浏览器最基础的 UI 事件进行“降维打击”？**
CSDN 网页端是支持直接 `Ctrl+V` 粘贴图片并自动上传的。只要我们能用代码控制浏览器，模拟出一个“粘贴”动作，CSDN 的前端代码自然会帮我们计算好所有复杂的加密签名并完成上传！

于是，我引入了强大的现代自动化工具：**Playwright**。

---

## 2 核心原理解析：如何用代码在浏览器中“粘贴”图片？

利用 Playwright，我们可以绕过寻找隐藏的 `<input type="file">` 元素，直接向浏览器的 DOM 环境中注入一段 JavaScript 代码，凭空捏造一个底层的 `ClipboardEvent`（剪贴板事件）。

### 2.1 图片无损上传原理（Base64 转 Blob）

**核心代码段：**

```python
# Python 端：读取本地图片，编码为 Base64 纯文本传入浏览器
with open(abs_img_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

# Playwright 执行前端 JS 注入
page.evaluate("""
    ([b64Data, mimeType, fileName]) => {
        // 1. 将 Base64 文本还原为二进制字节数组
        const byteCharacters = atob(b64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // 2. 组装成浏览器原生的 File 对象
        const blob = new Blob([byteArray], {type: mimeType});
        const file = new File([blob], fileName, {type: mimeType});
        
        // 3. 构造虚拟剪贴板
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // 4. 触发标准的 paste 粘贴事件
        const event = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });
        document.activeElement.dispatchEvent(event);
    }
""", [encoded_string, mime_type, file_name])

```

**原理解释：**
Python 运行在系统层面，无法直接把本地二进制图片塞给网页。因此，我们先在 Python 中把图片**无损编码**为 Base64 字符串，将其传递给页面的 JS 环境。
在 JS 中，我们使用 `atob` 将文本逆向解码为字节数组，并组装成标准的 `File` 对象。最后，创建一个 `DataTransfer`（虚拟剪贴板），将其挂载到一个伪造的 `paste` 事件上，对着网页光标处“狠狠砸下”。CSDN 的代码根本分不清这是人敲键盘还是脚本注入，只会乖乖执行上传逻辑。

### 2.2 解决长文排版换行丢失（纯文本粘贴）

在自动填入文章正文时，如果使用 Playwright 自带的 `keyboard.insert_text()`，CSDN 复杂的富文本编辑器（如 CodeMirror）往往无法正确解析 `\n`，导致整篇文章变成没有换行的一整段。

同样，我们继续使用“粘贴大法”完美保留排版。

**核心代码段：**

```python
# 注入纯文本粘贴事件，完美保留所有换行符
page.evaluate("""
    ([text]) => {
        const dataTransfer = new DataTransfer();
        // 设置剪贴板数据类型为纯文本
        dataTransfer.setData('text/plain', text);
        const event = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });
        document.activeElement.dispatchEvent(event);
    }
""", [content])

```

**原理解释：**
我们将完整的 Markdown 原文传递给 JS，将 `DataTransfer` 的类型严格指定为 `'text/plain'`。当触发粘贴时，编辑器的底层格式化组件会完美拦截这个事件，并原封不动地渲染所有的段落、空行和代码块，再也不会出现排版错乱。
