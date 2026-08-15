---
title: "XFCE 开始菜单 Whisker 用户头像和用户名显示修改"
date: 2025-08-18
last_modified_at: 2025-08-18
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/xfce-开始菜单-whisker-用户头像和用户名显示修改/
toc: true
---

## 1 修改方法
- 头像和用户名指此处的位置
![alt text](/assets/images/ubuntu-开发指南/xfce-开始菜单-whisker-用户头像和用户名显示修改/PixPin_2025-08-18_10-27-45.png)

### 1.2 头像修改方式
上图显示的头像应该是默认的头像，没设置时就会显示这个。如果想自定义，就在桌面登录的用户的家目录下，放一张图片，并改名为`.face`。

- 如/home/user/.face

参考[https://www.reddit.com/r/Fedora/comments/ul6qbv/xfce_user_picture/?tl=zh-hans](https://www.reddit.com/r/Fedora/comments/ul6qbv/xfce_user_picture/?tl=zh-hans)

### 1.3 用户名修改方式
这里的用户名是系统自动读取的用户全名（GECOS字段），可以在/etc/passwd文件中看到。如：
```bash
user:x:1000:1000:firefly,,,:/home/user:/bin/bash
```
这里的用户全名是firefly（第五个字段），那么在开始菜单中就会显示firefly。

- 使用以下的方式修改
```bash
sudo usermod -c "要更改的全名" 当前桌面登录的用户
```
示例：
```bash
sudo usermod -c "user" user
```
表示将用户user的全名也改为user。(该字段可以为空)

参考[https://forum.xfce.org/viewtopic.php?id=11694](https://forum.xfce.org/viewtopic.php?id=11694)

Ubuntu22.04 + xfce4-session 4.16.0 中，即使GECOS为空，whisker 用户名也会显示。
