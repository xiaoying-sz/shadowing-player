# Handoff Document — Japanese Shadowing Player (日本語シャドーイング)

> 此文档供 AI 工具在新会话中恢复上下文时使用。
> 项目路径：`D:\CodingAgent\language-player`

---

## 1. 项目概述

Electron + React + TypeScript 桌面应用，专为日语学习者设计的**影子跟读（シャドーイング）**音频播放器。

| 项目 | 值 |
|---|---|
| 技术栈 | Electron 43, React 19, TypeScript 7, Vite 8, Tailwind CSS v4 |
| 构建工具 | Vite (前端), tsc (Electron 主进程), electron-builder (打包) |
| 目标平台 | Windows (NSIS 安装包), 未来支持 macOS DMG |
| 项目路径 | `D:\CodingAgent\language-player\` |
| OpenSpec 文档 | `openspec/changes/japanese-shadowing-player/` |

---

## 2. 已完成功能 ✅

### 2.1 项目脚手架
- [x] Electron + React + TypeScript + Vite 项目初始化
- [x] Tailwind CSS v4 集成
- [x] electron-builder 打包配置 (Windows NSIS)
- [x] 自定义无边框窗口标题栏 (TitleBar)
- [x] 拖放文件加载区域 (DropZone)
- [x] React Context 状态管理 (PlayerContext)

### 2.2 音频播放引擎
- [x] AudioService — play/pause/seek/speed 控制
- [x] 7 档速度选择 (0.5x–2.0x, step 0.25x)
- [x] Electron 原生文件对话框加载音频 (IPC)
- [x] 浏览器模式文件选择 (<input type="file"> 回退)
- [x] 拖放加载音频文件
- [x] ProgressBar — 进度条点击跳转、时间显示
- [x] SpeedSelector — 7 档速度按钮
- [x] TransportControls — 播放/暂停/快进/后退

### 2.3 字幕引擎
- [x] SubParser — SRT 字幕解析
- [x] 同名 SRT 文件自动匹配加载
- [x] 手动加载字幕文件 (对话框 / 拖放)
- [x] `{漢字|よみ}` furigana 语法解析
- [x] 管道符多行解析: `日本語|romaji|中文訳`
- [x] getSentenceAtTime — 根据音频位置获取当前句子

### 2.4 字幕显示 & 日语特性
- [x] SubtitlePanel — 滚动句子列表、当前句高亮
- [x] RubyText — `<ruby>` HTML 标签渲染振假名
- [x] 振假名显示/隐藏切换 (快捷键 F)
- [x] 四种显示模式: 日本語 / +ローマ字 / +中文訳 / 全部表示
- [x] 字幕显示/隐藏切换 (快捷键 S)
- [x] 点击句子跳转
- [x] 空状态提示 "加载字幕"

### 2.5 句子导航 & 循环控制
- [x] prevSentence / nextSentence 导航
- [x] 快捷键 ↑↓ 导航句子
- [x] LoopModeSelector — 关 / 单句 / 段落 / A-B
- [x] LoopService — 句子循环 (自动跳转到句子起点)
- [x] 段落循环 (N 个连续句子)
- [x] A-B 循环 (用户标记起止点)
- [x] 循环边界指示器 (预留接口)

### 2.6 影子录音 & 导出
- [x] RecorderService — MediaRecorder API 录音
- [x] 麦克风权限请求及错误处理
- [x] ShadowPanel — 开始/停止按钮
- [x] 可调录音延迟滑块 (200–1000ms, 默认 400ms)
- [x] 原声音量滑块
- [x] 录音状态指示 (idle / recording / done)
- [x] 纯人声 WAV 导出 (Electron 保存对话框)
- [x] 立体声混合导出 (L:原声/R:人声) 接口预留
- [x] 快捷键 R 录音切换

### 2.7 跨平台兼容
- [x] Electron 模式：IPC 主进程读取文件 → base64 → Blob URL
- [x] 浏览器模式：File API → URL.createObjectURL → Blob URL
- [x] 拖放支持 Electron 和浏览器双模式

---

## 3. 踩过的坑 & 解决方案 🕳️

### 3.1 CSP 阻止 Blob URL 媒体加载
**症状**: 音频文件选择后无法播放，控制台报 `ERR_ABORTED`
**原因**: `index.html` 的 CSP `media-src 'self' file:` 不包含 `blob:`，而 `URL.createObjectURL()` 创建的是 `blob:http://...` URL
**修复**: `media-src 'self' file: blob:`
**文件**: `index.html`

