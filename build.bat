@echo off
echo 构建 Anni的撸毛日记...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 安装依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 构建项目
echo 正在构建项目...
npm run build
if %errorlevel% neq 0 (
    echo 构建失败
    pause
    exit /b 1
)

echo 构建完成！
echo 运行 npm start 启动生产服务器
pause
