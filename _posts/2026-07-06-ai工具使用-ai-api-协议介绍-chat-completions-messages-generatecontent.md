---
title: "AI API 协议介绍：Chat Completions、Messages、generateContent"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "AI工具使用"
tags:
  - "AI工具使用"
permalink: /ai工具使用/ai-api-协议介绍-chat-completions-messages-generatecontent/
toc: true
---

AI API 的"协议碎片化"确实是最让开发者头疼的事儿之一。本质原因是 OpenAI 的 Chat Completions 虽已成为**事实标准**，但 Anthropic 和 Google 两家坚持了自己的一套原生协议，再加上 OpenAI 自己又在 2026 年推了新一代的 Responses API，所以现在市场上至少并存着 **4 种原生风格**。


## 一、先看三家原生协议的核心差异

OpenAI（Chat Completions）/ Anthropic（Messages）/ Google（generateContent）三者虽然都是 HTTP + JSON + SSE 流式，但细节上都有不同。

| 维度              | OpenAI Chat                           | Anthropic Messages                  | Google Gemini                            |
| ----------------- | ------------------------------------- | ----------------------------------- | ---------------------------------------- |
| 端点              | `/v1/chat/completions`                | `/v1/messages`                      | `/v1beta/models/{model}:generateContent` |
| 认证              | `Authorization: Bearer sk-`           | `x-api-key` + `anthropic-version`   | `x-goog-api-key` 或 Bearer               |
| 消息字段          | `messages`                            | `messages`                          | `contents`                               |
| **System Prompt** | 塞进 `messages[{role:"system"}]`      | **顶层 `system` 字段独立**          | `systemInstruction` 字段                 |
| content 格式      | 字符串或数组都行                      | **必须是数组**（每个有 `type`）     | `parts[]` 数组                           |
| 助手角色名        | `assistant`                           | `assistant`                         | `model`                                  |
| `max_tokens`      | 可选                                  | **必填**，不传报错                  | `generationConfig.maxOutputTokens`       |
| 流式 SSE          | `data: {choices[0].delta}` → `[DONE]` | `event: content_block_delta` 带类型 | `data: {candidates[0].content.parts}`    |
| 结束原因          | `finish_reason: "stop"`               | `stop_reason: "end_turn"`           | `finishReason: "STOP"`                   |

---

## 二、OpenAI 自己还分了两条线：Chat Completions vs Responses API

这个很多人混淆。**Chat Completions 没死，但 OpenAI 官方推荐新项目用 Responses API** 。

**Chat Completions（老，无状态）**

- 核心是 `messages[]` 数组，每次你把完整历史传上去
- 纯"消息交换"模型，工具调用要自己编排循环
- 生态最广，几乎所有第三方（包括国产模型）都兼容它

**Responses API（新，2026 推的，偏 Agent）**

- 核心是 `input`（可以是字符串或结构化），返回 `response` 对象含 `output[]`
- **服务端有状态**：`previous_response_id` 可以续上下文，不用自己拼历史
- **内置工具**：web_search / file_search / code_interpreter / computer_use，甚至 remote MCP
- 对推理模型（o 系列）支持 `reasoning.effort`，Chat Completions 没有
- 缓存利用率比 Chat Completions 高 40-80%（官方数据）

---

## 三、"兼容 OpenAI 格式"已经成为行业默契

这是关键的**趋势信号**：Anthropic 和 Google 坚持原生协议，但**几乎所有其他玩家都选了 OpenAI Chat Completions 兼容路线**——

- 国产：通义千问、豆包、DeepSeek、GLM、MiniMax，全都暴露 `/v1/chat/completions` 兼容端点
- 开源推理层：vLLM、SGLang、Ollama、LM Studio
- 云厂商兼容层：Azure OpenAI（完全兼容）、阿里百炼、腾讯云 MAAS
- 聚合层：OpenRouter（290+ 模型，统一 OpenAI 格式）、Together、Fireworks、Groq