### 3.2 TypeScript 编译路径不一致 (rootDir)
**症状**: Electron 运行报错，找不到 preload.js
**原因**: `tsconfig.node.json` 未设置 `rootDir: "electron"`，编译产物在 `dist-electron/electron/` 子目录而非直接 `dist-electron/`
**修复**: 添加 `"rootDir": "electron"`，使用 `module: "NodeNext"` + `moduleResolution: "NodeNext"`
**文件**: `tsconfig.node.json`

### 3.3 AudioService.cleanup() 清空了回调数组
**症状**: 音频加载成功 (`canplaythrough` 触发) 但 `onLoadCallbacks` 为 0，Player UI 不显示
**原因**: `loadFromUrl()` 开头调用 `this.cleanup()`，该方法清空了 `onLoadCallbacks` 数组，导致效果 (useEffect) 注册的回调丢失
**修复**: `cleanup()` 不再清空 `onLoadCallbacks/onTimeUpdateCallbacks/onEndedCallbacks`——这些由 React 组件的 useEffect 管理生命周期
**文件**: `src/services/AudioService.ts`

### 3.4 React 19 StrictMode + useEffect([]) 不执行
**症状**: 使用 `<React.StrictMode>` 包裹时，`useEffect(()=>{}, [])` 完全不执行
**原因**: React 19 开发模式下 StrictMode 的 double-invoke 机制与某些 `[]` 依赖行为存在兼容性问题
**修复**: 移除 `main.tsx` 中的 `<React.StrictMode>` 包裹
**文件**: `src/main.tsx`

### 3.5 Vite HMR 与 Fast Refresh 不兼容
**症状**: 修改 `PlayerContext.tsx` 后 Vite 不做 HMR 而是做 full reload
**原因**: `PlayerContext` 导出 `usePlayer` hook，与 Vite 的 Fast Refresh 模块边界要求不兼容
**影响**: 开发体验稍差，但不影响功能

### 3.6 Electron 镜像下载失败
**症状**: `npm install electron` 后运行报 "Electron failed to install correctly"
**原因**: 国内网络无法直接下载 Electron 二进制
**修复**: 设置淘宝镜像 `$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"`
**注意**: 每次启动 Electron 前都需要设置此环境变量

### 3.7 CSP 阻止 WebSocket 连接
**症状**: Vite HMR 无法连接
**原因**: `connect-src` 缺少 `ws:`
**修复**: `connect-src 'self' blob: ws: http://localhost:*`

---

## 4. 项目结构

```
language-player/
├── electron/
│   ├── main.ts           # Electron 主进程 (窗口管理, IPC)
│   └── preload.ts        # contextBridge API 暴露
├── src/
│   ├── components/
│   │   ├── TitleBar.tsx           # 自定义标题栏
│   │   ├── DropZone.tsx           # 拖放加载区域
│   │   ├── TransportControls.tsx  # 播放控制
│   │   ├── ProgressBar.tsx        # 进度条
│   │   ├── SpeedSelector.tsx      # 7档速度
│   │   ├── SubtitlePanel.tsx      # 字幕面板
│   │   ├── RubyText.tsx           # 振假名渲染
│   │   ├── DisplayModeSelector.tsx # 显示模式
│   │   ├── LoopModeSelector.tsx    # 循环模式
│   │   └── ShadowPanel.tsx         # 录音面板
│   ├── services/
│   │   ├── AudioService.ts    # 音频引擎 (单例)
│   │   ├── SubParser.ts       # SRT 解析器
│   │   ├── LoopService.ts     # 循环控制 (单例)
│   │   └── RecorderService.ts # 录音 (单例)
│   ├── context/
│   │   └── PlayerContext.tsx   # 全局状态 + 动作
│   ├── types/index.ts          # 类型定义
│   ├── App.tsx                 # 主应用 + 快捷键
│   ├── main.tsx               # 入口 (无 StrictMode)
│   └── index.css              # Tailwind CSS v4
├── openspec/                   # OpenSpec 项目文档
├── index.html                  # HTML + CSP
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # 前端 TS 配置
├── tsconfig.node.json          # Electron TS 配置 (CommonJS)
├── electron-builder.yml        # 打包配置
└── package.json
```

