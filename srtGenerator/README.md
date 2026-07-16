# 🎤 SRT 字幕生成器 — 用户手册

> 基于 **faster-whisper** 的日语音频转字幕工具，可将 MP3/WAV/M4A 等音频文件自动转写为 SRT 字幕格式。

---

## 📋 目录

1. [快速开始](#-快速开始)
2. [安装](#-安装)
3. [使用方法](#-使用方法)
4. [批量转换](#-批量转换)
5. [模型说明](#-模型说明)
6. [常见问题](#-常见问题)
7. [文件结构](#-文件结构)

---

## 🚀 快速开始

### 单个文件转换

把 `.mp3` 文件拖到 `audio-to-srt.bat` 上，等待几秒，同目录下就会生成 `.srt` 字幕文件。

### 批量转换

把文件夹拖到 `audio-to-srt.bat` 上，自动转换文件夹内所有音频文件。

---

## 📦 安装

### 前置要求

- **Python 3.8+**（[下载](https://www.python.org/downloads/)）
- **Windows 10/11**（macOS/Linux 也可用，但批处理 `.bat` 文件需改用命令行）

### 步骤

```bash
# 1. 安装 faster-whisper（已安装则跳过）
pip install faster-whisper

# 2. 下载模型（已下载则跳过）
#    当前已下载: small (~500MB) ✅
#    如需更高精度可下载 medium (~1.5GB) 或 large-v3 (~3GB)
python -c "
from huggingface_hub import snapshot_download
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
os.environ['HF_HUB_DISABLE_XET'] = '1'
snapshot_download(
    repo_id='Systran/faster-whisper-small',
    local_dir='models/faster-whisper-small',
)
"
```

> ⚠️ 国内用户如遇到下载慢，可在命令前加：
> ```bash
> set HF_ENDPOINT=https://hf-mirror.com
> set HF_HUB_DISABLE_XET=1
> ```

---

## 🎯 使用方法

### 方式一：拖放操作（推荐）

| 操作 | 结果 |
|---|---|
| 🎵 拖放 `.mp3` 到 `audio-to-srt.bat` | 生成对应 `.srt` |
| 📂 拖放文件夹到 `audio-to-srt.bat` | 转换文件夹内所有音频 |

### 方式二：命令行

```bash
# 进入脚本目录
cd srtGenerator

# 单个文件
python audio-to-srt.py "audio.mp3"

# 指定输出路径
python audio-to-srt.py "audio.mp3" -o "output.srt"

# 批量转换文件夹
python audio-to-srt.py "./audio_folder" --batch

# 批量 + 指定输出目录
python audio-to-srt.py "./audio_folder" --batch -o "./output"

# 使用更大模型提高精度
python audio-to-srt.py "audio.mp3" --model medium
```

### 参数说明

| 参数 | 默认值 | 说明 |
|---|---|---|
| `input` | (必填) | 音频文件、文件夹路径或通配符 `*.mp3` |
| `-o, --output-dir` | 同输入目录 | 输出目录 |
| `--batch` | 自动 | 批量模式（输入为文件夹时自动开启） |
| `--model` | `small` | 模型大小: `small`/`medium`/`large-v3` |
| `--model-dir` | 自动 | 本地模型路径 |
| `--language` | `ja` | 语言代码: `ja`(日语)/`en`(英语)/`zh`(中文)/`auto`(自动) |
| `--device` | `auto` | 计算设备: `auto`/`cpu`/`cuda` |

---

## 📂 批量转换

### 转换整个教程文件夹

```bash
python audio-to-srt.py "./audio_folder" --batch
```

输出示例：
```
📂 批量模式: 找到 16 个音频文件
   
📦 模型: small | 语言: ja | 设备: auto
   
==================================================
🎤 01鉄道.mp3
==================================================
  耗时: 20.6s | 19 条字幕 | 语言: ja
   
==================================================
🎤 02挨拶.mp3
==================================================
  ...
```

### 输出结构

```
中级课文MP3/
├── 01鉄道.mp3
├── 01鉄道.srt      ← 自动生成
├── 02挨拶.mp3
├── 02挨拶.srt      ← 自动生成
├── 03名字.mp3
├── 03名字.srt      ← 自动生成
└── ...
```

---

## 🧠 模型说明

| 模型 | 大小 | 速度 | 准确率 | 适用场景 |
|---|---|---|---|---|
| `small` | ~500MB | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ **默认模型**·已下载 |
| `medium` | ~1.5GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | 高质量字幕 |
| `large-v3` | ~3GB | ⚡ | ⭐⭐⭐⭐⭐+ | 最高精度（含标点） |

### 下载其他模型

```python
# 下载 medium 模型（替换 medium 为所需模型名）
from huggingface_hub import snapshot_download
import os
os.environ.update({'HF_ENDPOINT': 'https://hf-mirror.com', 'HF_HUB_DISABLE_XET': '1'})
snapshot_download(
    repo_id=f'Systran/faster-whisper-medium',
    local_dir='models/faster-whisper-medium',
)
```

模型下载位置：`srtGenerator/models/faster-whisper-{模型名}/`

---

## ❓ 常见问题

### Q: 转写结果不准怎么办？

- 默认使用 `small` 模型，精度和速度均衡
- 要求更高可换 `--model medium` 或 `--model large-v3`


### Q: 如何转写英文/中文音频？

```bash
python audio-to-srt.py audio.mp3 --language en   # 英文
python audio-to-srt.py audio.mp3 --language zh   # 中文
python audio-to-srt.py audio.mp3 --language auto # 自动检测
```

### Q: 生成的 SRT 时间轴不准？

SRT 时间轴基于 Whisper 自动检测的语音段落，通常准确。如需手动调整，可以用任何文本编辑器打开 `.srt` 文件修改时间戳。

### Q: 如何加速批量转换？

- 使用默认 `small` 模型速度已不错
- 有 NVIDIA GPU 时加 `--device cuda` 可提速 5-10 倍
- 模型只需加载一次，后续文件复用

### Q: 提示 "模型不存在"？

确保模型已下载到 `srtGenerator/models/faster-whisper-{模型名}/` 目录下。
模型文件包括：`model.bin`, `config.json`, `tokenizer.json`, `vocabulary.txt`

### Q: 安装 faster-whisper 失败？

国内用户可使用镜像：
```bash
pip install faster-whisper -i https://mirrors.ustc.edu.cn/pypi/web/simple
```

---

## 📁 文件结构

```
srtGenerator/
├── audio-to-srt.py          # 主转换脚本 (默认 small 模型)
├── audio-to-srt.bat         # Windows 拖放批处理
├── requirements.txt         # Python 依赖
├── models/
│   └── faster-whisper-small/ # small 模型 ✅ 默认
│       ├── model.bin
│       ├── config.json
│       ├── tokenizer.json
│       └── vocabulary.txt
├── README.md                # 本手册
└── 01鉄道.srt               # 输出示例
```

---

> 📌 **提示**：默认使用 `small` 模型（精度速度均衡），要求更高可用 `--model medium`。
> 生成的 `.srt` 文件可在本播放器项目中直接使用，加载同名 `.srt` 会自动匹配。
