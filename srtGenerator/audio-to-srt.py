# audio-to-srt.py
# 将音频文件转换为 SRT 字幕文件 (使用 faster-whisper)
# 用法:
#   单个文件: python audio-to-srt.py <音频文件>
#   批量文件夹: python audio-to-srt.py <文件夹> --batch
#   批量通配:  python audio-to-srt.py "文件夹\*.mp3" --batch
#
# 示例:
#   python audio-to-srt.py lesson.mp3
#   python audio-to-srt.py .\audio\ --batch
#   python audio-to-srt.py .\audio\ --batch --model medium

import argparse
import glob
import os
import sys
import time
from pathlib import Path


AUDIO_EXTS = {'.mp3', '.m4a', '.wav', '.ogg', '.flac', '.mp4'}


def format_timestamp(seconds: float) -> str:
    """将秒数转换为 SRT 时间戳格式 (00:00:00,000)"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def convert_to_srt(segments, output_path: str):
    """将 Whisper 的 segments 输出写入 SRT 文件"""
    with open(output_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, 1):
            start = format_timestamp(seg.start)
            end = format_timestamp(seg.end)
            text = seg.text.strip()
            f.write(f"{i}\n{start} --> {end}\n{text}\n\n")
    return i


def transcribe_file(model, audio_path: Path, output_path: str, language: str):
    """转写单个音频文件并保存 SRT"""
    print(f"\n{'='*50}")
    print(f"🎤 {audio_path.name}")
    print(f"{'='*50}")

    start_time = time.time()
    segments, info = model.transcribe(
        str(audio_path),
        language=language if language != "auto" else None,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500, threshold=0.5),
    )

    seg_list = list(segments)
    elapsed = time.time() - start_time

    if not seg_list:
        print(f"⚠️  未识别到语音内容")
        return False

    count = convert_to_srt(seg_list, output_path)
    duration = info.duration if hasattr(info, 'duration') else 0
    print(f"  耗时: {elapsed:.1f}s | 音频长度: {duration:.0f}s | {count} 条字幕 | 语言: {info.language}")
    return True


def collect_audio_files(input_path: Path) -> list[Path]:
    """收集输入路径下的所有音频文件"""
    files = []
    seen = set()

    if input_path.is_dir():
        # 文件夹模式: 扫描所有音频文件 (Windows 大小写不敏感)
        for ext in AUDIO_EXTS:
            for f in input_path.glob(f"*{ext}"):
                key = f.resolve().absolute()
                if key not in seen:
                    seen.add(key)
                    files.append(f)
            for f in input_path.glob(f"*{ext.upper()}"):
                key = f.resolve().absolute()
                if key not in seen:
                    seen.add(key)
                    files.append(f)
        files.sort()
    elif input_path.suffix.lower() in AUDIO_EXTS:
        files = [input_path]
    else:
        # 可能是通配符, 尝试 glob
        matched = glob.glob(str(input_path))
        for m in matched:
            p = Path(m)
            if p.suffix.lower() in AUDIO_EXTS:
                key = p.resolve().absolute()
                if key not in seen:
                    seen.add(key)
                    files.append(p)
        files.sort()

    return files


def main():
    parser = argparse.ArgumentParser(
        description="将音频文件/文件夹批量转换为 SRT 字幕文件 (基于 faster-whisper)"
    )
    parser.add_argument("input", help="音频文件、文件夹路径或通配符 (如 *.mp3)")
    parser.add_argument("-o", "--output-dir",
                        help="输出目录 (默认: 与输入相同)")
    parser.add_argument(
        "--batch", action="store_true",
        help="批量模式: 输入为文件夹时自动启用, 也可手动指定",
    )
    parser.add_argument(
        "--model",
        default="small",
        choices=["small", "medium", "large-v3"],
        help="Whisper 模型大小 (默认: small)",
    )
    parser.add_argument(
        "--model-dir",
        default=None,
        help="本地模型目录路径 (默认: srtGenerator/models/faster-whisper-{model})",
    )
    parser.add_argument(
        "--language",
        default="ja",
        help="音频语言代码 (默认: ja 日语, 可选: en/zh/auto)",
    )
    parser.add_argument(
        "--device",
        default="auto",
        choices=["auto", "cpu", "cuda"],
        help="计算设备 (默认: auto, 有 GPU 自动用 CUDA)",
    )
    parser.add_argument(
        "--beam-size", type=int, default=5,
        help="Beam search 宽度 (默认: 5, 越大越准越慢)",
    )

    args = parser.parse_args()

    # 收集待处理文件
    input_path = Path(args.input)
    files = collect_audio_files(input_path)

    if not files:
        print(f"❌ 未找到音频文件: {args.input}")
        sys.exit(1)

    # 批量模式判断
    is_batch = args.batch or input_path.is_dir() or len(files) > 1
    if is_batch:
        print(f"📂 批量模式: 找到 {len(files)} 个音频文件")
        for f in files:
            print(f"   - {f.name}")

    # 确定输出目录
    if args.output_dir:
        output_dir = Path(args.output_dir)
    elif input_path.is_dir():
        output_dir = input_path
    else:
        output_dir = input_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    # 确定模型路径
    model_path = args.model_dir
    if model_path is None:
        model_path = str(Path(__file__).parent / "models" / f"faster-whisper-{args.model}")

    print(f"\n📦 模型: {args.model} | 语言: {args.language} | 设备: {args.device}")
    if Path(model_path).exists():
        print(f"  使用本地模型: {model_path}")
    else:
        print(f"❌ 本地模型不存在: {model_path}")
        print(f"  请先将模型下载到本地目录")
        sys.exit(1)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("❌ 请先安装依赖: pip install -r requirements.txt")
        sys.exit(1)

    # 加载模型
    print(f"\n⏳ 正在加载模型...")
    model = WhisperModel(
        model_path,
        device=args.device,
        compute_type="int8",
    )

    # 逐个转写
    success = 0
    fail = 0
    total_start = time.time()

    for audio_path in files:
        output_path = str(output_dir / f"{audio_path.stem}.srt")
        try:
            ok = transcribe_file(model, audio_path, output_path, args.language)
            if ok:
                success += 1
            else:
                fail += 1
        except Exception as e:
            print(f"❌ {audio_path.name}: {e}")
            fail += 1

    # 汇总
    total_elapsed = time.time() - total_start
    print(f"\n{'='*50}")
    print(f"📊 处理完成!")
    print(f"   总计: {len(files)} 个文件")
    print(f"   成功: {success}  |  失败: {fail}")
    print(f"   总耗时: {total_elapsed:.1f}s")
    if success > 0:
        print(f"   输出目录: {output_dir}")


if __name__ == "__main__":
    main()
