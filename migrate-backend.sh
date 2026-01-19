#!/bin/bash
# 迁移后端代码到api-service

set -e

SOURCE_DIR="../miniprogram-native/backend"
TARGET_DIR="api-service"

echo "========================================="
echo "📦 迁移后端API代码"
echo "========================================="

# 复制源代码
echo "1️⃣ 复制源代码..."
cp -r $SOURCE_DIR/src/* $TARGET_DIR/src/ 2>/dev/null || echo "部分源文件可能不存在"

# 复制package.json (保留我们的新配置)
echo "2️⃣ 合并package.json..."
# 先备份
cp $TARGET_DIR/package.json $TARGET_DIR/package.json.new

# 复制数据库配置
echo "3️⃣ 复制数据库配置..."
cp $SOURCE_DIR/src/config/database.js $TARGET_DIR/src/config/ 2>/dev/null || true

# 复制环境变量模板
echo "4️⃣ 复制环境变量..."
cp $SOURCE_DIR/.env.example $TARGET_DIR/.env.example 2>/dev/null || true

# 复制管理页面
echo "5️⃣ 保留管理页面（临时）..."
mkdir -p $TARGET_DIR/admin-backup
cp -r $SOURCE_DIR/admin/* $TARGET_DIR/admin-backup/ 2>/dev/null || true

echo ""
echo "✅ 后端代码迁移完成！"
echo "📁 目标目录: $TARGET_DIR"
