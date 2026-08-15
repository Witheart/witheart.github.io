---
title: "RK mali 内核DDK驱动和用户态驱动版本的对应"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk-mali-内核ddk驱动和用户态驱动版本的对应/
toc: true
---

```text
Q: RK3568 mali内核态驱动版本为g18，用户态驱动只能找到g2/g13/g24的驱动，没有完全对应g18的，请问这块建议用哪个？贵司能否提供对应g18的驱动？

另外，xserver、rga等库版本与libmali版本有对应关系吗？

感谢解答
```

```text
(FAE)A: SDK升级是一种方式，没有完全对应匹配的版本，一般内核DDK驱动不能低于用户态的版本就行。

比如内核态驱动版本为g18， 那么用户态驱动只能用g13或g2版本,需要用用户态g24版本，内核态驱动版本需升级不小于g24版本
```
