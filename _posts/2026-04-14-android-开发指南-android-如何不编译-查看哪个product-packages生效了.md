---
title: "Android 如何不编译，查看哪个PRODUCT_PACKAGES生效了"
date: 2026-04-14
last_modified_at: 2026-04-14
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-如何不编译-查看哪个product-packages生效了/
toc: true
---

```bash
source build/envsetup.sh
lunch
```

- 然后执行
```bash
get_build_var PRODUCT_PACKAGES
```
