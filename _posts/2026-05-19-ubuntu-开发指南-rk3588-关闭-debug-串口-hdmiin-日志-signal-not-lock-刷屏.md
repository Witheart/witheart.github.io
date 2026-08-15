---
title: "rk3588 关闭 debug 串口 hdmiin 日志 signal not lock 刷屏"
date: 2026-05-19
last_modified_at: 2026-05-19
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-关闭-debug-串口-hdmiin-日志-signal-not-lock-刷屏/
toc: true
---

## 问题描述
rk3588，debug 串口每5s就会输出 hdmiin 日志，导致调试时刷屏：
```bash
[ 1759.517202] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing signal not lock, tmds_clk_ratio:0
[ 1759.517212] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing mu_st:0x0, scdc_st:0x0, dma_st10:0x10
[ 1765.235610] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing signal not lock, tmds_clk_ratio:0
[ 1765.235621] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing mu_st:0x0, scdc_st:0x0, dma_st10:0x10
[ 1770.759133] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing signal not lock, tmds_clk_ratio:0
[ 1770.759143] fdee0000.hdmirx-controller: hdmirx_wait_lock_and_get_timing mu_st:0x0, scdc_st:0x0, dma_st10:0x10

```

## 解决方式
```diff
diff --git a/kernel/drivers/media/platform/rockchip/hdmirx/rk_hdmirx.c b/kernel/drivers/media/platform/rockchip/hdmirx/rk_hdmirx.c
index 880752592..0e904ebe5 100644
--- a/kernel/drivers/media/platform/rockchip/hdmirx/rk_hdmirx.c
+++ b/kernel/drivers/media/platform/rockchip/hdmirx/rk_hdmirx.c
@@ -1534,10 +1534,10 @@ static int hdmirx_wait_lock_and_get_timing(struct rk_hdmirx_dev *hdmirx_dev)
 	}
 
 	if (i == WAIT_SIGNAL_LOCK_TIME) {
-		v4l2_err(v4l2_dev, "%s signal not lock, tmds_clk_ratio:%d\n",
-				__func__, hdmirx_dev->tmds_clk_ratio);
-		v4l2_err(v4l2_dev, "%s mu_st:%#x, scdc_st:%#x, dma_st10:%#x\n",
-				__func__, mu_status, scdc_status, dma_st10);
+		// v4l2_err(v4l2_dev, "%s signal not lock, tmds_clk_ratio:%d\n",
+		// 		__func__, hdmirx_dev->tmds_clk_ratio);
+		// v4l2_err(v4l2_dev, "%s mu_st:%#x, scdc_st:%#x, dma_st10:%#x\n",
+		// 		__func__, mu_status, scdc_status, dma_st10);
 
 		return -1;
 	}

```
