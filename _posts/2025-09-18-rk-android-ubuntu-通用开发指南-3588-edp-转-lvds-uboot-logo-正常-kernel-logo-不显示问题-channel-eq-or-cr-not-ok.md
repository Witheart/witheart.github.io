---
title: "3588 eDP 转 LVDS，Uboot logo 正常，Kernel logo 不显示问题（Channel EQ or CR not ok）"
date: 2025-09-18
last_modified_at: 2025-09-18
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/3588-edp-转-lvds-uboot-logo-正常-kernel-logo-不显示问题-channel-eq-or-cr-not-ok/
toc: true
---

## 1 问题描述


| 项目         | 状态             | 备注                                                        |
| :----------- | :--------------- | :---------------------------------------------------------- |
| **接口**     | **U-Boot Logo**  | **Kernel Logo**                                             |
| eDP          | 正常显示         | 正常显示                                                    |
| LVDS         | 正常显示         | 不显示                                                      |
| **连接路径** | CPU输出eDP | CPU输出eDP(和左侧用的是同一路 eDP) → CH7511 芯片转换 → LVDS |

**问题描述**：RK3588 Linux，LVDS 接口在 Kernel 阶段无法显示 Logo，但 U-Boot 阶段正常。


## 2 解决方法

```diff
diff --git a/kernel/drivers/gpu/drm/bridge/analogix/analogix_dp_core.c b/kernel/drivers/gpu/drm/bridge/analogix/analogix_dp_core.c
index 53264c731..c43762531 100644
--- a/kernel/drivers/gpu/drm/bridge/analogix/analogix_dp_core.c
+++ b/kernel/drivers/gpu/drm/bridge/analogix/analogix_dp_core.c
@@ -2231,8 +2231,14 @@ int analogix_dp_loader_protect(struct analogix_dp_device *dp)

 	if (!drm_dp_channel_eq_ok(link_status, dp->link_train.lane_count)) {
 		dev_err(dp->dev, "Channel EQ or CR not ok\n");
-		ret = -EINVAL;
-		goto err_disable;
+		dev_err(dp->dev, "But DP link will not be shutdown to fix the eDP->LVDS (via CH7511B) no display issue caused by interlane alignment not ready.\n");
+		printk("link_status: 0x%02x 0x%02x 0x%02x 0x%02x 0x%02x 0x%02x\n",
+		       link_status[0], link_status[1],
+		       link_status[2], link_status[3],
+		       link_status[4], link_status[5]);
+		printk("lane_count: %d\n", dp->link_train.lane_count);
+		// ret = -EINVAL;
+		// goto err_disable;
 	}

 	return 0;
```

## 3 解决过程
### 3.1 交叉验证

- 使用该路 eDP 资源直接驱动 eDP 屏幕，显示功能正常；
- 使用同一路 eDP 资源，通过 CH7511B 转换为 LVDS 信号后，出现异常。

初步定位显示问题可能与 CH7511B 相关。

使用示波器对关键信号进行了测量，结果如下图所示：
![alt text](/assets/images/rk-android-ubuntu-通用开发指南/3588-edp-转-lvds-uboot-logo-正常-kernel-logo-不显示问题-channel-eq-or-cr-not-ok/PixPin_2025-09-18_13-42-44.png)

图中：
- 紫色波形为 LVDS 信号；
- 绿色波形为背光 EN 信号；
- 黄色波形为 PWM 信号。

具体过程如下：
1. 系统上电；
2. Uboot 阶段 Logo 可隐约显示（此时背光未开启）；
3. 背光 EN 信号变为高电平，背光开启，PWM 开始输出，此时可正常看到 Uboot Logo；
4. 在位置 ④ 处，PWM 信号突然停止输出，LVDS 信号也随之消失，Uboot Logo 消失，画面出现闪烁；
5. 在 ④ 至 ⑤ 阶段之间，屏幕处于黑屏状态（背光仍亮），直至位置 ⑤ 之后系统启动完成，显示恢复，LVDS 信号重新输出（波形与 ②–③ 阶段相似）。

受限于示波器带宽（测量 eDP 信号需几 GHz 级别带宽），目前无法准确捕捉 eDP 信号的时序信息。

### 3.2 日志分析

通过捕捉开机日志，发现异常出现在 **6.63s** 之前。对比正常 eDP 屏幕的日志，发现以下关键错误信息：  

```log
[    6.144418] rockchip-dp fded0000.edp: Channel EQ or CR not ok
```

该日志表明 **eDP 通道均衡（Channel Equalization, EQ）或时钟恢复（Clock Recovery, CR）失败**，导致 DP 信号被关闭，进而引发黑屏问题。  

---


在内核驱动中，该日志由以下代码触发：  
**文件路径**：`kernel/drivers/gpu/drm/bridge/analogix/analogix_dp_core.c`  

```c
if (!drm_dp_channel_eq_ok(link_status, dp->link_train.lane_count)) {
    dev_err(dp->dev, "Channel EQ or CR not ok\n");
    ret = -EINVAL;
    goto err_disable;
}

return 0;

err_disable:
    analogix_dp_disable(dp);
    return ret;
}
```

