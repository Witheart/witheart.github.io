---
title: "CSDN 上传markdown md 格式文档，图片转存失败问题"
date: 2026-04-14
last_modified_at: 2026-04-14
categories:
  - "其他工具使用技巧"
tags:
  - "其他工具使用技巧"
permalink: /其他工具使用技巧/csdn-上传markdown-md-格式文档-图片转存失败问题/
toc: true
---

## 问题原因

md有两种方式存图片，一种是本地路径，另外一种是用图床链接。导入CSDN时，CSDN会去读取对应位置的图片，然后上传到CSDN自己的图床上。但是由于各大图床有防盗链的机制，CSDN会转存失败，而前者由于CSDN本身没有做从对应的本地路径去寻找图片的机制，也会失败。

## 尝试解决1：抓包模拟上传

通过浏览器 F12 抓包分析，发现 CSDN 采用了 **“客户端直传对象存储（OBS）”** 的方案，流程如下：

1.  **鉴权申请 (POST /signature)**：
    - **接口**：`bizapi.csdn.net/resource-api/v1/image/direct/upload/signature`
    - **关键参数**：`filename`, `source: "pc_mdeditor"`
    - **身份校验**：除了基本的 `Cookie` 外，该域名启用了阿里云 API 网关校验，必须携带 `X-Ca-Key` 和 `X-Ca-Signature`（前端 JS 动态生成）。
2.  **文件交卷 (POST 到 OBS)**：
    - **接口**：华为云 OBS 地址（`myhuaweicloud.com`）。
    - **内容**：携带第一步拿到的 `policy`、`signature` 等 Token，以及真正的图片二进制流。
3.  **结果回调**：
    - OBS 成功后触发 CSDN 回调，最终返回 `i-blog.csdnimg.cn` 域名的图片 URL。

### 方案 A：模拟全流程签名（Signature 握手）

- **尝试内容**：尝试模拟请求 1 获取签名，再执行请求 2。
- **瓶颈**：遭遇 `401 Unauthorized`，报错 `X-Ca-Key is not exist`。
- **结论**：报错信息 X-Ca-Key is not exist 说明 CSDN 的这个接口启用了 阿里云 API 网关的签名校验。在这种机制下，仅有 Cookie 是不够的，请求头里必须带上特定的 X-Ca-Key 和 X-Ca-Signature 等字段。由于这些签名通常是前端 JS 动态生成的（包含时间戳和随机数），直接通过脚本模拟会非常麻烦。

### 方案 B：绕过网关走老旧/内部接口

- **尝试内容**：尝试访问 `blog-console-api.csdn.net` 等非网关域名。
- **瓶颈**：接口返回 `404` 或 `403`。
- 
- **结论**：CSDN 已经收紧了 API 路由，旧的“一步到位”上传接口可能已下线或更改了访问规则。

## 尝试解决2：使用base64内嵌图片
文章体积过大，无法正常复制，一篇文章可以达到240W字。

## 折中解决3：使用语雀图床
- 语雀可以上传md zip包，包含图片
- 然后使用语雀的导出功能，此时图片链接都会变成语雀自己的图床
- 这个图床链接，CSDN是可以正常转存的
