---
title: "QY-3588 Ubuntu GPIO测试"
date: 2025-06-07
last_modified_at: 2025-06-07
categories:
  - "测试SOP"
tags:
  - "测试SOP"
permalink: /测试sop/qy-3588-ubuntu-gpio测试/
toc: true
---

1. 治具定义，短接pin5-6、pin7-8、pin9-10、pin11-12
    ![alt text](/assets/images/测试sop/qy-3588-ubuntu-gpio测试/PixPin_2025-06-07_11-00-39.png)
    ![alt text](/assets/images/测试sop/qy-3588-ubuntu-gpio测试/PixPin_2025-06-07_11-05-50.png)

2. 打开终端，进入脚本所在目录，执行以下命令：  
   ```bash
   sudo chmod +x QY3588_gpio_test.sh
   sudo ./QY3588_gpio_test.sh
   ```

3. 测试成功输出示意：  
    ![alt text](PixPin_2025-06-07_11-02-17.png)
