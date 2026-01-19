#!/bin/bash
# 迁移小程序代码到miniapp

set -e

SOURCE_DIR="../miniprogram-native"
TARGET_DIR="miniapp"

echo "========================================="
echo "📱 迁移小程序代码"
echo "========================================="

# 复制页面
echo "1️⃣ 复制页面..."
mkdir -p $TARGET_DIR/pages
cp -r $SOURCE_DIR/pages/* $TARGET_DIR/pages/ 2>/dev/null || true

# 复制组件
echo "2️⃣ 复制组件..."
if [ -d "$SOURCE_DIR/components" ]; then
  cp -r $SOURCE_DIR/components/* $TARGET_DIR/components/ 2>/dev/null || true
fi

# 复制自定义底部导航
echo "3️⃣ 复制底部导航..."
cp -r $SOURCE_DIR/custom-tab-bar $TARGET_DIR/ 2>/dev/null || true

# 复制API封装
echo "4️⃣ 复制API..."
if [ -d "$SOURCE_DIR/api" ]; then
  cp -r $SOURCE_DIR/api/* $TARGET_DIR/api/ 2>/dev/null || true
fi

# 复制工具类
echo "5️⃣ 复制工具类..."
if [ -d "$SOURCE_DIR/utils" ]; then
  cp -r $SOURCE_DIR/utils/* $TARGET_DIR/utils/ 2>/dev/null || true
fi

# 复制静态资源
echo "6️⃣ 复制静态资源..."
if [ -d "$SOURCE_DIR/static" ]; then
  cp -r $SOURCE_DIR/static/* $TARGET_DIR/static/ 2>/dev/null || true
fi

# 复制入口文件
echo "7️⃣ 复制入口文件..."
cp $SOURCE_DIR/app.js $TARGET_DIR/ 2>/dev/null || true
cp $SOURCE_DIR/app.json $TARGET_DIR/ 2>/dev/null || true
cp $SOURCE_DIR/app.wxss $TARGET_DIR/ 2>/dev/null || true
cp $SOURCE_DIR/sitemap.json $TARGET_DIR/ 2>/dev/null || true

# 复制项目配置
echo "8️⃣ 更新项目配置..."
cp $SOURCE_DIR/project.config.json $TARGET_DIR/project.config.json.backup 2>/dev/null || true

echo ""
echo "✅ 小程序代码迁移完成！"
echo "📁 目标目录: $TARGET_DIR"
