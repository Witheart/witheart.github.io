---
title: "设备树查看"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/设备树查看/
toc: true
---

原设备树文件
rockchip_suspend: rockchip-suspend {
    compatible = "rockchip,pm-rk3568";
    status = "disabled";
    rockchip,sleep-debug-en = <1>;
    rockchip,sleep-mode-config = <
        (0
        // | RKPM_SLP_ARMOFF_LOGOFF
        | RKPM_SLP_CENTER_OFF
        | RKPM_SLP_HW_PLLS_OFF
        // | RKPM_SLP_PMUALIVE_32K
        // | RKPM_SLP_OSC_DIS
        // | RKPM_SLP_PMIC_LP
        // | RKPM_SLP_32K_PVTM
        )
    >;
    rockchip,wakeup-config = <
        (0
        | RKPM_GPIO_WKUP_EN
        )
    >;
};

设备树配置比较混乱，可以反编译最终得到的设备树文件
dtc -I dtb -O dts -o output.dts input.dtb

比如在其中寻找rockchip_suspend这个节点，会发现其指向了rockchip-suspend
rockchip_suspend = "/rockchip-suspend";

然后寻找rockchip-suspend这个节点
rockchip-suspend {
    compatible = "rockchip,pm-rk3568";
    status = "okay";
    rockchip,sleep-debug-en = <0x1>;
    rockchip,sleep-mode-config = <0x44>;
    rockchip,wakeup-config = <0x10>;
    phandle = <0x158>;
};

就可以看到这个节点实际上是被启用的 status = "okay";

比如rockchip,sleep-mode-config = <0x44>;
0x44 实际上是0b 0100 0100
对应了
rockchip,sleep-mode-config = <
    (0
    // | RKPM_SLP_ARMOFF_LOGOFF
    | RKPM_SLP_CENTER_OFF
    | RKPM_SLP_HW_PLLS_OFF
    // | RKPM_SLP_PMUALIVE_32K
    // | RKPM_SLP_OSC_DIS
    // | RKPM_SLP_PMIC_LP
    // | RKPM_SLP_32K_PVTM
    )
>;
从 kernel/include/dt-bindings/suspend/rockchip-rk3568.h 可以看到
#define BIT(nr)				(1 << (nr))
#define RKPM_SLP_CENTER_OFF		BIT(2)
#define RKPM_SLP_HW_PLLS_OFF	BIT(6)
是对应的
