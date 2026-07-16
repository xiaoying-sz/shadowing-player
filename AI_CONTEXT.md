# AI Context — Japanese Shadowing Player (日本語シャドーイング)

> 供 AI 工具恢复上下文或新开发者了解项目时使用。
> 最后更新: 2026-07-16

---

## 1. 项目概述

Electron + React + TypeScript 桌面应用，专为日语学习者设计的**影子跟读（シャドーイング）**音频播放器。

- **GitHub**: https://github.com/xiaoying-sz/shadowing-player
- **平台**: Windows (NSIS installer / 可移植版)
- **项目路径**: `D:\CodingAgent\language-player\`
- **开发语言**: TypeScript 7.0 / Python 3.12 (字幕生成工具)
- **Node 版本**: 24.15
- **npm 版本**: 11.12

---

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Electron | 43.1.1 |
| 前端 | React | 19.2.7 |
| 构建 | Vite | 8.1.4 |
| 样式 | Tailwind CSS | 4.3 (via @tailwindcss/vite) |
| 主进程编译 | tsc (tsconfig.node.json) | TypeScript 7.0 |
| 打包 | electron-builder | 26.15.3 (NSIS for Windows) |
| 音频编码 | ffmpeg-static + fluent-ffmpeg | 主进程编码 MP3/AAC |
| 字幕生成 | faster-whisper | 1.2.1 (Python, 独立工具) |

### 关键依赖

```
dependencies:
  ffmpeg-static ^5.3.0    # 内置 ffmpeg 二进制
  fluent-ffmpeg ^2.1.3     # ffmpeg Node.js 封装
  react ^19.2.7
  react-dom ^19.2.7

devDependencies:
  electron ^43.1.1
  electron-builder ^26.15.3
  vite ^8.1.4
  tailwindcss ^4.3.2
  @tailwindcss/vite ^4.3.2
  @vitejs/plugin-react ^6.0.3
  concurrently ^10.0.3
  typescript ^7.0.2
```

### 目录结构

```
language-player/
├── electron/
│   ├── main.ts              # Electron 主进程 (IPC handlers, window mgmt)
│   └── preload.ts           # contextBridge API 暴露
├── src/
│   ├── App.tsx              # 根组件 (路由/加载/拖拽)
│   ├── main.tsx             # React 入口
│   ├── context/
│   │   └── PlayerContext.tsx # 全局状态管理 (React Context)
│   ├── services/
│   │   ├── AudioService.ts   # 音频播放 (HTMLAudioElement)
│   │   ├── SubParser.ts      # SRT 字幕解析 + 振り仮名语法
│   │   ├── LoopService.ts    # 循环模式 (句/段落/A-B)
│   │   └── RecorderService.ts# 麦克风录音 (MediaRecorder API)
│   ├── components/
│   │   ├── TitleBar.tsx      # 自定义标题栏
│   │   ├── DropZone.tsx      # 拖拽加载区
│   │   ├── TransportControls.tsx # 播放控制 (播放/暂停/前进/后退)
│   │   ├── ProgressBar.tsx   # 进度条
│   │   ├── SpeedSelector.tsx # 速度选择 (0.5x-2.0x)
│   │   ├── SubtitlePanel.tsx # 字幕面板 (滚动/高亮/点击跳转)
│   │   ├── RubyText.tsx      # 振り仮名渲染 (<ruby> 标签)
│   │   ├── LoopModeSelector.tsx # 循环模式选择
│   │   ├── ShadowPanel.tsx   # 录音面板 (开始/停止/导出/质量)
│   │   └── Playlist.tsx      # 播放列表面板
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── srtGenerator/             # 独立字幕生成工具 (Python)
│   ├── audio-to-srt.py       # 主脚本 (faster-whisper)
│   ├── audio-to-srt.bat      # Windows 拖拽快捷方式
│   ├── requirements.txt      # Python 依赖
│   └── models/               # 模型文件 (config/vocabulary 已上传, model.bin 被 gitignore)
├── openspec/                 # 规范驱动开发文档
├── AI_CONTEXT.md             # 本文件 - AI 上下文
└── 用户手册.html             # 用户手册
```

---

## 3. 架构设计

### 进程模型

```
Electron Main Process
  ├── Window Manager (BrowserWindow)
  ├── File I/O (dialog, fs)
  ├── Audio Conversion (ffmpeg)
  └── IPC Bridge (contextBridge)

