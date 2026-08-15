---
title: "Codex CLI 支持的 API 协议"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "AI工具使用"
tags:
  - "AI工具使用"
permalink: /ai工具使用/codex-cli-支持的-api-协议/
toc: true
---

## 一、Codex CLI：主力走 Responses API，Chat Completions 已被砍

这是大多数人接触 Codex 的入口，协议上有个**版本分水岭**必须先知道 ：

| Codex CLI 版本 | `wire_api` 选项 | 后端端点 |
|---|---|---|
| **0.81.0+（当前）** | 仅 `"responses"` | `POST /v1/responses` |
| 0.80.0 及更早 | `"chat"` 或 `"responses"` | `/v1/chat/completions` 或 `/v1/responses` |

> ⚠️ 2026 年初起，0.81+ **彻底移除了 `wire_api = "chat"`**，配置里写 `"chat"` 直接报 `Error: wire_api = "chat" is no longer supported` 。所以新版 CLI 只认 Responses API。

CLI 的 Responses 端点**可配置**，不锁 OpenAI 官方 ：
- 走 API Key 鉴权 → `https://api.openai.com/v1/responses`
- 走 ChatGPT 登录（Plus 用户免额度扣费）→ `https://chatgpt.com/backend-api/codex/responses`
- `--oss` 模式接 gpt-oss + 本地 ollama/LM Studio → `http://localhost:11434/v1/responses`
- Azure 等云厂商的 Responses 实现也能接

### 接国产模型的坑（必看）

国内厂商——DeepSeek、Kimi、MiniMax、SiliconFlow 等——**默认只出 Chat Completions**（`/v1/chat/completions`），字段结构、SSE 事件名、响应体（`choices[0].message` vs `output[]`）跟 Responses 完全两码事 。

把 DeepSeek 的 base_url 直接填进新版 Codex CLI，症状是 400/404 或流解析失败。**三条路**：

1. **降级 CLI 到 0.80.0**，`wire_api = "chat"`，配 Chat Completions 端点 → 最省事
2. **找原生支持 Responses 的厂商**：阿里百炼、火山方舟、MiniMax 部分型号已原生，直接 `wire_api = "responses"` 填进去就行 
3. **加转译层**：CC Switch / CCX / moon-bridge 这类，Codex 发 Responses → 本地路由改写得 Chat → 上游 → 回译成 Responses 给 CLI 
