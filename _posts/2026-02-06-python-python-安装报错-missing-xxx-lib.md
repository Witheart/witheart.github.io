---
title: "Python 安装报错(Missing xxx lib)"
date: 2026-02-06
last_modified_at: 2026-02-06
categories:
  - "Python"
tags:
  - "Python"
permalink: /python/python-安装报错-missing-xxx-lib/
toc: true
---

## 问题描述
在安装新版本python时，比如python3.9.0，虽然成功安装了，但是报一些ModuleNotFoundError，如下
```bash
hw@hw-Default-string:/mnt/hdd/openbmc/build/romulus$ pyenv install 3.9.0
Downloading Python-3.9.0.tar.xz...
-> https://www.python.org/ftp/python/3.9.0/Python-3.9.0.tar.xz
Installing Python-3.9.0...
patching file Misc/NEWS.d/next/Build/2021-10-11-16-27-38.bpo-45405.iSfdW5.rst
patching file configure
patching file configure.ac
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/home/hw/.pyenv/versions/3.9.0/lib/python3.9/bz2.py", line 18, in <module>
    from _bz2 import BZ2Compressor, BZ2Decompressor
ModuleNotFoundError: No module named '_bz2'
WARNING: The Python bz2 extension was not compiled. Missing the bzip2 lib?
Traceback (most recent call last):
  File "<string>", line 1, in <module>
ModuleNotFoundError: No module named 'readline'
WARNING: The Python readline extension was not compiled. Missing the GNU readline lib?
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/home/hw/.pyenv/versions/3.9.0/lib/python3.9/sqlite3/__init__.py", line 23, in <module>
    from sqlite3.dbapi2 import *
  File "/home/hw/.pyenv/versions/3.9.0/lib/python3.9/sqlite3/dbapi2.py", line 27, in <module>
    from _sqlite3 import *
ModuleNotFoundError: No module named '_sqlite3'
WARNING: The Python sqlite3 extension was not compiled. Missing the SQLite3 lib?
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/home/hw/.pyenv/versions/3.9.0/lib/python3.9/tkinter/__init__.py", line 37, in <module>
    import _tkinter # If this fails your Python may not be configured for Tk
ModuleNotFoundError: No module named '_tkinter'
WARNING: The Python tkinter extension was not compiled and GUI subsystem has been detected. Missing the Tk toolkit?
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/home/hw/.pyenv/versions/3.9.0/lib/python3.9/lzma.py", line 27, in <module>
    from _lzma import *
ModuleNotFoundError: No module named '_lzma'
WARNING: The Python lzma extension was not compiled. Missing the lzma lib?
Installed Python-3.9.0 to /home/hw/.pyenv/versions/3.9.0
```

## 问题原因
在安装Python 3.9.0时，缺少了一些必要的依赖库，包括bzip2、readline、sqlite3、tkinter和lzma。这些库是Python的一些可选但常用的模块。在编译Python时，如果没有这些库，就会跳过这些模块的编译，导致在导入时出现ModuleNotFoundError。

## 解决方案
安装必要依赖库后，清除失败安装，然后再重新安装。

- 安装必要依赖库
```bash
sudo apt update
sudo apt install -y \
    make \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev
```

- 清理并重新安装
```bash
# 删除已安装的Python 3.9.0
pyenv uninstall 3.9.0

# 重新安装
pyenv install 3.9.0
```
