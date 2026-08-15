---
title: "jekyll minimal-mistakes github Page 建站"
date: 2025-05-23
last_modified_at: 2025-05-23
categories:
  - "blog"
tags:
  - "blog"
permalink: /blog/jekyll-minimal-mistakes-github-page-建站/
toc: true
---

## 什么是Jekyll、Ruby、RubyGems、Bundle、Minimal Mistakes​​ 和 ​​GitHub Pages​?
[什么是Jekyll、Ruby、RubyGems、Bundle、Minimal Mistakes​​ 和 ​​GitHub Pages](/blog/什么是jekyll-ruby-rubygems-bundle-minimal-mistakes-和-github-pages/)

## 环境
Windows 10

## 参考链接
[Minimal Mistakes Quick-Start Guide](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/#starting-fresh)
[Jekyll Themes](http://jekyllthemes.org/page1/)
[Jekyll on Windows](https://jekyllrb.com/docs/installation/windows/)
[使用Jekyll + GitHub Pages搭建个人博客](https://zzy979.github.io/posts/creating-personal-blog-site/)
[使用 Jekyll 创建 GitHub Pages 站点](https://docs.github.com/zh/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll)
[Jekyll Minimal Mistakes 实战配置](https://zhuanlan.zhihu.com/p/1889987473645499816)
[在 Mac 上安装 Jekyll](https://idratherbewriting.com/documentation-theme-jekyll/mydoc_install_jekyll_on_mac.html#githuberror)
[在GitHub Pages上部署Jekyll静态博客](https://zhuanlan.zhihu.com/p/433547496)
[[Bug]: Gem::Ext::BuildError: ERROR: Failed to build gem native extension.{Installing wdm 0.1.1 with native extensions}](https://github.com/jekyll/jekyll/issues/9660)


## 步骤
1.  安装RubyInstaller后，会提示安装`MSYS2 and MINGW development tool chain`
2. 使用这个仓库模板，命名为`{github名}.github.io` [Use this template](https://github.com/new?template_name=mm-github-pages-starter&template_owner=mmistakes)
3. 在本地克隆这个仓库
4. 在本地仓库下，cmd执行
    ```cmd
    bundle install
    bundle exec jekyll serve
    ```
5. 如果要使用自己的域名，先配置好DNS指向（CNAME），然后在github仓库上，setting -> Page -> CNAME里面添加自己的域名

## 问题解决
1. 如果遇到错误`bind': Permission denied - bind(2) for 127.0.0.1:4000 (Errno::EACCES)` 多换几个端口尝试
    ```cmd
    bundle exec jekyll serve --port 4003
    ```

2. 如果遇到错误
   `Gem::Ext::BuildError: ERROR: Failed to build gem native extension`
   `error occurred while installing wdm (0.1.0), and Bundler cannot continue`

    尝试修改本地文件`Gemfile`为这一行
    `gem "wdm", "~> 0.2.0" if Gem.win_platform?`
