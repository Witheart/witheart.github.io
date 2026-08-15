---
title: "Android 下使用adb查看内存RAM大小"
date: 2025-07-30
last_modified_at: 2025-07-30
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-下使用adb查看内存ram大小/
toc: true
---

```bash
adb shell dumpsys meminfo | grep "Total RAM"
```

输出如下，单位为KB
```bash
Total RAM: 3,992,508K (status normal)
```

十进制下除以两次1024就得到以GB为单位的数值了。
