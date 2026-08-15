---
title: "3568 Android otg模式下adb热拔插不识别"
date: 2025-07-03
last_modified_at: 2025-07-03
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/3568-android-otg模式下adb热拔插不识别/
toc: true
---

## 问题背景
- AM3568客户反馈有线adb连接不稳定，开机前接入USB后，可识别到adb，但在开机后热拔插，则识别不到

## 问题原因
- otg模式下，otg的USB接口不能带电，必须由主机供电，才能进行热拔插的检测。

- 硬件原理图上可以发现，该otg口的VCC是由gs7615这个电子开关控制的
![alt text](/assets/images/android-开发指南/3568-android-otg模式下adb热拔插不识别/PixPin_2025-07-03_11-16-01.png)

- 查看代码可以发现，设备树中首先定义了控制电子开关的引脚，然后在设备树解析时将这个引脚默认拉高，导致引脚在开机后就一直为高电平，无法进行热拔插检测
`kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi`
```dtsi
	nk_io_init {
		compatible = "nk_io_control";
		
		//hw-hub c3568a
		V_USBHOST_EN1 = <&gpio3 RK_PA2 GPIO_ACTIVE_HIGH>;

		pinctrl-0 = <&nk_io_gpio>;				
	};
```

`kernel/drivers/gpio/nk_io_core.c`
```c
static int nk_io_control_probe(struct platform_device *pdev)
{
    ...
    unsigned int USBHUB_RST_1;
    //hub
    ret = of_get_named_gpio_flags(node, "V_USBHOST_EN1", 0, &flags);
    if (ret < 0) {
            printk("%s() Can not read property V_USBHOST_EN1\n", __FUNCTION__);
            goto err;
    } else {
            pdata->V_USBHOST_EN1 = ret;
            ret = devm_gpio_request(&pdev->dev, pdata->V_USBHOST_EN1, "V_USBHOST_EN1");
            if(ret < 0){
                    printk("%s() devm_gpio_request V_USBHOST_EN1 request ERROR\n", __FUNCTION__);
                    goto err;
            }

            ret = gpio_direction_output(pdata->V_USBHOST_EN1,1); 
            if(ret < 0){
                    printk("%s() gpio_direction_input V_USBHOST_EN1 set ERROR\n", __FUNCTION__);
                    goto err;
            }
    }
    ...
}
```

## 解决方式
### 原有代码
- 系统下，原来就有一个otg模式的开关，只需要在开启otg模式时，控制V_USBHOST_EN1断开USB口的供电，在关闭otg模式时恢复供电即可。这样在otg模式开启时，usb口由主机供电，便可以热拔插检测adb。
原有代码：
`system/core/ril/main.c`
```diff
diff --git a/system/core/ril/main.c b/system/core/ril/main.c
index 3a40c9d614..f85847fbc8 100755
--- a/system/core/ril/main.c
+++ b/system/core/ril/main.c
@@ -520,6 +520,46 @@ exit:
 }
 #endif
 
+//add other 
+static void* pthread_func1 (void* data){
+	char fileBuf[100];
+	int size;
+	char buf[512]="\0";
+	
+	while (1)
+	{
+		sleep(60);
+		
+		size = readfile("/sys/devices/platform/ff770000.syscon/ff770000.syscon:usb2-phy@e450/otg_mode", (unsigned char*)fileBuf, sizeof(fileBuf));
+		ALOGI("persist.usb3.otg.mode  init=%d \n", size);
+		
+		if(property_get("persist.usb3.otg.mode",buf, NULL) > 0)
+		{
+			//host
+			if(strncmp(buf, "0", strlen("0")) == 0)
+			{
+				if(strncmp(fileBuf, "host", strlen("host")) != 0)
+				{
+					ALOGI("persist.usb3.otg.mode  0=host \n");
+					system("echo host > /sys/devices/platform/ff770000.syscon/ff770000.syscon:usb2-phy@e450/otg_mode");
+				}		
+			}
+
+			//otg
+			if(strncmp(buf, "1", strlen("1")) == 0)
+			{
+				if(strncmp(fileBuf, "otg", strlen("otg")) != 0)
+				{
+					ALOGI("persist.usb3.otg.mode  1=otg \n");
+					system("echo otg > /sys/devices/platform/ff770000.syscon/ff770000.syscon:usb2-phy@e450/otg_mode");
+				}		
+			}		
+		}	
+	}
+	
+	return NULL;
+}
+	
 static void* pthread_func (void* data){
 	int ret = 0;
 	int stateSim = 0;
@@ -642,9 +682,10 @@ int main(int argc, char** argv){
 	int ret = 0, ret2 = 0;
 	
 	ret = pthread_create(&pt_thread, NULL, pthread_func, NULL);
+	ret2 = pthread_create(&pt_thread2, NULL, pthread_func1, NULL);
 	
 	pthread_join (pt_thread, NULL);
-	
+	pthread_join (pt_thread2, NULL);
 	return 0;
 	
 	#if 0

```

