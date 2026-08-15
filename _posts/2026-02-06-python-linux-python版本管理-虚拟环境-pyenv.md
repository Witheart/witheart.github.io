---
title: "Linux python版本管理 —— 虚拟环境 pyenv"
date: 2026-02-06
last_modified_at: 2026-02-06
categories:
  - "Python"
tags:
  - "Python"
permalink: /python/linux-python版本管理-虚拟环境-pyenv/
toc: true
---

pyenv 是最流行的 Python 版本管理工具，支持多个版本并行安装。


## 安装 pyenv
```bash
# 使用自动安装脚本
curl https://pyenv.run | bash

# 或手动安装
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
```

## 配置 shell
在 `~/.bashrc`中添加：
```bash
# Pyenv configuration
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init - bash)"
eval "$(pyenv virtualenv-init -)"
```
- 然后
```bash
source ~/.bashrc
```

## 验证安装
```bash
# 检查 pyenv 是否安装成功
pyenv --version

# 查看可用的命令
pyenv commands
```

## 常用命令
```bash
# 查看可安装的版本
pyenv install --list

# 安装特定版本
pyenv install 3.9.13
pyenv install 3.8.12
pyenv install 3.7.12

# 查看已安装的 Python 版本
pyenv versions

# 设置全局默认版本
pyenv global 3.9.13

# 设置当前目录使用的版本
pyenv local 3.8.12

# 设置 shell 会话临时版本
pyenv shell 3.7.12

# 查看当前使用的 Python 版本
pyenv version

# 卸载版本
pyenv uninstall 3.7.12
```

## 虚拟环境管理
只用pyenv，只能实现python管理，需要创建虚拟环境，才能实现依赖隔离。相关命令如下：
```bash
# 创建虚拟环境
pyenv virtualenv 3.9.6 myenv-3.9.6

# 激活虚拟环境
pyenv activate myenv-3.9.6

# 退出虚拟环境
pyenv deactivate

# 列出所有虚拟环境
pyenv virtualenvs
```
