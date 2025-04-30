#!/bin/bash

set -e  # 脚本出错就退出

# 检查参数
UPDATE_FRONTEND=false
UPDATE_BACKEND=false
RELOAD_NGINX=false

show_help() {
  echo "用法: $0 [选项]"
  echo "可用选项："
  echo "  -f    只更新前端"
  echo "  -b    只更新后端"
  echo "  -a    更新前后端（默认行为）"
  echo "  -n    reload Nginx"
  echo "  -h    显示此帮助信息"
}

while getopts "fbanh" opt; do
  case $opt in
    f)
      UPDATE_FRONTEND=true
      ;;
    b)
      UPDATE_BACKEND=true
      ;;
    a)
      UPDATE_FRONTEND=true
      UPDATE_BACKEND=true
      ;;
    n)
      RELOAD_NGINX=true
      ;;
    h)
      show_help
      exit 0
      ;;
    *)
      show_help
      exit 1
      ;;
  esac
done

# 如果没有提供参数，默认更新前后端但不 reload nginx
if [ "$UPDATE_FRONTEND" = false ] && [ "$UPDATE_BACKEND" = false ]; then
  UPDATE_FRONTEND=true
  UPDATE_BACKEND=true
fi

echo "🛠️ 开始部署流程..."

if [ "$UPDATE_FRONTEND" = true ]; then
  ### ===== 前端构建 =====
  echo "🚧 正在构建前端..."
  cd ~/review-planner/frontend
  npm run build

  ### ===== 拷贝前端到生产目录 =====
  echo "📦 拷贝前端构建产物到 /var/www/my-frontend..."
  sudo rm -rf /var/www/my-frontend/*
  sudo cp -r dist/* /var/www/my-frontend/
fi

if [ "$UPDATE_BACKEND" = true ]; then
  ### ===== 拷贝后端代码到生产目录 =====
  echo "📦 拷贝后端代码到 /var/www/review-planner-backend..."
  sudo rsync -av \
    --include='*/' \
    --include='*.py' \
    --exclude='*' \
    ~/review-planner/backend/ /var/www/review-planner-backend/

  ### ===== 重启后端服务 =====
  echo "🔁 重启后端 Gunicorn 服务..."
  sudo systemctl restart review-backend
fi

if [ "$RELOAD_NGINX" = true ]; then
  ### ===== Reload Nginx =====
  echo "🔁 Reload Nginx..."
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "✅ 部署完成！"
