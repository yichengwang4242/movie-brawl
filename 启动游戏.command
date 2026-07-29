#!/bin/zsh

cd "$(dirname "$0")" || exit 1

if curl -fsS "http://127.0.0.1:4173/api/health" >/dev/null 2>&1; then
  open "http://127.0.0.1:4173"
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js，请先安装 Node.js 20 或更高版本。"
  read -r "?按回车键关闭..."
  exit 1
fi

echo "电影大乱斗正在启动..."
(sleep 1; open "http://127.0.0.1:4173") &
node server.js