Electron Renderer Process (Vite + React)
  ├── PlayerContext (全局状态)
  ├── Services (AudioService, LoopService, RecorderService)
  └── UI Components
```

### 关键设计决策

1. **Electron over Tauri**: 直接访问 Web Audio API + MediaRecorder
2. **HTMLAudioElement**: 播放引擎，原生支持 playbackRate + 变调不变速
3. **React Context 非 Redux**: 单页应用，状态简单够用
4. **ffmpeg-static**: 主进程音频编码 (MP3/M4A)，渲染进程通过 IPC 传 PCM 数据
5. **contextIsolation: true / nodeIntegration: false**: 安全模式，renderer 无 Node.js 全局
6. **jsx: react-jsx**: React 19 自动 JSX 转换，无需 `import React`

### 已知限制

- **DisplayModeSelector** 已被移除 (日语纯文本模式)
- **振り仮名按钮** 已被移除 (始终显示)
- **混合立体声导出** 已被移除 (改为 WebM/WAV/MP3/M4A 单轨导出)
- Vite HMR 与 context exports 有兼容问题 (开发时改 PlayerContext 需手动刷新)
- **NSIS 安装包无法生成**: 国内网络下载 nsis-resources 超时 (需要科学上网或手动缓存)
- **Electron 需要镜像**: 中国网络环境下每次启动需要 `ELECTRON_MIRROR` 环境变量
- **浏览器模式 electronAPI 不可用**: 浏览器中 `window.electronAPI` 为 undefined，文件对话框由 `<input type="file">` 回退替代

### CSP 策略

```html
default-src 'self'; script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline'; media-src 'self' file: blob:;
connect-src 'self' blob: ws: http://localhost:*; img-src 'self' data: blob:;
```

### Electron 安全配置

```ts
contextIsolation: true,  // 安全隔离
nodeIntegration: false,  // 禁用 Node 集成
sandbox: false,          // 需要 preload 访问 Node API
preload: path.join(__dirname, 'preload.js')
```

---

## 4. 已实现功能

### 4.1 音频播放
- 支持格式: MP3, M4A, WAV, OGG, FLAC
- 加载方式: 文件对话框 (Ctrl+O)、拖拽、文件夹加载
- 播放控制: 播放/暂停 (空格)、进度条点击跳转 (自动播放)
- 速度控制: 7 档 (0.50x ~ 2.00x, 键 1-7)

### 4.2 字幕系统 (SRT)
- 标准 SRT 解析 (索引、时间、文本)
- 自动匹配: 同目录同名 `.srt`
- 手动加载: 点击「加载字幕」
- 振り仮名: `{漢字|よみ}` → HTML `<ruby>` 渲染 (始终显示)
- 管道符扩展: `日本語|romaji|中文訳` (仅解析，日语单行显示)
- 当前句高亮 + 自动滚动
- 点击字幕跳转并自动播放
- 字幕隐藏/显示 (`S` 键)

### 4.3 句子导航
- `↑`/`↓`: 上一句/下一句
- 智能后退: 句首 1 秒内按后退 → 跳到上一句

### 4.4 循环模式
- 单句循环、段落循环 (3 句)、A-B 自定义区间
- 进度条显示循环区间高亮

### 4.5 影子跟读录音
- MediaRecorder API (audio/webm;codecs=opus)
- 录音延迟滑块 (200ms ~ 1000ms, 默认 400ms)
- 原声音量控制
- **录音质量切换**:
  - 标准: 44.1kHz, echo cancellation + noise suppression
  - 高质量: 48kHz, mono, 128kbps Opus, 关闭 DSP
- 状态指示: idle → recording → done
- 快捷键: `R` 开始/停止

### 4.6 录音导出
- **WebM**: 原始录音 (Opus)
- **WAV**: PCM 16-bit 单声道 (OfflineAudioContext 解码)
- **MP3**: 128kbps libmp3lame (ffmpeg 主进程)
- **M4A**: AAC 128kbps (ffmpeg 主进程)
- 导出失败自动回退 WAV

### 4.7 播放列表
- 加载文件夹 → 扫描音频文件 → 自动播放
- 侧边栏 (点击「列表」切换)
- 双击切换文件
- `Ctrl+N` / `Ctrl+P` 上一首/下一首

---

## 5. IPC 接口 (electron/preload.ts -> main.ts)

| IPC Channel | 方向 | 用途 |
|---|---|---|
| `dialog:openAudio` | R→M | 打开音频文件对话框 |
| `dialog:openSubtitle` | R→M | 打开字幕文件对话框 |
| `dialog:saveAudio` | R→M | 保存导出音频对话框 |
| `dialog:openFolder` | R→M | 打开文件夹对话框 |
| `fs:scanAudioFolder` | R→M | 扫描文件夹音频文件 |
| `fs:readFile` | R→M | 读取文件内容 (UTF-8) |
| `fs:readAudioFile` | R→M | 读取音频文件 (Base64) |
| `fs:writeFile` | R→M | 写入文件 (Uint8Array) |
| `fs:convertAudio` | R→M | WAV → MP3/M4A 转换 (ffmpeg) |
| `fs:getAutoSubtitle` | R→M | 自动匹配同目录字幕 |
| `window:minimize/maximize/close` | R→M | 窗口控制 |

### convertAudio IPC 详情
```
renderer → main: { data: number[], savePath: string, format: string }
  data: WAV 文件字节数组
  savePath: 最终保存路径 (含扩展名)
  format: 'mp3' | 'm4a'

