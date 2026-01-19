# 图片资源说明

## 缺失的图片文件

本项目需要以下图片文件，但目前仅创建了占位文件。您需要替换为实际的图片资源：

### 1. default-avatar.png
- **用途**: 用户默认头像
- **位置**: `/static/images/default-avatar.png`
- **尺寸**: 建议 160x160 像素
- **说明**: 在用户未上传头像时显示的默认头像图片

### 2. banner.png
- **用途**: 首页横幅图片
- **位置**: `/static/images/banner.png`
- **尺寸**: 建议 750x300 像素（微信小程序标准）
- **说明**: 可用于首页展示的横幅图片

## 现有的图片文件

以下图片文件已存在（tabbar图标）：
- `/static/tabbar/exam.png` - 试题图标
- `/static/tabbar/exam-active.png` - 试题选中图标
- `/static/tabbar/featured.png` - 精选图标
- `/static/tabbar/featured-active.png` - 精选选中图标
- `/static/tabbar/profile.png` - 我的图标
- `/static/tabbar/profile-active.png` - 我的选中图标

## 替换方法

1. 准备好相应尺寸的图片文件
2. 将图片文件复制到对应的目录
3. 保持文件名一致
4. 建议使用 PNG 格式以获得最佳显示效果

## 临时解决方案

在图片未准备好之前，可以使用以下方式：
1. 使用网络图片URL（需要配置小程序合法域名）
2. 使用Base64编码的图片
3. 使用纯色背景+文字的方式替代
