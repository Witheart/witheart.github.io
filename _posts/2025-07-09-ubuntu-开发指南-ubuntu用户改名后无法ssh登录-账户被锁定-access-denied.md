---
title: "Ubuntu用户改名后无法SSH登录（账户被锁定）Access denied"
date: 2025-07-09
last_modified_at: 2025-07-09
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu用户改名后无法ssh登录-账户被锁定-access-denied/
toc: true
---

概要：本文介绍了在 Ubuntu 系统中改名用户后，无法通过 SSH 登录的问题，分析了其原因并提供了解决方法，即解锁被锁定的用户账户。  


## 1. 适用情况  

- 原本可以正常登录的用户，在更名后尝试通过 SSH 登录时，提示 “Access denied”。

---

## 2. 原因分析  

- 用户更名后，系统可能自动将该用户账户锁定，导致无法通过 SSH 登录。

---

## 3. 检查账户是否被锁定  

使用以下命令检查账户状态：  

```bash
sudo passwd -S 用户名
```

### 状态解读：

- `P` 或 `PS`：密码状态正常（Password Set）  
- `L` 或 `LK`：账户被锁定（Locked）  

---

## 4. 解锁账户  

若状态为 `L` 或 `LK`，说明账户被锁定，此时可使用以下命令解锁账户：

```bash
sudo passwd -u 用户名
```

---

## 5. 操作示例  

```bash
root@user:/home/KangHua# sudo passwd -S KangHua
KangHua L 06/24/2025 0 99999 7 -1

root@user:/home/KangHua# sudo passwd -u KangHua
passwd: password expiry information changed.

root@user:/home/KangHua# sudo passwd -S KangHua
KangHua P 06/24/2025 0 99999 7 -1
```

---

通过上述操作，即可成功解锁被锁定的账户，恢复 SSH 登录功能。