main process:
  1. 写 WAV 到临时文件
  2. ffmpeg 转换 (libmp3lame / aac, 128kbps)
  3. 写入 savePath
  4. 删除临时文件
```

---

## 6. 状态管理 & 架构细节

### 音频加载策略

```
Electron: IPC dialog:openAudio → fs:readAudioFile (base64) → Blob → Blob URL → HTMLAudioElement
Browser:  <input type="file"> / Drag & Drop → File → URL.createObjectURL → HTMLAudioElement
```

### 状态管理说明

- 使用 **React Context** (`PlayerContext`) 而非 Redux/Zustand
- `AudioService` / `LoopService` / `RecorderService` 是**单例类**，非 React 组件
- Service 通过**回调模式**与 React 状态同步 (`onLoad`, `onTimeUpdate`, `onEnded`)
- `useEffect` 在挂载时注册回调，`[]` 依赖运行一次
- 回调内使用 **functional setState** `setState(prev => ...)` 避免闭包过期

### PlayerContext 状态结构
```typescript
interface PlayerState {
  isLoaded: boolean;          // 音频是否加载
  isPlaying: boolean;         // 是否播放中
  currentTime: number;
  duration: number;
  speed: SpeedLevel;
  fileName: string;
  sentences: SubtitleSentence[];
  currentSentence: SubtitleSentence | null;
  displayMode: DisplayMode;   // 仅 'japanese' (其他模式被移除)
  showSubtitles: boolean;
  subtitleFileName: string;
  isSubtitleLoaded: boolean;
  loopMode: LoopMode;         // 'off' | 'sentence' | 'paragraph' | 'ab'
  recordingState: RecordingState; // 'idle' | 'recording' | 'done'
  recordingDelay: number;
  originalVolume: number;
  isDragOver: boolean;
  playlist: PlaylistItem[];
  currentPlaylistIndex: number;
  showPlaylist: boolean;
}
```

### 录音流程 (RecorderService)
```
start() → getUserMedia → MediaRecorder.start(100) → state=recording
stop()  → mediaRecorder.stop()
           ↓ (异步)
         onstop 事件:
           1. 组装 Blob → onDataAvailable 回调 → recordedBlobRef
           2. state = done
           3. UI 显示导出按钮