**问题分析**：  
- 当 `drm_dp_channel_eq_ok()` 返回 `false` 时，会打印错误日志并跳转至 `err_disable`，最终调用 `analogix_dp_disable()` 关闭 DP 输出。  
- 该函数的输入参数为：  
  - `link_status` = `0x77 0x00 0x00 0x01 0x00 0x00`  
  - `lane_count` = `2`  

---

**修复方案**：  
屏蔽 `goto err_disable`，使得即使 EQ 失败，DP 仍能保持输出。  
**结果**：问题解决，显示恢复正常。  

---

- drm_dp_channel_eq_ok()函数原型
`kernel/drivers/gpu/drm/drm_dp_helper.c`

```c
#define DP_LINK_STATUS_SIZE	   6
#define DP_LANE0_1_STATUS		    0x202
#define DP_LANE_ALIGN_STATUS_UPDATED	    0x204
#define DP_INTERLANE_ALIGN_DONE		    (1 << 0)

# define DP_LANE_CR_DONE		    (1 << 0)
# define DP_LANE_CHANNEL_EQ_DONE	    (1 << 1)
# define DP_LANE_SYMBOL_LOCKED		    (1 << 2)

#define DP_CHANNEL_EQ_BITS (DP_LANE_CR_DONE |		\
			    DP_LANE_CHANNEL_EQ_DONE |	\
			    DP_LANE_SYMBOL_LOCKED)

bool drm_dp_channel_eq_ok(const u8 link_status[DP_LINK_STATUS_SIZE],
			  int lane_count)
{
	u8 lane_align;
	u8 lane_status;
	int lane;

	lane_align = dp_link_status(link_status,
				    DP_LANE_ALIGN_STATUS_UPDATED);
	if ((lane_align & DP_INTERLANE_ALIGN_DONE) == 0)
		return false;
	for (lane = 0; lane < lane_count; lane++) {
		lane_status = dp_get_lane_status(link_status, lane);
		if ((lane_status & DP_CHANNEL_EQ_BITS) != DP_CHANNEL_EQ_BITS)
			return false;
	}
	return true;
}

/* Helpers for DP link training */
static u8 dp_link_status(const u8 link_status[DP_LINK_STATUS_SIZE], int r)
{
	return link_status[r - DP_LANE0_1_STATUS];
}

static u8 dp_get_lane_status(const u8 link_status[DP_LINK_STATUS_SIZE],
			     int lane)
{
	int i = DP_LANE0_1_STATUS + (lane >> 1);
	int s = (lane & 1) * 4;
	u8 l = dp_link_status(link_status, i);

	return (l >> s) & 0xf;
}
```

函数 `drm_dp_channel_eq_ok` 的执行流程如下：

- **检查 interlane alignment 是否完成**：
   - 调用 `dp_link_status(link_status, DP_LANE_ALIGN_STATUS_UPDATED)` 获取 `lane_align` 值。
   - `DP_LANE_ALIGN_STATUS_UPDATED` 的值为 `0x204`。
   - `dp_link_status` 函数定义为：`link_status[r - DP_LANE0_1_STATUS]`，其中 `DP_LANE0_1_STATUS` 的值为 `0x202`。
   - 因此，索引计算：`0x204 - 0x202 = 2`。
   - 从 `link_status` 数组获取索引 2 的值：`link_status[2] = 0x00`。
   - 所以，`lane_align = 0x00`。
   - 检查条件：`(lane_align & DP_INTERLANE_ALIGN_DONE) == 0`。
     - `DP_INTERLANE_ALIGN_DONE` 的值为 `(1 << 0)`，即 `0x01`。
     - 计算：`0x00 & 0x01 = 0x00`，条件为真（即不等于 0 失败）。
   - 由于条件为真，函数立即返回 `false`。

由于函数在第一步就返回了 `false`，后续的循环检查（针对每个通道的状态）不会执行。

- 原因分析：

    - 返回 `false` 的直接原因是 interlane alignment 未完成（`lane_align & DP_INTERLANE_ALIGN_DONE == 0`）。这表明链接训练中的通道间对齐步骤失败，因此通道均衡检查无法通过。
    - 即使 `lane_count = 2`，函数也不会进入通道状态检查，因为 interlane alignment 是前置条件。

    > ​Q: 为什么需要 Interlane Alignment？​​
    >
    > A:
    >
    > - DisplayPort 链路通过多个独立的数据通道（例如 2 或 4 个 lane）并行传输数据。
    > - 由于物理信号传输延迟可能存在微小差异（例如电缆长度、电路延迟），不同通道的数据到达接收端的时间可能不完全同步。
    > - ​​Interlane Alignment 的作用 ​​：确保所有通道的数据在接收端能够精确对齐（即同一时刻到达），避免因时序偏差导致数据错乱。

应该是 CH7511 转换芯片的兼容性问题，导致对齐失败，代码关闭了 dp 显示，导致 kernel logo 不显示。
