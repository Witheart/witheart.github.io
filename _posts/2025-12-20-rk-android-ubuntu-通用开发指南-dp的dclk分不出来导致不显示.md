---
title: "DP的DCLK分不出来导致不显示"
date: 2025-12-20
last_modified_at: 2025-12-20
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/dp的dclk分不出来导致不显示/
toc: true
---

概要：本文记录了在使用 Rockchip VOP2 输出到 DP 接口时，发现 DCLK 无法正确配置导致显示异常的问题排查过程，并给出了通过补丁和手动配置 PLL 参数解决的办法。


## 1. 问题描述  

```  
rockchip-vop2 fdd90000.vop: [drm:vop2_crtc_atomic_enable] set dclk_vop2 to 149600000, get 74800003  
```

可以看到，目标时钟频率是 149600000，实际只分出来了 74800003。

拓扑结构为：

- VOP2 → DP1 → DP转接板 → eDP

---

## 2. 解决方式  

### 2.1 检查时钟驱动配置  

首先确认 kernel/drivers/clk/rockchip/clk-rk3588.c 中内容是否如下图所示：

![alt text](/assets/images/rk-android-ubuntu-通用开发指南/dp的dclk分不出来导致不显示/image.png)

---

### 2.2 尝试合入补丁  

尝试合入以下补丁，测试是否正常：

- `0001-drm-rockchip-vop2-add-rockchip_drm_dclk_set_rate-for.patch`

---

### 2.3 添加 PLL 配置项  

合入补丁后仍不正常，改为手动添加 PLL 配置：

在 static struct rockchip_pll_rate_table rk3588_pll_rates[] 中加入如下项：

```c
RK3588_PLL_RATE(149600000, 3, 299, 4, 13107),
```

#### 参数说明：

```c
#define RK3588_PLL_RATE(_rate, _p, _m, _s, _k) \
{                                              \
    .rate = _rate##U,                          \
    .p    = _p,                                \
    .m    = _m,                                \
    .s    = _s,                                \
    .k    = _k,                                \
}
```

- 输出频率 rate = 149600000 Hz  
- p = 3  
- m = 299  
- s = 4  
- k = 13107  

---

### 2.4 频率计算公式  

虽然未找到官方文档中的计算公式，但 AI 提供了如下推导公式：

```text
rate = (parent_rate * (m + k / 65536)) / (p * (1 << s))
```

- 其中：
输入频率：通常为 24 MHz 的外部晶振。
m：整数倍频系数（16‑511 或类似范围）。
k：小数倍频系数（0‑65535），提供精细的频率调节，65536 对应 2¹⁶ 的分辨率。
p：前置分频系数（1‑63 或类似）。
s：后置分频系数（0‑6），通过 2^s 进行二分频，扩大输出频率范围。

---

### 2.5 结果验证  

替换后测试，系统可以正常显示，问题解决。