### 新增代码
- 加入修改7eaedb38970cdd7b8e517d9aef22895105637c55(fix(otg): 开机后adb无法热拔插识别问题)
- 注意，原来的io初始化逻辑是在`kernel/drivers/gpio/nk_io_core.c`中做的（内核空间），而新增的控制逻辑是在`system/core/ril/main.c`中做的（用户空间）。
- 需要取消在内核空间的初始化，才能在用户空间导出该gpio，否则操作无法成功
- 具体修改如下：
```diff
➜  rk3568_rk_android11.0_sdk git:(AM-3568-S-L19201080_H-01) ✗ git --no-pager diff be1e387e07e7df54a7c060d3e07142c8a2a76f0f 7eaedb38970cdd7b8e517d9aef22895105637c55
diff --git a/kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi b/kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi
index cc615d9cc6..f36000ccde 100644
--- a/kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi
+++ b/kernel/arch/arm64/boot/dts/rockchip/NK_RK3568.dtsi
@@ -123,7 +123,7 @@
                //USB_EN_OC_GPIO0_A5 = <&gpio0 RK_PA5 GPIO_ACTIVE_HIGH>;
 
                //hw-hub c3568a
-               V_USBHOST_EN1 = <&gpio3 RK_PA2 GPIO_ACTIVE_HIGH>;
+               // V_USBHOST_EN1 = <&gpio3 RK_PA2 GPIO_ACTIVE_HIGH>;
                //V_USBHOST_EN2 = <&gpio3 RK_PA3 GPIO_ACTIVE_HIGH>;
 
                USBHUB_RST_1 = <&gpio3 RK_PA4 GPIO_ACTIVE_HIGH>;
diff --git a/kernel/drivers/gpio/nk_io_core.c b/kernel/drivers/gpio/nk_io_core.c
index 5b05fb8c3a..83da3c60c5 100755
--- a/kernel/drivers/gpio/nk_io_core.c
+++ b/kernel/drivers/gpio/nk_io_core.c
@@ -233,7 +233,7 @@ static int nk_io_control_probe(struct platform_device *pdev)
    unsigned int USBHUB_RST_2;
    unsigned int USBHUB_RST_3;
 
-
+#if 0 //改为用户空间控制system/core/ril/main.c
    //hub
         ret = of_get_named_gpio_flags(node, "V_USBHOST_EN1", 0, &flags);
         if (ret < 0) {
@@ -253,7 +253,8 @@ static int nk_io_control_probe(struct platform_device *pdev)
                         goto err;
                 }
         }
-  
+#endif
+        
 #if 0
         ret = of_get_named_gpio_flags(node, "V_USBHOST_EN2", 0, &flags);
         if (ret < 0) {
diff --git a/system/core/ril/main.c b/system/core/ril/main.c
index 7a30c7e87e..7dd4cdd7cf 100755
--- a/system/core/ril/main.c
+++ b/system/core/ril/main.c
@@ -541,6 +541,34 @@ static void* pthread_func1 (void* data){
        char fileBuf[100];
        int size;
        char buf[512]="\0";
+
+       // 初始化日志标签
+    const char* TAG = "USB_OTG";
+    static bool gpio_initialized = false;
+    
+    // ===== GPIO 初始化 =====
+    if (!gpio_initialized) {
+        // 导出 GPIO
+        if (system("echo 98 > /sys/class/gpio/export") == 0) {
+            ALOGI("[%s] GPIO98 exported successfully", TAG);
+        } else {
+            ALOGW("[%s] GPIO98 may already be exported (ignorable)", TAG);
+        }
+        
+        // 设置方向
+        if (system("echo out > /sys/class/gpio/gpio98/direction") == 0) {
+            ALOGI("[%s] GPIO direction set to output", TAG);
+        } else {
+            ALOGE("[%s] Failed to set GPIO direction! Error: %d", TAG, errno);
+        }
+        
+        // 设置初始值（默认关闭OTG）
+        system("echo 1 > /sys/class/gpio/gpio98/value");
+        ALOGI("[%s] GPIO98 initialized to HIGH (OTG disabled by default)", TAG);
+        
+        gpio_initialized = true;
+    }
+    
 
        while (1)
        {
@@ -552,6 +580,16 @@ static void* pthread_func1 (void* data){
 
                if(property_get("persist.usb3.otg.mode",buf, NULL) > 0)
                {
+                       // ===== 新增的GPIO控制逻辑 =====
+            if(strncmp(buf, "0", 1) == 0) {  // Host模式
+                ALOGI("[%s] OTG disabled (Host mode)", TAG);
+                system("echo 1 > /sys/class/gpio/gpio98/value");
+                
+            } else if(strncmp(buf, "1", 1) == 0) {  // OTG模式
+                ALOGI("[%s] OTG enabled (OTG mode)", TAG);
+                system("echo 0 > /sys/class/gpio/gpio98/value");
+            }
+
                        //host
                        if(strncmp(buf, "0", strlen("0")) == 0)
                        {
```
