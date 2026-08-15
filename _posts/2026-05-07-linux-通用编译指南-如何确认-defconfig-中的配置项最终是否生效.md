---
title: "如何确认 defconfig 中的配置项最终是否生效"
date: 2026-05-07
last_modified_at: 2026-05-07
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/如何确认-defconfig-中的配置项最终是否生效/
toc: true
---

## 方法
查看内核根目录下的.config即可，.config是最终生效的方案。

defconfig 更像是一份“愿望清单”，而编译生成的 .config 则是最终的“执行方案”。并不是你写在 defconfig 里的每一行都能如愿进入 .config。