---

## 5. 关键架构决策

### 5.1 音频加载策略
```
Electron: IPC dialog:openAudio → fs:readAudioFile (base64) → Blob → Blob URL → HTMLAudioElement
Browser:  <input type="file"> / Drag & Drop → File → URL.createObjectURL → HTMLAudioElement
```

### 5.2 状态管理
- 使用 React Context (`PlayerContext`) 而非 Redux/Zustand
- `AudioService` / `LoopService` / `RecorderService` 是**单例类**，非 React 组件
- Service 通过回调模式与 React 状态同步 (`onLoad`, `onTimeUpdate`, `onEnded`)
- `useEffect` 在挂载时注册回调，`[]` 依赖运行一次
- 回调内使用 **functional setState** `setState(prev => ...)` 避免闭包过期

### 5.3 CSP 策略
```html
default-src 'self'; script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline'; media-src 'self' file: blob:;
connect-src 'self' blob: ws: http://localhost:*; img-src 'self' data: blob:;
```

### 5.4 Electron 安全配置
```ts
contextIsolation: true,  // 必须
nodeIntegration: false,  // 必须
sandbox: false,          // 需要 preload 访问 Node API
preload: path.join(__dirname, 'preload.js')
```

---

## 6. 开发命令

```bash
# 设置淘宝镜像 (每次新终端都需要)
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# 启动开发环境 (Vite + Electron 并行)
npm run dev

# 或分步启动
npm run dev:vite        # 终端1: Vite (http://localhost:5173)
npm run dev:electron    # 终端2: Electron 窗口

# 构建
npm run build:all       # 构建前端 + Electron

# 打包 Windows 安装程序
npm run package:win
```

---

## 7. 剩余任务 📋

### 7.1 高优先级
- [ ] **WAV 导出格式转换**: 目前导出是 WebM 格式，需要 OfflineAudioContext 转为 WAV
- [ ] **录音时原声混合**: 影子录音时控制原声音量（目前滑块 UI 已实现，逻辑待接入）
- [ ] **立体声混合导出**: L 声道原声 + R 声道人声

### 7.2 中优先级
- [ ] **音频加载状态/错误提示**: 目前加载失败无用户可见提示
- [ ] **大文件进度指示**: 大 MP3 文件加载时间较长，需 loading 状态
- [ ] **键盘快捷键验证**: 确保所有快捷键在所有平台上正常工作
- [ ] **无麦克风降级处理**: 当检测不到麦克风时优雅提示

### 7.3 低优先级 / 优化
- [ ] **Waveform 可视化**: 音频波形显示 (post-MVP)
- [ ] **应用图标**: 替换默认 Electron 图标
- [ ] **macOS 打包**: electron-builder DMG 配置
- [ ] **段落长度可配置**: 段落循环的句子数量目前硬编码为 3

---

## 8. 已知问题

1. **Vite HMR full reload**: 修改 `PlayerContext.tsx` 会触发完整页面重载，开发时注意保存和等待
2. **Electron 需要镜像**: 中国网络环境下需要 `ELECTRON_MIRROR` 环境变量
3. **测试 WAV 文件已删除**: `test-audio.wav` 已从项目中移除，测试需用真实音频文件
4. **浏览器模式 electronAPI 不可用**: 浏览器中 `window.electronAPI` 为 undefined，文件对话框由 `<input type="file">` 回退替代

---

## 9. 文件内容速查

| 功能区域 | 主要文件 |
|---|---|
| 音频播放 | `src/services/AudioService.ts` |
| 字幕解析 | `src/services/SubParser.ts` |
| 循环控制 | `src/services/LoopService.ts` |
| 录音 | `src/services/RecorderService.ts` |
| 状态管理 | `src/context/PlayerContext.tsx` |
| 主入口 UI | `src/App.tsx` |
| Electron 主进程 | `electron/main.ts` |
| Preload 桥接 | `electron/preload.ts` |
| 类型定义 | `src/types/index.ts` |
| 样式 (Tailwind) | `src/index.css` |
| CSP + 入口 HTML | `index.html` |
| OpenSpec 提案 | `openspec/changes/japanese-shadowing-player/proposal.md` |
| OpenSpec 设计 | `openspec/changes/japanese-shadowing-player/design.md` |
| OpenSpec 任务 | `openspec/changes/japanese-shadowing-player/tasks.md` |
