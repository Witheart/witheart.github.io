---
title: "8GTs 及以上高速信号布线"
date: 2025-12-16
last_modified_at: 2025-12-16
categories:
  - "PCB layout"
tags:
  - "PCB layout"
permalink: /pcb-layout/8gts-及以上高速信号布线/
toc: true
---

> 本文资料来源：RK3588 Hardware Design Guide-V1.6-20250910-CN.pdf

- BGA区域，挖掉这些信号正下方的 L2 层参考层以减小焊盘电容效应。挖空尺寸 R=10mil。
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-44-27.png)

- 避免玻纤编织效应（改变走线角度 / 使用zigzag走线）

- 差分过孔
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-48-48.png)

- 耦合电容优化
根据接口选择挖空一层或者两层地平面，如果挖空电容焊盘正下方 L2 地参考层，需要隔层参考，即 L3 层要为地参考层；如果挖空 L2 和 L3 地参考层，那么 L4 层要为地参考层。挖空尺寸需根据实际叠层通过仿真确定。
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-49-35.png)
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-49-49.png)

- ESD优化
挖空 ESD 焊盘正下方 L2 和 L3 地参考层， L4 层作为隔层参考层，需要为地平面。挖空尺寸需结合 ESD 型号并根据实际叠层通过仿真确定
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-51-24.png)

- 连接器优化
根据接口选择挖空一层或者两层地平面，如果挖空连接器焊盘正下方的 L2 地参考层，需隔层参考，即 L3 层要作为地参考层；如果挖空 L2 和 L3 的地参考层，那么 L4 层需要为地平面，作为隔层参考层。挖空尺寸需结合连接器型号并根据实际叠层通过仿真确定。
建议在连接器的每个地焊盘各打 2 个地通孔，且地孔要尽可能靠近焊盘。
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-53-01.png)
![alt text](/assets/images/pcb-layout/8gts-及以上高速信号布线/PixPin_2025-12-16_18-53-12.png)
