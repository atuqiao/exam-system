# 静态资源说明

## 已添加的图片资源

### 1. 默认头像
- **路径**: `static/images/default-avatar.png`
- **说明**: 用户未设置头像时的默认图片
- **状态**: ✅ 已添加

### 2. Banner 图片
- **路径**: `static/images/banner.png`
- **说明**: 首页 Banner 图片
- **状态**: ✅ 已添加

### 3. TabBar 图标
- **路径**: `static/tabbar/`
- **文件**:
  - `exam.png` / `exam-active.png` - 试卷图标
  - `mock.png` / `mock-active.png` - 模考图标
  - `profile.png` / `profile-active.png` - 我的图标
- **状态**: ✅ 已添加

## 可选：图标资源
如果需要使用图标而非emoji，可以创建以下图标：

```
static/
├── images/
│   ├── default-avatar.png       # 默认头像 ✅
│   └── banner.png               # Banner图片 ✅
└── icons/
    ├── download.png             # 下载记录图标
    ├── subject.png              # 科目标签图标
    ├── contact.png              # 联系客服图标
    └── arrow.png                # 右箭头图标
```

## 当前实现

目前"我的"页面使用 emoji 图标，无需额外图片资源：
- 📥 下载记录
- 📚 已开通科目
- 💬 联系客服
- › 右箭头

## 如何添加自定义图标

如果想替换 emoji 为图片图标，需要：

1. 创建图标文件放到 `static/icons/` 目录
2. 修改 `pages/profile/profile.wxml` 文件，将 emoji 替换为图片标签：

```xml
<!-- 替换前 -->
<text class="menu-icon-text">📥</text>

<!-- 替换后 -->
<image class="menu-icon" src="/static/icons/download.png"></image>
```

3. 修改 `pages/profile/profile.wxss` 文件：

```css
/* 替换前 */
.menu-icon-text {
  font-size: 40rpx;
  margin-right: 20rpx;
}

/* 替换后 */
.menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}
```
