@echo off
chcp 65001 >nul
title SRT 字幕生成器 - faster-whisper

echo ============================================
echo  音频 → SRT 字幕转换工具 (支持批量)
echo ============================================
echo.

:: 检查 Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

:: 检查依赖
pip show faster-whisper >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 正在安装 faster-whisper...
    pip install -r "%~dp0requirements.txt"
    if %errorlevel% neq 0 (
        echo ❌ 安装失败
        pause
        exit /b 1
    )
)

:: 处理拖放的文件/文件夹或手动输入
if "%~1"=="" (
    echo 用法: 将音频文件或文件夹拖放到此批处理文件上
    echo.
    echo   - 拖放 单个文件 → 生成单个 SRT
    echo   - 拖放 文件夹   → 批量生成文件夹内所有音频的 SRT
    echo.
    set /p "input_path=请输入音频文件或文件夹路径: "
) else (
    set "input_path=%~1"
)

echo.
echo 输入: %input_path%

:: 判断是文件还是文件夹
dir /b /a-d "%input_path%" >nul 2>&1
if %errorlevel% equ 0 (
    echo 模式: 批量转换 (文件夹)
    python "%~dp0audio-to-srt.py" "%input_path%" --batch
) else (
    echo 模式: 单个转换
    python "%~dp0audio-to-srt.py" "%input_path%"
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ 转换完成！
) else (
    echo.
    echo ❌ 转换失败
)

echo.
pause
