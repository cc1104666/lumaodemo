@echo off
echo 启动 Anni的撸毛日记...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 检查数据目录
if not exist "data" (
    echo 创建数据目录...
    mkdir data
)

REM 启动开发服务器
echo 启动开发服务器...
echo 请在浏览器中访问: http://localhost:3000
echo 管理后台地址: http://localhost:3000/admin/login
echo 默认账户: admin / 123456
echo.
echo 按 Ctrl+C 停止服务器
npm run dev

pause
