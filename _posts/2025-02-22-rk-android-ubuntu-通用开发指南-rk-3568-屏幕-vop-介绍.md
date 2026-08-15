---
title: "RK 3568 屏幕 VOP 介绍"
date: 2025-02-22
last_modified_at: 2025-02-22
categories:
  - "RK (Android&Ubuntu) 通用开发指南"
tags:
  - "RK (Android&Ubuntu) 通用开发指南"
permalink: /rk-android-ubuntu-通用开发指南/rk-3568-屏幕-vop-介绍/
toc: true
---

概要：本文介绍了 RK3568 的 VOP2.0 显示框架，包括其工作原理、VP 输出接口以及屏幕设备树的配置方法，重点讲解了 eDP 和 HDMI 双显的设备树配置。  


## 1. RK3568 VOP2.0 介绍  

RK3568 采用 VOP2.0 版本，其硬件框架如下所示：  

RK 官方文档路径：`RK官方文档\01、Linux\Common\DISPLAY\Rockchip_Developer_Guide_DRM_Display_Driver_CN.pdf`  

![VOP 硬件框架](/assets/images/rk-android-ubuntu-通用开发指南/rk-3568-屏幕-vop-介绍/image.png)  

VOP 主要用于读取存储在 DDR 中的数据，并进行必要的处理后，通过对应的显示接口模块（HDMI、DP、DSI、RGB、LVDS）发送到显示设备。各接口模块会将接收到的数据转换成符合各自协议的数据流，最终呈现到用户屏幕上。  

VOP2.0 版本中包含多个 Video Port（简称 VP）输出接口，这些 VP 可以同时独立工作，并输出各自独立的显示时序。  

---

## 2. RK3568 VP 与显示接口的连接关系  

RK3568 的 VP 与各显示接口的连接关系如下所示：  

![VP 连接示意图](/assets/images/rk-android-ubuntu-通用开发指南/rk-3568-屏幕-vop-介绍/image-1.png)  

因此，在进行屏幕设备树配置时，需要将屏幕通路配对，即确保从 DDR 到屏幕的路径正确配置。例如，在 eDP 和 HDMI 双显的场景下，可以让 VP0 连接到 HDMI，VP1 连接到 eDP，并断开 VP 的其他通路。  

---

## 3. 设备树（DTS）配置示例  

### 3.1 eDP 配置  

以下 DTS 配置用于启用 eDP 并将 VP1 连接到 eDP：  

```dts
#if 1
// eDP 配置，开启 eDP 时将宏定义改为 1
&edp {
	force-hpd;
	status = "okay";
	// status = "disabled";
	
	// hpd-gpios = <&gpio4 RK_PC4 GPIO_ACTIVE_HIGH>;
	
	ports {
		port@1 {
			reg = <1>;

			edp_out_panel: endpoint {
				remote-endpoint = <&panel_in_edp>;
			};
		};
	};
};

&edp_phy {
	status = "okay";
};

&edp_in_vp0 {
	status = "disabled";
};

&edp_in_vp1 {
	status = "okay";
};

&route_edp {
	status = "okay";
	connect = <&vp1_out_edp>;
};
#endif
```

### 3.2 HDMI 配置  

以下 DTS 配置用于启用 HDMI 并将 VP0 连接到 HDMI：  

```dts
&hdmi {	
	status = "okay";	
	rockchip,phy-table =	
		<92812500  0x8009 0x0000 0x0270>,	
		<165000000 0x800b 0x0000 0x026d>,	
		<185625000 0x800b 0x0000 0x01ed>,	
		<297000000 0x800b 0x0000 0x01ad>,	
		<594000000 0x8029 0x0000 0x0088>,	
		<000000000 0x0000 0x0000 0x0000>;	
};	

&route_hdmi {	
	status = "okay";	
	connect = <&vp0_out_hdmi>;	
};
	
&hdmi_in_vp1 {	
	status = "disabled";	
};
	
&hdmi_in_vp0 {
	status = "okay";
};

&hdmi_sound {
	status = "okay";
};
```

---

## 4. 关键配置解析  

配置 eDP 和 HDMI 双显的关键在于 VP 与显示接口的映射关系，如下：  

### 4.1 eDP 相关配置  

```dts
&edp_in_vp0 {
	status = "disabled";
};

&edp_in_vp1 {
	status = "okay";
};

&route_edp {
	status = "okay";
	connect = <&vp1_out_edp>;
};
```

### 4.2 HDMI 相关配置  

```dts
&route_hdmi {	
	status = "okay";	
	connect = <&vp0_out_hdmi>;	
};
	
&hdmi_in_vp1 {	
	status = "disabled";	
};
	
&hdmi_in_vp0 {
	status = "okay";
};
```

上述配置确保 VP0 连接 HDMI，VP1 连接 eDP，实现 eDP 和 HDMI 双显功能。  

---
