#!/bin/bash

set -e  # 脚本出错就退出
echo "🛠️ 开始部署流程..."

### ===== 前端构建 =====
echo "🚧 正在构建前端..."
cd ~/review-planner/frontend
npm run build

### ===== 拷贝前端到生产目录 =====
echo "📦 拷贝前端构建产物到 /var/www/my-frontend..."
sudo rm -rf /var/www/my-frontend/*
sudo cp -r dist/* /var/www/my-frontend/

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

### ===== Reload Nginx =====
echo "🔁 Reload Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 部署完成！"
