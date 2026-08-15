---
title: "为Markdown导出的PDF添加页眉页脚"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "其他工具使用技巧"
tags:
  - "其他工具使用技巧"
permalink: /其他工具使用技巧/为markdown导出的pdf添加页眉页脚/
toc: true
---

- **作者**: 吴思含（Witheart）
- **更新时间**: 20241217

## 环境
- vscode
- 扩展：Markdown PDF

## 操作方式
- 快捷键 `Ctrl+,` 打开设置
- 搜索 "markdown-pdf"
- 找到设置
  - **页眉**: Markdown-pdf: Header Template
  - **页脚**: Markdown-pdf: Footer Template

### 页眉插入示例内容：
此处使用base64内嵌图片（[图片转base64工具：https://www.base64-image.de/](https://www.base64-image.de/)）

```html
<div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; margin: 0 1cm;">
    <img src="data:image/png;base64,示例base64编码图片" style="height: 30px;">
</div>
```
- `display: flex;` 设置容器为Flex布局，使子元素可以灵活排列。
- `justify-content: space-between;` 使子元素在主轴方向上平均分布，首尾元素贴近容器边缘。
- `align-items: center;` 使子元素在交叉轴方向上居中对齐。
- `font-size: 10px;` 设置文字大小为10像素。
- `margin: 0 1cm;` 设置容器的左右边距为1厘米。
- `src="data:image/png;base64,示例base64编码图片"` 使用base64编码的图片作为图片源。
- `style="height: 30px;"` 设置图片高度为30像素。

<div STYLE="page-break-after: always;"></div>

### 页脚插入示例信息：
```html
<div style="border-top: 1px solid #000; font-size: 8px; margin: 0 1cm; padding-top: 5px;">
    <div style="display: flex; justify-content: space-between; align-items: center; line-height: 1.5; white-space: pre;">
        <span>示例公司名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;示例地址&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;示例电话号码&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;示例网站</span>
    </div>
</div>
```
- `border-top: 1px solid #000;` 在容器顶部添加一条1像素的黑色实线边框。
- `font-size: 8px;` 设置文字大小为8像素。
- `margin: 0 1cm;` 设置容器的左右边距为1厘米。
- `padding-top: 5px;` 设置容器顶部内边距为5像素。
- `display: flex;` 同上，设置为Flex布局。
- `justify-content: space-between;` 同上，使子元素在主轴方向上平均分布。
- `align-items: center;` 同上，使子元素在交叉轴方向上居中对齐。
- `line-height: 1.5;` 设置行高为1.5倍的字体大小。
- `white-space: pre;` 保持文本中的空白符（如空格和换行），不折行。
- `span` 标签用于包裹文本内容，`&nbsp;` 表示非断行空格，用于控制文本间距。

**注意**: 虽然这个插件支持HTML和CSS，但有些功能可能需要自行调整。
