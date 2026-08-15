---
title: "开发记录"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/开发记录/
toc: true
---

kernel/include/dt-bindings/suspend/rockchip-rk3568.h
记录了设备树中支持的各种模式

	rockchip_suspend: rockchip-suspend {
		compatible = "rockchip,pm-rk3568";
		status = "disabled";
		rockchip,sleep-debug-en = <1>;
		rockchip,sleep-mode-config = <
			(0
			| RKPM_SLP_ARMOFF_LOGOFF
			| RKPM_SLP_CENTER_OFF
			| RKPM_SLP_HW_PLLS_OFF
			| RKPM_SLP_PMUALIVE_32K
			| RKPM_SLP_OSC_DIS
			| RKPM_SLP_PMIC_LP
			| RKPM_SLP_32K_PVTM
			)
		>;
		rockchip,wakeup-config = <
			(0
			| RKPM_GPIO_WKUP_EN
			)
		>;
	};



设备树中wifi模组相关节点
kernel/arch/arm64/boot/dts/rockchip/rk3568-evb.dtsi

sdio_pwrseq: sdio-pwrseq {
		compatible = "mmc-pwrseq-simple";
		clocks = <&rk809 1>;
		clock-names = "ext_clock";
		pinctrl-names = "default";
		pinctrl-0 = <&wifi_enable_h>;

		/*
		 * On the module itself this is one of these (depending
		 * on the actual card populated):
		 * - SDIO_RESET_L_WL_REG_ON
		 * - PDN (power down when low)
		 */
		post-power-on-delay-ms = <200>;
		reset-gpios = <&gpio3 RK_PD4 GPIO_ACTIVE_LOW>;
	};

	wireless_wlan: wireless-wlan {
		compatible = "wlan-platdata";
		rockchip,grf = <&grf>;
		wifi_chip_type = "AIC8800";
		status = "okay";
	};


wireless_bluetooth: wireless-bluetooth {
		compatible = "bluetooth-platdata";
		clocks = <&rk809 1>;
		clock-names = "ext_clock";
		//wifi-bt-power-toggle;
		uart_rts_gpios = <&gpio2 RK_PB5 GPIO_ACTIVE_LOW>;
		//BT,power_gpio = <&gpio2 RK_PB7 GPIO_ACTIVE_HIGH>;
		pinctrl-names = "default", "rts_gpio";
		pinctrl-0 = <&uart1m0_rtsn>;
		pinctrl-1 = <&uart1_gpios>;
		BT,reset_gpio    = <&gpio2 RK_PB7 GPIO_ACTIVE_HIGH>;
		BT,wake_gpio     = <&gpio2 RK_PC0 GPIO_ACTIVE_HIGH>;
		BT,wake_host_irq = <&gpio2 RK_PC1 GPIO_ACTIVE_HIGH>;
		status = "okay";
	};


    sdio-pwrseq {
		wifi_enable_h: wifi-enable-h {
			rockchip,pins = <3 RK_PD4 RK_FUNC_GPIO &pcfg_pull_none>;
			//WIFI_REG_ON_H_GPIO2_B1
		};
	};

    wireless-bluetooth {
		uart8_gpios: uart8-gpios {
			rockchip,pins = <2 RK_PB1 RK_FUNC_GPIO &pcfg_pull_none>;
		};
	};



查看驱动的相关函数，只有btlpm相关内容中解析了设备树中的内容？？
if (!of_property_read_bool(np, "wakeup-source")) 

if (!of_property_read_u32(np, "uart_index", &val))

bsi->host_wake = of_get_named_gpio_flags(np, "bt_hostwake", 0, &config);
