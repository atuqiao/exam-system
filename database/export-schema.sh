#!/bin/bash
# 导出数据库结构

set -e

echo "========================================="
echo "🗄️ 导出数据库结构"
echo "========================================="

# 从.env读取数据库配置
if [ -f "../miniprogram-native/backend/.env" ]; then
  source ../miniprogram-native/backend/.env
else
  echo "❌ 找不到.env文件"
  exit 1
fi

# 导出数据库结构
echo "导出表结构..."
mysqldump -h $DB_HOST \
  -P $DB_PORT \
  -u $DB_USER \
  -p$DB_PASSWORD \
  --no-data \
  $DB_NAME > schema/schema.sql

echo "导出种子数据..."
mysqldump -h $DB_HOST \
  -P $DB_PORT \
  -u $DB_USER \
  -p$DB_PASSWORD \
  --no-create-info \
  --skip-triggers \
  $DB_NAME \
  cities grades subjects > seeds/data.sql

echo ""
echo "✅ 数据库结构导出完成！"
echo "📁 schema位置: database/schema/schema.sql"
echo "📁 种子数据位置: database/seeds/data.sql"