```

### 导出流程
```
exportRecording(format)
  → saveAudio(defaultName)  // native save dialog
  → 强制修正扩展名为 format 参数的值
  → if webm: 直接保存原始 Blob
  → if wav/ mp3/ m4a:
      decodeBlob(blob)  // OfflineAudioContext → AudioBuffer
      buildWav(audioBuffer)  // PCM 16-bit mono WAV
      if wav: writeFile(wavData)
      if mp3/m4a: convertAudio(wavData, savePath, format)
```

---

## 7. 踩过的坑 & 解决方案 🕳️

> 以下是开发过程中遇到的关键问题和修复方案，避免重复踩坑。

### 7.1 CSP 阻止 Blob URL 媒体加载
**症状**: 音频文件选择后无法播放，控制台报 `ERR_ABORTED`
**原因**: `index.html` 的 CSP `media-src 'self' file:` 不包含 `blob:`
**修复**: `media-src 'self' file: blob:`
**文件**: `index.html`

### 7.2 TypeScript 编译路径不一致 (rootDir)
**症状**: Electron 运行报错，找不到 preload.js
**原因**: `tsconfig.node.json` 未设置 `rootDir: "electron"`，编译产物路径错误
**修复**: 添加 `"rootDir": "electron"`，使用 `module: "NodeNext"` + `moduleResolution: "NodeNext"`
**文件**: `tsconfig.node.json`

### 7.3 AudioService.cleanup() 清空了回调数组
**症状**: 音频加载成功但 Player UI 不更新
**原因**: `loadFromUrl()` 开头调用 `cleanup()`，该方法清空了 `onLoadCallbacks` 数组
**修复**: `cleanup()` 不再清空回调数组——由 React useEffect 管理生命周期
**文件**: `src/services/AudioService.ts`

### 7.4 React 19 StrictMode + useEffect([]) 不执行
**症状**: `<React.StrictMode>` 包裹时，`useEffect(()=>{}, [])` 完全不执行
**原因**: React 19 开发模式下 StrictMode 的 double-invoke 机制与 `[]` 依赖兼容性问题
**修复**: 移除 `main.tsx` 中的 `<React.StrictMode>`
**文件**: `src/main.tsx`

### 7.5 Vite HMR 与 Fast Refresh 不兼容
**症状**: 修改 `PlayerContext.tsx` 后 Vite 做 full reload 而非 HMR
**原因**: `PlayerContext` 导出 `usePlayer` hook，与 Vite 的 Fast Refresh 模块边界要求不兼容
**影响**: 开发体验稍差，不影响功能

### 7.6 Electron 镜像下载失败
**症状**: `npm install electron` 后运行报 "Electron failed to install correctly"
**原因**: 国内网络无法直接下载 Electron 二进制
**修复**: `$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"`
**注意**: 每次启动 Electron 前都需要设置此环境变量

### 7.7 CSP 阻止 WebSocket 连接
**症状**: Vite HMR 无法连接
**原因**: `connect-src` 缺少 `ws:`
**修复**: `connect-src 'self' blob: ws: http://localhost:*`

---

## 8. 开发命令

```bash
# 开发模式 (Vite + Electron 同时启动)
npm run dev

# 分步启动
npm run dev:vite          # 仅 Vite (http://localhost:5173)
npm run dev:electron      # 仅 Electron (连接 Vite)

# 构建
npm run build:all         # Vite build + tsc 主进程

# 打包
npm run package:win       # 构建 + electron-builder NSIS
```

### 网络镜像 (国内环境)
```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:HF_ENDPOINT="https://hf-mirror.com"       # HuggingFace 国内镜像
pip install -i https://mirrors.ustc.edu.cn/pypi/web/simple  # USTC pip 镜像
```

