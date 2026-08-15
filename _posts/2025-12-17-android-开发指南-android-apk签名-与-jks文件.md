---
title: "Android APK签名 与 jks文件"
date: 2025-12-17
last_modified_at: 2025-12-17
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-apk签名-与-jks文件/
toc: true
---

# Android APK签名
## 一、核心概念
APK签名是Android应用发布的核心安全机制，用于验证应用的完整性和来源真实性。它确保APK在发布后不被篡改，并建立开发者身份的可信链。

## 二、核心目的

1. **完整性验证** - 确保APK在签名后未被修改
2. **身份认证** - 确认应用来自特定开发者
3. **版本升级控制** - 防止恶意应用覆盖合法应用
4. **权限共享** - 允许相同签名的应用共享数据

## 三、技术架构

### 1. 密钥和证书体系
```bash
# 典型的密钥生成
keytool -genkeypair -v \
  -keystore my-release-key.jks \
  -keyalg RSA -keysize 4096 \
  -validity 10000 \
  -alias my-alias \
  -sigalg SHA256withRSA \
  -dname "CN=Developer Name, OU=Unit, O=Company, L=City, ST=State, C=CN"
```

**关键参数：**
- **密钥库（Keystore）**: JKS（Java KeyStore）或PKCS12格式
- **密钥算法**: RSA（推荐4096位）或ECC
- **签名算法**: SHA256withRSA, SHA256withECDSA
- **有效期**: Google Play要求至少2033年10月22日后到期

### 2. 签名方案演进

#### V1签名（JAR签名）
```bash
# 基于JAR文件的MANIFEST.MF签名
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore my-release-key.jks \
  app.apk my-alias
```

**技术细节：**
- 在META-INF/目录创建：
  - MANIFEST.MF（文件哈希列表）
  - CERT.SF（清单签名文件）
  - CERT.RSA（证书和签名）
- 不保护APK整体结构

#### V2签名（APK签名方案v2）
```android
# 在APK中插入签名块
+-----------------------------------+
| ZIP entries (before Central Directory) |
+-----------------------------------+
| APK Signing Block (v2)            | ← 新增签名块
+-----------------------------------+
| Central Directory                 |
+-----------------------------------+
| End of Central Directory         |
+-----------------------------------+
```

**关键技术：**
- 计算整个APK（除签名块）的哈希树
- 防篡改保护包括ZIP元数据
- 支持APK分块对齐优化
- 更快的验证速度

#### V3签名（APK签名方案v3）
- 支持密钥轮换，保持升级连续性
- 添加额外的证明块
- 向后兼容V2

#### V4签名（基于fs-verity）
- 为增量APK安装设计
- 生成整个APK的Merkle树
- 文件系统级完整性验证

## 四、签名生成流程

### 详细步骤：
1. **计算哈希** - 对每个文件计算摘要
2. **生成清单** - 创建MANIFEST.MF记录所有摘要
3. **签名清单** - 用私钥签署清单文件
4. **构建签名块** - 组织证书和签名
5. **插入APK** - 将签名数据嵌入APK结构


## 五、验证流程

### 系统验证过程：
```
+-------------------+     +-------------------+     +-------------------+
| 启动验证请求       | →   | 提取证书链        | →   | 验证签名完整性    |
+-------------------+     +-------------------+     +-------------------+
        ↓                        ↓                        ↓
+-------------------+     +-------------------+     +-------------------+
| 检查密钥有效期     | →   | 验证证书链信任    | →   | 比较APK哈希值     |
+-------------------+     +-------------------+     +-------------------+
```


# jks文件
## 一、JKS文件的本质

**JKS（Java KeyStore）文件是一个容器**，它包含了：

1. **私钥**（Private Key）- 用于签名
2. **公钥证书**（Public Key Certificate）- 包含公钥，用于验证
3. **证书链**（Certificate Chain）- 可选，包含CA证书
4. **元数据** - 如别名、有效期等

```bash
# 查看JKS文件内容
keytool -list -v -keystore my-release-key.jks
```

输出示例：
```
密钥库类型: JKS
密钥库提供方: SUN

您的密钥库包含 1 个条目

别名: my-alias
创建日期: 2023-1-1
条目类型: PrivateKeyEntry
证书链长度: 1
证书[1]:
所有者: CN=John Doe, OU=Android, O=Google, L=Mountain View, ST=California, C=US
发布者: CN=John Doe, OU=Android, O=Google, L=Mountain View, ST=California, C=US
序列号: 123456
有效期: Jan 1 00:00:00 2023 GMT 至: Jan 1 00:00:00 2033 GMT
证书指纹:
     SHA1: 12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78
     SHA256: AB:CD:EF:...
签名算法名称: SHA256withRSA
主体公共密钥算法: 4096位RSA密钥
```

## 二、JKS的内部结构

```
my-release-key.jks (密钥库文件)
├── 存储密码: 保护整个密钥库
└── 条目1: "my-alias"
    ├── 私钥 (encrypted)     # 🔐 绝密！用于签名
    ├── 密钥密码              # 保护私钥
    └── 公钥证书              # 公开的，用于验证
        ├── 公钥
        ├── 主体信息
        ├── 有效期
        └── 数字签名
```

## 三、为什么这样设计？

### 1. 安全性考虑
- **私钥永远不离开JKS文件**：私钥在JKS中是加密存储的
- **证书可安全分发**：证书只包含公钥，可以公开
- **双重密码保护**：
  - 密钥库密码：访问整个JKS
  - 密钥密码：使用特定私钥

### 2. 工作流程
```
开发者机器：
JKS文件（私钥+证书） → 签名APK → 发布到商店
             ↓
         私钥保留本地
             ↓
用户设备：
从APK提取证书（公钥） → 验证签名
```

## 四、JKS文件的保护层级

### 密码保护层级：
```
JKS文件
├── 外层：存储密码（保护整个文件）
│   └── 别名1
│       ├── 私钥 → 用密钥密码A加密
│       └── 证书（公钥）→ 明文
│
├── 别名2
│   ├── 私钥 → 用密钥密码B加密
│   └── 证书（公钥）→ 明文
│
└── 别名3
    ├── 私钥 → 用密钥密码C加密
    └── 证书（公钥）→ 明文
```
