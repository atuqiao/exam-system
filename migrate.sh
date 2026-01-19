#!/bin/bash
# 项目迁移和初始化脚本

set -e

echo "========================================="
echo "🚀 项目迁移和初始化脚本"
echo "========================================="

CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$CURRENT_DIR/../miniprogram-native"

echo "📁 当前目录: $CURRENT_DIR"
echo "📁 源代码目录: $SOURCE_DIR"

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ 源代码目录不存在: $SOURCE_DIR"
  exit 1
fi

echo ""
echo "✅ 目录检查完成"
