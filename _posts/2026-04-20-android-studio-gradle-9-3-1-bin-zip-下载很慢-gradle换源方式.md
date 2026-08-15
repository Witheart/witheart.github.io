---
title: "gradle-9.3.1-bin.zip 下载很慢，gradle换源方式"
date: 2026-04-20
last_modified_at: 2026-04-20
categories:
  - "Android Studio"
tags:
  - "Android Studio"
permalink: /android-studio/gradle-9-3-1-bin-zip-下载很慢-gradle换源方式/
toc: true
---

## 1. 修改配置：从 `-bin` 切换到 `-all`

需要修改 `gradle-wrapper.properties` 文件中的 `distributionUrl`。

**修改后的建议配置：**

```properties
# 修改为 -all.zip 以包含源码
distributionUrl=https\://mirrors.aliyun.com/gradle/gradle-9.3.1-all.zip

# 注意：当更换了下载包，之前的 bin 版 sha256 校验码就不再适用了
# 建议先注释掉校验码，让它成功下载后再补上，或者去官网查阅 all 版的校验码
# distributionSha256Sum=b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06
```

---

## 2. 其他源

- **腾讯云镜像：**
  `https\://mirrors.cloud.tencent.com/gradle/gradle-9.3.1-all.zip`
- **南京大学镜像（教育网极快）：**
  `https\://mirrors.nju.edu.cn/gradle/gradle-9.3.1-all.zip`