---

## 9. SRT 字幕生成工具 (srtGenerator/)

**技术栈**: Python 3.12 + faster-whisper 1.2.1 (CTranslate2)

```bash
cd srtGenerator
pip install -r requirements.txt

# 单个文件
python audio-to-srt.py audio.mp3

# 批量转换文件夹
python audio-to-srt.py ./audio_folder --batch

# 使用更大模型 (默认 small)
python audio-to-srt.py audio.mp3 --model medium
```

- `audio-to-srt.bat`: 支持拖拽文件和文件夹
- 默认模型: `small` (~500MB, model.bin 需单独下载)
- VAD 过滤: 默认开启 (silence trimming)
- 输出: 与音频同名的 `.srt` 文件 (不含管道符扩展语法)

---

## 9. 偏好与约定

- **UI 语言**: 中文 (按钮/提示)
- **代码注释**: 混合中文 + 英文
- **样式**: Tailwind CSS v4 (无自定义 CSS 文件, 使用 `@import "tailwindcss"`)
- **状态管理**: React Context (非 Redux/Zustand)
- **服务模式**: Singleton 类 + 回调通知 (非 EventEmitter/dependency injection)
- **模块格式**: ESM (Vite) / CommonJS (Electron main + preload)
- **提交规范**: conventional commits (feat/fix/refactor)
- **Vite 端口**: 自动递增 (5173 → 5174 → ...)
- **Electron 加载 URL**: `electron/main.ts` 中硬编码开发端口

---

## 10. 已知问题 / TODO

### 高优先级
- [ ] NSIS 安装包无法生成 (国内网络下载 nsis-resources 超时, 需手动缓存或科学上网)
- [ ] Electron 开发端口硬编码在 `main.ts` (Vite 端口变化时需手动更新)
- [ ] 音频加载失败时无用户可见的错误提示
- [ ] 大文件加载需要 loading 进度指示

### 中优先级
- [ ] 无应用图标 (electron-builder 使用默认 Electron 图标)
- [ ] 无自动更新机制 (electron-updater 未配置)
- [ ] `ffmpeg-static` 约 30MB，增大打包体积
- [ ] 混合对比导出 (原声L/录音R) 被移除，可考虑重新实现
- [ ] 段落循环的句子数量目前硬编码为 3，应改为可配置
- [ ] 无麦克风时的优雅降级处理

### 低优先级 / Post-MVP
- [ ] 波形可视化
- [ ] macOS (DMG) / Linux (AppImage) 支持
- [ ] 视频字幕 (ASS/SSA) 格式支持

---

## 11. 文件内容速查

| 功能区域 | 主要文件 |
|---|---|
| 音频播放引擎 | `src/services/AudioService.ts` |
| 字幕解析 | `src/services/SubParser.ts` |
| 循环控制 | `src/services/LoopService.ts` |
| 录音 | `src/services/RecorderService.ts` |
| 全局状态管理 | `src/context/PlayerContext.tsx` |
| 主入口 UI + 快捷键 | `src/App.tsx` |
| React 入口 | `src/main.tsx` |
| Electron 主进程 (IPC) | `electron/main.ts` |
| Preload 桥接 (API 暴露) | `electron/preload.ts` |
| TypeScript 类型定义 | `src/types/index.ts` |
| 样式 (Tailwind v4) | `src/index.css` |
| CSP + HTML 入口 | `index.html` |
| Vite 配置 | `vite.config.ts` |
| Electron TS 配置 | `tsconfig.node.json` |
| 项目配置 + 打包 | `package.json` |
| 打包输出目录 | `release/` |
| 字幕生成 (Python) | `srtGenerator/audio-to-srt.py` |
| Windows 批处理 | `srtGenerator/audio-to-srt.bat` |
| 用户手册 | `用户手册.html` |
| AI 上下文 (本文件) | `AI_CONTEXT.md` |
| 规范驱动文档 | `openspec/changes/japanese-shadowing-player/` |
